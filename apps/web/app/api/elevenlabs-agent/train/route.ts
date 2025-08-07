import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request: NextRequest) {
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
    const {
      agent_id,
      organization_info,
      donor_context,
      starting_message,
      faqs,
    } = await request.json();

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

    // Build training prompt from knowledge base data
    let trainingPrompt = '';

    // Add organization information
    if (organization_info) {
      trainingPrompt += `Organization Information:\n${organization_info}\n\n`;
    }

    // Add donor context
    if (donor_context) {
      trainingPrompt += `Context and Guidelines:\n${donor_context}\n\n`;
    }

    // Add FAQs
    if (faqs && Array.isArray(faqs)) {
      trainingPrompt += 'Frequently Asked Questions and Responses:\n';
      faqs.forEach(
        (faq: { question?: string; answer?: string }, index: number) => {
          if (faq.question && faq.answer) {
            trainingPrompt += `Q${index + 1}: ${faq.question}\nA${index + 1}: ${faq.answer}\n\n`;
          }
        },
      );
    }

    // Add starting message
    if (starting_message) {
      trainingPrompt += `Starting Message: ${starting_message}\n\n`;
    }

    // Add general instructions
    trainingPrompt += `Instructions: Use the above information to provide accurate, helpful responses. Always be professional, empathetic, and follow the organization's guidelines.`;

    // Update the ElevenLabs agent with the training data
    const updateData = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: trainingPrompt,
            llm: 'gemini-2.0-flash',
            temperature: 0.7,
            max_tokens: -1,
          },
        },
      },
    };

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${agent_id}`,
      {
        method: 'PATCH',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs training API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        `ElevenLabs training API error: ${errorData.detail || response.statusText}`,
      );
    }

    const updatedAgent = await response.json();

    return NextResponse.json(
      {
        success: true,
        data: updatedAgent,
        message: 'Agent training completed successfully',
        trainingData: {
          promptLength: trainingPrompt.length,
          hasOrganizationInfo: !!organization_info,
          hasDonorContext: !!donor_context,
          hasStartingMessage: !!starting_message,
          faqCount: faqs?.length || 0,
        },
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('Agent training error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
