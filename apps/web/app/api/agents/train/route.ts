import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';

type Agent = Database['public']['Tables']['agents']['Row'];
type Business = Database['public']['Tables']['businesses']['Row'];

interface TrainingContext {
  agent_id: string;
  agent_name: string | null;
  voice_id: string | null;
  speaking_tone: string | null;
  organization_info: string | null;
  donor_context: string | null;
  business_info: {
    name: string | null;
    description: string | null;
    industry: string | null;
    website: string | null;
  };
  prompts: Record<string, unknown>;
  training_data: Record<string, unknown>;
  conversation_flow: ReturnType<typeof buildConversationFlow>;
}

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

    // Parse request body
    const { agent_id, business_id } = await request.json();

    if (!agent_id || !business_id) {
      return NextResponse.json(
        { success: false, error: 'agent_id and business_id are required' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Get agent details
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404, headers: corsHeaders },
      );
    }

    // Get business details
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404, headers: corsHeaders },
      );
    }

    // Build training context
    const trainingContext = buildTrainingContext(agent, business);
    const elevenLabsConfig = buildElevenLabsAgentConfig(agent, trainingContext);

    // Update agent with training data
    await supabase
      .from('agents')
      .update({
        workflow_config: trainingContext,
        elevenlabs_config: elevenLabsConfig,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agent_id);

    return NextResponse.json(
      {
        success: true,
        data: { trainingContext, elevenLabsConfig },
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error training agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to train agent',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

function buildTrainingContext(
  agent: Agent,
  business: Business,
): TrainingContext {
  return {
    agent_id: agent.id,
    agent_name: agent.name,
    voice_id: agent.voice_id,
    speaking_tone: agent.speaking_tone,
    organization_info: agent.organization_info,
    donor_context: agent.donor_context,
    business_info: {
      name: business.name,
      description: business.description,
      industry: business.industry,
      website: business.website,
    },
    prompts: ((agent.workflow_config as { prompts?: unknown })?.prompts ||
      {}) as Record<string, unknown>,
    training_data: (agent.knowledge_base || {}) as Record<string, unknown>,
    conversation_flow: buildConversationFlow(agent),
  };
}

function buildElevenLabsAgentConfig(
  agent: Agent,
  trainingContext: TrainingContext,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agentData = agent as any;
  return {
    agent_id: agent.id,
    name: agent.name,
    voice_id: agent.voice_id,
    llm_model: agentData.llm_model || 'gpt-4o',
    knowledge_base_id: agentData.knowledge_base_id,
    context_data: {
      organization_info: agentData.organization_info,
      donor_context: agent.donor_context,
      speaking_tone: agentData.speaking_tone,
      conversation_style:
        agentData.conversation_style || 'professional_friendly',
    },
    conversation_flow: trainingContext.conversation_flow,
    prompts: trainingContext.prompts,
    training_data: trainingContext.training_data,
  };
}

function buildConversationFlow(agent: Agent) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = agent.workflow_config as any;
  return {
    greeting: config?.conversation_flow?.greeting || '',
    introduction: config?.conversation_flow?.introduction || '',
    value_proposition: config?.conversation_flow?.value_proposition || '',
    objection_handling: config?.conversation_flow?.objection_handling || {},
    closing_techniques: config?.conversation_flow?.closing_techniques || [],
    follow_up: config?.conversation_flow?.follow_up || '',
  };
}
