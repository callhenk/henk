/**
 * Edge Functions utility for ElevenLabs agent management
 */

const EDGE_FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1';

export interface AgentConfig {
  name: string;
  description?: string;
  voice_id: string;
  llm_model?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
    elevenlabs_enabled: boolean;
    enable_voice_testing: boolean;
    fallback_to_simulation: boolean;
  };
  context_data?: {
    organization_info?: string;
    donor_context?: string;
    faqs?: any;
  };
  conversation_flow?: {
    greeting?: string;
    introduction?: string;
    value_proposition?: string;
    closing?: string;
  };
  prompts?: {
    fundraising?: string;
    objection_handling?: {
      cost_concern?: string;
      timing_issue?: string;
      already_donated?: string;
    };
    closing_techniques?: string[];
  };
  status?: string;
  account_id?: string;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Call an Edge Function with proper authentication
 */
async function callEdgeFunction(
  endpoint: string,
  options: RequestInit = {},
): Promise<AgentResponse> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Create a new agent with ElevenLabs integration
 */
export async function createElevenLabsAgent(
  agentConfig: AgentConfig,
): Promise<AgentResponse> {
  return callEdgeFunction(
    `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-agent/create`,
    {
      method: 'POST',
      body: JSON.stringify(agentConfig),
    },
  );
}

/**
 * List all agents
 */
export async function listElevenLabsAgents(): Promise<AgentResponse> {
  return callEdgeFunction(`${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-agent/list`);
}

/**
 * Get agent details by ID
 */
export async function getElevenLabsAgent(
  agentId: string,
): Promise<AgentResponse> {
  return callEdgeFunction(
    `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-agent/get/${agentId}`,
  );
}

/**
 * Update an agent
 */
export async function updateElevenLabsAgent(
  agentId: string,
  updates: Partial<AgentConfig>,
): Promise<AgentResponse> {
  return callEdgeFunction(
    `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-agent/update/${agentId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(updates),
    },
  );
}

/**
 * Delete an agent
 */
export async function deleteElevenLabsAgent(
  agentId: string,
): Promise<AgentResponse> {
  return callEdgeFunction(
    `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-agent/delete/${agentId}`,
    {
      method: 'DELETE',
    },
  );
}

/**
 * Start a new conversation with an agent
 */
export async function startConversation(
  agentId: string,
  accountId: string,
  businessId: string,
  initialMessage?: string,
): Promise<AgentResponse> {
  return callEdgeFunction(`${EDGE_FUNCTIONS_BASE_URL}/agent-conversation`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'start_conversation',
      agent_id: agentId,
      account_id: accountId,
      business_id: businessId,
      initial_message: initialMessage,
    }),
  });
}

/**
 * Send a message in an existing conversation
 */
export async function sendMessage(
  conversationId: string,
  message: string,
  accountId: string,
): Promise<AgentResponse> {
  return callEdgeFunction(`${EDGE_FUNCTIONS_BASE_URL}/agent-conversation`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'send_message',
      conversation_id: conversationId,
      message,
      account_id: accountId,
    }),
  });
}

/**
 * Test agent voice conversation (legacy function)
 */
export async function testAgentVoice(agentId: string): Promise<AgentResponse> {
  return callEdgeFunction(`${EDGE_FUNCTIONS_BASE_URL}/agent-conversation`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'start_conversation',
      agent_id: agentId,
      conversation_type: 'voice',
    }),
  });
}
