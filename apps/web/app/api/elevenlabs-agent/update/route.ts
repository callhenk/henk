import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function PATCH(request: NextRequest) {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const supabase = getSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders },
      );
    }

    // Parse request body
    const { agent_id, updates, knowledge_base_objects } = await request.json();

    if (!agent_id) {
      return NextResponse.json(
        { success: false, error: 'agent_id is required' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Get ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500, headers: corsHeaders },
      );
    }

    // Transform updates to match ElevenLabs API structure
    // We'll gradually build a single payload instead of overwriting
    const transformedUpdates: Record<string, unknown> = {};

    type ConversationConfig = {
      tts?: { voice_id?: string };
      agent?: {
        first_message?: string;
        prompt?: Record<string, unknown>;
      };
    };

    // Always pass through context_data if provided
    if (updates && updates.context_data) {
      transformedUpdates.context_data = updates.context_data;
    }

    // Voice update → conversation_config.tts.voice_id
    if (updates && updates.voice_id) {
      const currentConfig =
        (transformedUpdates.conversation_config as ConversationConfig) || {};
      transformedUpdates.conversation_config = {
        ...currentConfig,
        tts: {
          ...currentConfig.tts,
          voice_id: updates.voice_id,
        },
      };
      delete updates.voice_id;
    }

    // Starting message → conversation_config.agent.first_message
    if (updates && updates.starting_message) {
      const currentConfig =
        (transformedUpdates.conversation_config as ConversationConfig) || {};
      transformedUpdates.conversation_config = {
        ...currentConfig,
        agent: {
          ...currentConfig.agent,
          first_message: updates.starting_message,
        },
      };
      delete updates.starting_message;
    }

    // We may need current agent prompt to merge safely when updating prompt/knowledge base
    let currentPrompt: Record<string, unknown> | null = null;
    const ensureCurrentPrompt = async () => {
      if (currentPrompt) return currentPrompt;
      const agentResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/agents/${agent_id}`,
        {
          headers: {
            'xi-api-key': apiKey,
          },
        },
      );
      if (!agentResponse.ok) {
        throw new Error(
          `Failed to fetch agent details: ${agentResponse.statusText}`,
        );
      }
      const agentData = await agentResponse.json();
      currentPrompt = agentData.conversation_config?.agent?.prompt || {};
      return currentPrompt;
    };

    // If donor_context is provided (either at root or within context_data),
    // update the agent LLM prompt text and concatenate existing FAQs from database.
    const donorContextFromRoot = updates?.donor_context as string | undefined;
    const donorContextFromContextData = updates?.context_data?.donor_context as
      | string
      | undefined;
    const newPromptText = donorContextFromRoot || donorContextFromContextData;
    if (newPromptText && typeof newPromptText === 'string') {
      const promptObj = await ensureCurrentPrompt();

      // Get existing FAQs from database (not from ElevenLabs prompt)
      // We need to fetch the current agent data from our database to get FAQs
      let faqSection = '';
      if (agent_id) {
        try {
          // Get agent data from Supabase to access current FAQs
          const { data: agentData } = await supabase
            .from('agents')
            .select('faqs')
            .eq('elevenlabs_agent_id', agent_id)
            .single();

          if (agentData?.faqs && Array.isArray(agentData.faqs)) {
            faqSection = '\n\nFrequently Asked Questions:\n';
            (
              agentData.faqs as Array<{ question: string; answer: string }>
            ).forEach((faq, index) => {
              if (faq.question && faq.answer) {
                faqSection += `Q${index + 1}: ${faq.question}\nA${index + 1}: ${faq.answer}\n\n`;
              }
            });
          }
        } catch (error) {
          console.log('Could not fetch existing FAQs:', error);
        }
      }

      // Combine new prompt text with existing FAQ section from database
      const updatedPrompt = newPromptText + faqSection;

      const currentConfig =
        (transformedUpdates.conversation_config as ConversationConfig) || {};
      transformedUpdates.conversation_config = {
        ...currentConfig,
        agent: {
          ...currentConfig.agent,
          prompt: {
            ...promptObj,
            prompt: updatedPrompt,
          },
        },
      };
      // Keep donor_context available in context_data for reference as well
      transformedUpdates.context_data = {
        ...(transformedUpdates.context_data || {}),
        donor_context: newPromptText,
      };
      if (updates?.donor_context) delete updates.donor_context;
    }

    // Handle FAQs - concatenate them with existing context prompt from database
    if (updates && updates.faqs && Array.isArray(updates.faqs)) {
      const promptObj = await ensureCurrentPrompt();

      // Get existing context prompt from database (donor_context)
      let contextPrompt = '';
      if (agent_id) {
        try {
          // Get agent data from Supabase to access current donor_context
          const { data: agentData } = await supabase
            .from('agents')
            .select('donor_context')
            .eq('elevenlabs_agent_id', agent_id)
            .single();

          contextPrompt = agentData?.donor_context || '';
        } catch (error) {
          console.log('Could not fetch existing context prompt:', error);
        }
      }

      // Build FAQ section for the prompt
      let faqSection = '';
      if (updates.faqs.length > 0) {
        faqSection = '\n\nFrequently Asked Questions:\n';
        updates.faqs.forEach(
          (faq: { question: string; answer: string }, index: number) => {
            if (faq.question && faq.answer) {
              faqSection += `Q${index + 1}: ${faq.question}\nA${index + 1}: ${faq.answer}\n\n`;
            }
          },
        );
      }

      // Combine context prompt with new FAQ section
      const updatedPrompt = contextPrompt + faqSection;

      const currentConfig =
        (transformedUpdates.conversation_config as ConversationConfig) || {};
      transformedUpdates.conversation_config = {
        ...currentConfig,
        agent: {
          ...currentConfig.agent,
          prompt: {
            ...promptObj,
            prompt: updatedPrompt,
          },
        },
      };
    }

    // Handle knowledge base linking
    if (knowledge_base_objects) {
      console.log('Linking knowledge base objects to agent:', {
        agent_id,
        knowledge_base_objects,
      });
      const promptObj = await ensureCurrentPrompt();
      const currentConfig =
        (transformedUpdates.conversation_config as ConversationConfig) || {};
      transformedUpdates.conversation_config = {
        ...currentConfig,
        agent: {
          ...currentConfig.agent,
          prompt: {
            ...promptObj,
            knowledge_base: knowledge_base_objects,
          },
        },
      };
      console.log(
        'Transformed updates for knowledge base:',
        transformedUpdates,
      );
    }

    console.log('Making API call to ElevenLabs:', {
      url: `https://api.elevenlabs.io/v1/convai/agents/${agent_id}`,
      method: 'PATCH',
      body: transformedUpdates,
    });

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${agent_id}`,
      {
        method: 'PATCH',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          Object.keys(transformedUpdates).length
            ? transformedUpdates
            : updates || {},
        ),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      // Return structured error response
      return NextResponse.json(
        {
          success: false,
          error:
            errorData.detail?.message ||
            errorData.detail ||
            response.statusText,
          errorCode: errorData.detail?.status || 'unknown_error',
          statusCode: response.status,
        },
        { status: response.status, headers: corsHeaders },
      );
    }

    const updatedAgent = await response.json();

    return NextResponse.json(
      {
        success: true,
        data: updatedAgent,
        message: 'ElevenLabs agent updated successfully',
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error updating ElevenLabs agent:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update ElevenLabs agent',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
