import { NextRequest, NextResponse } from 'next/server';

import OpenAI from 'openai';

import { PROMPT_GENERATION_RATE_LIMITS } from '~/lib/constants';
import rateLimiter from '~/lib/simple-rate-limit';
import { getSupabaseServerClient } from '~/lib/supabase/server';

interface GeneratePromptsRequest {
  description: string;
  fieldType: 'context_prompt' | 'starting_message' | 'both';
  agentName?: string;
  industry?: string;
}

// Lazy initialization of OpenAI client to avoid build-time errors
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// Hardcoded sections that follow ElevenLabs best practices
// These rarely change and ensure consistent quality
const TONE_SECTION = `# Tone

- Use natural speech patterns with occasional filler words like "um," "well," or "you know" to sound authentic
- Keep responses conversational and concise - aim for 2-3 sentences at a time
- Mirror the user's energy level and formality
- Use brief pauses (commas, ellipses) to create natural rhythm
- Speak numbers and addresses clearly: "one two three Main Street" not "123 Main St"
- Periodically check understanding with phrases like "Does that make sense?" or "Any questions about that?"
- Adapt technical language based on user's demonstrated knowledge level`;

const GUARDRAILS_SECTION = `# Guardrails

- **Stay On Topic**: If asked about unrelated topics, politely redirect: "That's outside my area, but I'm happy to help with [your purpose]"
- **Honesty**: If you don't know something, say "I'm not sure about that" rather than guessing
- **Privacy**: Never ask for or store sensitive information unless explicitly required for your function
- **Boundaries**: Maintain your professional role - you're here to help, not to be a friend or therapist
- **Brevity**: Keep responses under 30 seconds of speaking time when possible
- **No Fabrication**: Only provide information you're certain about`;

const TOOLS_SECTION = `# Tools

Currently, you rely on the information provided in this conversation. If additional resources or integrations are added:
- Use tools seamlessly without drawing unnecessary attention to them
- If a tool fails, acknowledge gracefully and offer alternatives
- Always verify tool outputs before sharing with users`;

const STANDARD_CONVERSATION_FLOW = `**Conversation Flow:**
1. Greet warmly and identify the user's immediate need
2. Ask clarifying questions to fully understand their situation
3. Provide clear, actionable information or guidance
4. Check for understanding and additional questions
5. Confirm next steps or summarize key points
6. End on a positive, helpful note

**Success Criteria:**
- User feels heard and understood
- User receives accurate, relevant information
- Conversation feels natural and efficient
- User knows their next steps (if applicable)`;

/**
 * Stream OpenAI context prompt generation
 */
async function* streamContextPrompt(
  description: string,
  agentName?: string,
  industry?: string,
): AsyncGenerator<string, void, unknown> {
  // Extract name from description if present
  const nameMatch = description.match(
    /(?:your name is|name is|called)\s+([A-Z][a-z]+)/i,
  );
  const extractedName = nameMatch ? nameMatch[1] : null;
  const finalAgentName = extractedName || agentName || 'AI Assistant';

  const industryContext = industry ? ` in the ${industry} sector` : '';

  const systemPrompt = `You are an expert at creating voice agent prompts following ElevenLabs best practices.
Generate a comprehensive system prompt that follows this exact structure:

# Personality
- **Name**: [Agent Name - USE EXACTLY THE NAME PROVIDED]
- **Role**: [Description of what the agent does]
- **Traits**: [3-5 relevant personality traits]
- **Background**: [Brief context about the agent's expertise]

# Environment
- **Channel**: Voice conversation (phone or video call)
- **User Context**: [Who calls and why]
- **Setting**: [Conversation setting]
- **Expectations**: [What users expect]

${TONE_SECTION}

# Goal
[Primary objective statement]

${STANDARD_CONVERSATION_FLOW}

${GUARDRAILS_SECTION}

${TOOLS_SECTION}

CRITICAL RULES - YOU MUST FOLLOW THESE EXACTLY:
1. Keep the Tone, Guardrails, and Tools sections exactly as provided above
2. Customize only the Personality, Environment, and Goal sections
3. For the Name field, you MUST use the EXACT name provided - DO NOT make up a different name
4. DO NOT change, substitute, or modify any names, organizations, or specific details
5. Optimize for voice conversation`;

  const userPrompt = `Create a voice agent system prompt with these EXACT details:
- Agent Name: ${finalAgentName} (USE THIS EXACT NAME - DO NOT CHANGE IT)
- Role/Description: ${description}${industryContext}

YOU MUST USE THE NAME "${finalAgentName}" IN THE NAME FIELD. DO NOT USE ANY OTHER NAME.

Generate a complete prompt following the structure provided.`;

  try {
    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more accurate following of instructions
      max_tokens: 1500,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        // Filter out training data references that OpenAI might add (including preceding commas/spaces)
        const filtered = content.replace(
          /[,\s]*You are trained on data up to [^.]+\.\s*/gi,
          '',
        );
        if (filtered) {
          yield filtered;
        }
      }
    }
  } catch (error) {
    console.error('OpenAI streaming failed, using fallback:', error);
    // Stream the fallback prompt character by character for consistency
    const fallback = createFallbackPrompt(
      description,
      finalAgentName,
      industryContext,
    );
    yield fallback;
  }
}

