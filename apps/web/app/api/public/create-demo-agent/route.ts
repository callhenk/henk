import { NextRequest, NextResponse } from 'next/server';

import featuresFlagConfig from '~/config/feature-flags.config';
import {
  DEMO_RATE_LIMITS,
  type VoiceGender,
  getDefaultVoiceId,
} from '~/lib/constants';
import rateLimiter, { getClientIp } from '~/lib/simple-rate-limit';
import { logger } from '~/lib/utils';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders, status: 204 });
}

interface CreateDemoAgentRequest {
  name: string;
  contextPrompt: string;
  startingMessage?: string;
  voiceGender?: VoiceGender;
  knowledgeBase?: Record<string, unknown>;
  conversationConfig?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    // Check if self-onboard demo is enabled
    if (!featuresFlagConfig.enableSelfOnboardDemo) {
      return NextResponse.json(
        { error: 'This feature is currently disabled' },
        { status: 403, headers: corsHeaders },
      );
    }

    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Apply rate limits
    const hourlyLimit = rateLimiter.check(
      `demo:hourly:${clientIp}`,
      DEMO_RATE_LIMITS.PER_HOUR,
      60 * 60 * 1000, // 1 hour
    );

    if (!hourlyLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `You can create up to ${DEMO_RATE_LIMITS.PER_HOUR} agents per hour. Please try again later.`,
          retryAfter: Math.ceil((hourlyLimit.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'X-RateLimit-Limit': String(DEMO_RATE_LIMITS.PER_HOUR),
            'X-RateLimit-Remaining': String(hourlyLimit.remaining),
            'X-RateLimit-Reset': new Date(hourlyLimit.resetAt).toISOString(),
            'Retry-After': String(
              Math.ceil((hourlyLimit.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    const dailyLimit = rateLimiter.check(
      `demo:daily:${clientIp}`,
      DEMO_RATE_LIMITS.PER_DAY,
      24 * 60 * 60 * 1000, // 24 hours
    );

    if (!dailyLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Daily rate limit exceeded',
          message: `You can create up to ${DEMO_RATE_LIMITS.PER_DAY} agents per day. Please try again tomorrow.`,
          retryAfter: Math.ceil((dailyLimit.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'X-RateLimit-Limit': String(DEMO_RATE_LIMITS.PER_DAY),
            'X-RateLimit-Remaining': String(dailyLimit.remaining),
            'X-RateLimit-Reset': new Date(dailyLimit.resetAt).toISOString(),
            'Retry-After': String(
              Math.ceil((dailyLimit.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    // Global rate limit
    const globalLimit = rateLimiter.check(
      'demo:global',
      DEMO_RATE_LIMITS.GLOBAL_PER_HOUR,
      60 * 60 * 1000,
    );

    if (!globalLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          message:
            'The demo service is currently experiencing high traffic. Please try again in a few minutes.',
          retryAfter: Math.ceil((globalLimit.resetAt - Date.now()) / 1000),
        },
        {
          status: 503,
          headers: {
            ...corsHeaders,
            'Retry-After': String(
              Math.ceil((globalLimit.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    // Parse and validate request body
    const body = (await request.json()) as CreateDemoAgentRequest;
    const {
      name,
      contextPrompt,
      startingMessage,
      voiceGender = 'feminine', // Default to feminine if not specified
      knowledgeBase,
      conversationConfig,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Agent name is required' },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!contextPrompt?.trim()) {
      return NextResponse.json(
        { error: 'Context prompt is required' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Use the provided name directly for demos (no extraction needed)
    // The name is already set to match the use case on the frontend
    const finalAgentName = name.trim();

    logger.debug('Using provided agent name for demo', {
      component: 'PublicDemoAgent',
      action: 'setName',
      agentName: finalAgentName,
    });

    // Create ElevenLabs agent
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      logger.warn('ElevenLabs API key not configured', {
        component: 'PublicDemoAgent',
        action: 'createAgent',
      });
      return NextResponse.json(
        {
          error: 'Demo service temporarily unavailable',
          message:
            'The demo service is not configured. Please contact support.',
        },
        { status: 503, headers: corsHeaders },
      );
    }

    // Get the default voice ID based on gender
    const voiceId = getDefaultVoiceId(voiceGender);

    // Build or merge conversation config with TTS settings
    const finalConversationConfig = conversationConfig
      ? {
          ...conversationConfig,
          tts: {
            voice_id: voiceId, // Always set the voice based on gender selection
          },
        }
      : {
          agent: {
            first_message:
              startingMessage || 'Hello! How can I help you today?',
            language: 'en',
            prompt: {
              prompt: contextPrompt.trim(),
              llm: 'gpt-4o-mini',
              max_tokens: 1024,
            },
          },
          tts: {
            voice_id: voiceId,
          },
        };

    const elevenLabsAgentConfig: Record<string, unknown> = {
      name: finalAgentName,
      conversation_config: finalConversationConfig,
      context_data: {
        donor_context: contextPrompt.trim(),
      },
    };

    logger.debug('Creating ElevenLabs agent for demo', {
      component: 'PublicDemoAgent',
      action: 'createElevenLabsAgent',
      agentName: finalAgentName,
      voiceGender,
      voiceId,
    });

    const headers: Record<string, string> = {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (process.env.ELEVENLABS_WORKSPACE_ID) {
      headers['xi-workspace-id'] = process.env.ELEVENLABS_WORKSPACE_ID;
    }

    const elevenLabsResp = await fetch(
      'https://api.elevenlabs.io/v1/convai/agents/create',
      {
        method: 'POST',
        headers,
        body: JSON.stringify(elevenLabsAgentConfig),
      },
    );

    const raw = await elevenLabsResp.text();
    let elevenlabsData: unknown = {};
    try {
      elevenlabsData = raw ? JSON.parse(raw) : {};
    } catch {
      // ignore JSON parse error
    }

    if (!elevenLabsResp.ok) {
      logger.error(
        'ElevenLabs agent creation failed',
        new Error('API request failed'),
        {
          component: 'PublicDemoAgent',
          action: 'createElevenLabsAgent',
          status: elevenLabsResp.status,
        },
      );
      return NextResponse.json(
        {
          error:
            ((elevenlabsData as Record<string, unknown>)?.error as
              | string
              | undefined) || 'Failed to create voice agent',
        },
        { status: elevenLabsResp.status, headers: corsHeaders },
      );
    }

    const elevenlabsAgentId: string | null = (() => {
      const root = elevenlabsData as Record<string, unknown>;
      const data = root?.data as Record<string, unknown> | undefined;
      const idFromData = (data?.agent_id as string | undefined) ?? null;
      const idFromRoot = (root?.agent_id as string | undefined) ?? null;
      return idFromData ?? idFromRoot;
    })();

    if (!elevenlabsAgentId) {
      return NextResponse.json(
        { error: 'Failed to get agent ID from ElevenLabs' },
        { status: 500, headers: corsHeaders },
      );
    }

    logger.info('Demo agent created successfully', {
      component: 'PublicDemoAgent',
      action: 'createAgent',
      agentName: finalAgentName,
      elevenlabsAgentId,
      clientIp,
    });

    return NextResponse.json(
      {
        success: true,
        agent: {
          name: finalAgentName,
          elevenlabs_agent_id: elevenlabsAgentId,
        },
      },
      {
        headers: {
          ...corsHeaders,
          'X-RateLimit-Limit-Hourly': String(DEMO_RATE_LIMITS.PER_HOUR),
          'X-RateLimit-Remaining-Hourly': String(hourlyLimit.remaining),
          'X-RateLimit-Limit-Daily': String(DEMO_RATE_LIMITS.PER_DAY),
          'X-RateLimit-Remaining-Daily': String(dailyLimit.remaining),
        },
      },
    );
  } catch (error) {
    logger.error(
      'Public demo agent creation error',
      error instanceof Error ? error : new Error(String(error)),
      {
        component: 'PublicDemoAgent',
        action: 'createAgent',
      },
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders },
    );
  }
}