/**
 * Stream OpenAI starting message generation
 */
async function* streamStartingMessage(
  description: string,
  agentName?: string,
): AsyncGenerator<string, void, unknown> {
  const agentNameText = agentName || 'your assistant';

  const systemPrompt = `You are an expert at creating engaging opening messages for voice AI agents.
Create a warm, natural, professional greeting that:
- Is optimized for voice (sounds natural when spoken)
- Is concise (1-2 sentences max)
- Immediately establishes the agent's role
- Invites the user to share their need
- Feels authentic and human

Examples:
- "Hi, this is Sarah from Customer Support. Thanks for calling! What can I help you with today?"
- "Hello! This is Alex. I'm here to answer any questions you have about your account. What brings you in?"
- "Hey there, this is Jamie. How can I make your day easier?"

Keep it professional yet warm. Avoid being too formal or robotic.`;

  const userPrompt = `Create an opening message for a voice agent named "${agentNameText}" whose role is: ${description}

Generate ONLY the greeting message, nothing else.`;

  try {
    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 100,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        // Remove quotes if OpenAI adds them and filter training data references
        let cleaned = content.replace(/^["']|["']$/g, '');
        cleaned = cleaned.replace(
          /[,\s]*You are trained on data up to [^.]+\.\s*/gi,
          '',
        );
        if (cleaned) {
          yield cleaned;
        }
      }
    }
  } catch (error) {
    console.error('OpenAI streaming failed, using fallback:', error);
    yield `Hi, this is ${agentNameText}. Thanks for calling! How can I help you today?`;
  }
}

/**
 * Fallback template if OpenAI fails
 */
function createFallbackPrompt(
  description: string,
  agentName: string,
  industryContext: string,
): string {
  const roleDescription =
    description.charAt(0).toUpperCase() + description.slice(1);

  const personality = `# Personality

- **Name**: ${agentName}
- **Role**: ${roleDescription}${industryContext}
- **Traits**: Professional, empathetic, helpful, and authentic
- **Background**: Trained to assist users with their specific needs while maintaining a warm, conversational approach`;

  const environment = `# Environment

- **Channel**: Voice conversation (phone or video call)
- **User Context**: Users may be busy, multitasking, or calling during various times of day
- **Setting**: One-on-one conversation where the user has initiated contact
- **Expectations**: Natural, flowing conversation without robotic patterns`;

  const goal = `# Goal

Your primary objective is to help users effectively while creating a positive experience.

${STANDARD_CONVERSATION_FLOW}`;

  return [
    personality,
    environment,
    TONE_SECTION,
    goal,
    GUARDRAILS_SECTION,
    TOOLS_SECTION,
  ].join('\n\n');
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // 1. Check authentication (optional - allows public access)
    const supabase = getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Determine rate limit key - use user ID if authenticated, otherwise use a generic key
    // Note: NextRequest doesn't expose IP directly, so we use 'public' for unauthenticated
    const rateLimitKey = user?.id || 'public';
    const isAuthenticated = !!user;

    // 3. Apply rate limiting (stricter for unauthenticated users)
    const minuteLimit = rateLimiter.check(
      `prompt-gen:minute:${rateLimitKey}`,
      isAuthenticated
        ? PROMPT_GENERATION_RATE_LIMITS.PER_MINUTE
        : Math.floor(PROMPT_GENERATION_RATE_LIMITS.PER_MINUTE / 2), // Half the limit for public
      60 * 1000, // 1 minute
    );

    if (!minuteLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: `You can generate up to ${isAuthenticated ? PROMPT_GENERATION_RATE_LIMITS.PER_MINUTE : Math.floor(PROMPT_GENERATION_RATE_LIMITS.PER_MINUTE / 2)} prompts per minute. Please try again in ${Math.ceil((minuteLimit.resetAt - Date.now()) / 1000)} seconds.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(
              isAuthenticated
                ? PROMPT_GENERATION_RATE_LIMITS.PER_MINUTE
                : Math.floor(PROMPT_GENERATION_RATE_LIMITS.PER_MINUTE / 2),
            ),
            'X-RateLimit-Remaining': String(minuteLimit.remaining),
            'X-RateLimit-Reset': new Date(minuteLimit.resetAt).toISOString(),
            'Retry-After': String(
              Math.ceil((minuteLimit.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    // Apply per-hour rate limit
    const hourLimit = rateLimiter.check(
      `prompt-gen:hour:${rateLimitKey}`,
      isAuthenticated
        ? PROMPT_GENERATION_RATE_LIMITS.PER_HOUR
        : Math.floor(PROMPT_GENERATION_RATE_LIMITS.PER_HOUR / 2), // Half the limit for public
      60 * 60 * 1000, // 1 hour
    );

    if (!hourLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hourly rate limit exceeded',
          message: `You can generate up to ${isAuthenticated ? PROMPT_GENERATION_RATE_LIMITS.PER_HOUR : Math.floor(PROMPT_GENERATION_RATE_LIMITS.PER_HOUR / 2)} prompts per hour. Please try again later.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(
              isAuthenticated
                ? PROMPT_GENERATION_RATE_LIMITS.PER_HOUR
                : Math.floor(PROMPT_GENERATION_RATE_LIMITS.PER_HOUR / 2),
            ),
            'X-RateLimit-Remaining': String(hourLimit.remaining),
            'X-RateLimit-Reset': new Date(hourLimit.resetAt).toISOString(),
            'Retry-After': String(
              Math.ceil((hourLimit.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    // Apply global rate limit (prevents DDoS across all users)
    const globalLimit = rateLimiter.check(
      'prompt-gen:global',
      PROMPT_GENERATION_RATE_LIMITS.GLOBAL_PER_MINUTE,
      60 * 1000, // 1 minute
    );

    if (!globalLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service temporarily unavailable',
          message:
            'The prompt generation service is currently experiencing high traffic. Please try again in a moment.',
        },
        {
          status: 503,
          headers: {
            'Retry-After': String(
              Math.ceil((globalLimit.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    const body = (await request.json()) as GeneratePromptsRequest;
    const { description, fieldType, agentName, industry } = body;

    if (!description || !description.trim()) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 },
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service configuration error',
          message: 'OpenAI API key is not configured. Please contact support.',
        },
        { status: 503 },
      );
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Helper to send SSE-formatted data
          const sendEvent = (event: string, data: unknown) => {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          };

          // Send start event
          sendEvent('start', { success: true });

          // Generate context prompt if requested
          if (fieldType === 'context_prompt' || fieldType === 'both') {
            let contextPrompt = '';
            sendEvent('context_prompt_start', {});

            for await (const chunk of streamContextPrompt(
              description,
              agentName,
              industry,
            )) {
              contextPrompt += chunk;
              sendEvent('context_prompt_chunk', { chunk });
            }

            sendEvent('context_prompt_complete', { content: contextPrompt });
          }

          // Generate starting message if requested
          if (fieldType === 'starting_message' || fieldType === 'both') {
            let startingMessage = '';
            sendEvent('starting_message_start', {});

            for await (const chunk of streamStartingMessage(
              description,
              agentName,
            )) {
              startingMessage += chunk;
              sendEvent('starting_message_chunk', { chunk });
            }

            sendEvent('starting_message_complete', {
              content: startingMessage,
            });
          }

          // Send completion event
          sendEvent('done', { success: true });
          controller.close();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          const message = `event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`;
          controller.enqueue(encoder.encode(message));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-RateLimit-Limit-Minute': String(
          PROMPT_GENERATION_RATE_LIMITS.PER_MINUTE,
        ),
        'X-RateLimit-Remaining-Minute': String(minuteLimit.remaining),
        'X-RateLimit-Limit-Hour': String(
          PROMPT_GENERATION_RATE_LIMITS.PER_HOUR,
        ),
        'X-RateLimit-Remaining-Hour': String(hourLimit.remaining),
      },
    });
  } catch (error) {
    console.error('Error generating prompts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
