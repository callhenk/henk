/**
 * API Routes utility for ElevenLabs integration
 * Migrated from Edge Functions to Next.js API routes
 */

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
    faqs?: Record<string, unknown>;
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
  data?: Record<string, unknown>;
  error?: string;
  message?: string;
}

/**
 * Call an API route with proper authentication
 */
async function callApiRoute(
  endpoint: string,
  options: RequestInit = {},
): Promise<AgentResponse> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: 'Failed to parse response',
  }));

  // If the response is not ok, return the error in a structured format
  if (!response.ok) {
    return {
      success: false,
      error: data.error || data.message || `HTTP ${response.status}`,
      data: data,
    };
  }

  return data;
}

/**
 * Get available voices
 */
export async function getVoices(): Promise<AgentResponse> {
  return callApiRoute('/api/elevenlabs/voices');
}

/**
 * Test voice generation
 */
export async function testVoice(
  voiceId: string,
  sampleText?: string,
): Promise<AgentResponse> {
  return callApiRoute('/api/elevenlabs/test-voice', {
    method: 'POST',
    body: JSON.stringify({
      voice_id: voiceId,
      sample_text: sampleText,
    }),
  });
}

/**
 * Generate speech from text
 */
export async function generateSpeech(
  text: string,
  voiceId: string,
  options?: {
    model_id?: string;
    voice_settings?: Record<string, unknown>;
  },
): Promise<AgentResponse> {
  return callApiRoute('/api/elevenlabs/generate', {
    method: 'POST',
    body: JSON.stringify({
      text,
      voice_id: voiceId,
      model_id: options?.model_id,
      voice_settings: options?.voice_settings,
    }),
  });
}

/**
 * List knowledge bases
 */
export async function listKnowledgeBases(): Promise<AgentResponse> {
  return callApiRoute('/api/elevenlabs/knowledge-base');
}

/**
 * Create knowledge base
 */
export async function createKnowledgeBase(data: {
  name: string;
  description?: string;
}): Promise<AgentResponse> {
  return callApiRoute('/api/elevenlabs/knowledge-base', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get knowledge base by ID
 */
export async function getKnowledgeBase(id: string): Promise<AgentResponse> {
  return callApiRoute(`/api/elevenlabs/knowledge-base/${id}`);
}

/**
 * Update knowledge base
 */
export async function updateKnowledgeBase(
  id: string,
  updates: Record<string, unknown>,
): Promise<AgentResponse> {
  return callApiRoute(`/api/elevenlabs/knowledge-base/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

/**
 * Delete knowledge base
 */
export async function deleteKnowledgeBase(id: string): Promise<AgentResponse> {
  return callApiRoute(`/api/elevenlabs/knowledge-base/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Train agent
 */
export async function trainAgent(
  agentId: string,
  businessId: string,
): Promise<AgentResponse> {
  return callApiRoute('/api/agents/train', {
    method: 'POST',
    body: JSON.stringify({
      agent_id: agentId,
      business_id: businessId,
    }),
  });
}

// Legacy functions for backward compatibility
export async function createElevenLabsAgent(
  agentConfig: AgentConfig,
): Promise<AgentResponse> {
  return callApiRoute('/api/elevenlabs-agent/create', {
    method: 'POST',
    body: JSON.stringify(agentConfig),
  });
}

export async function listElevenLabsAgents(): Promise<AgentResponse> {
  return callApiRoute('/api/elevenlabs-agent/list');
}

export async function getElevenLabsAgent(
  agentId: string,
): Promise<AgentResponse> {
  return callApiRoute(`/api/elevenlabs-agent/details/${agentId}`);
}

export async function updateElevenLabsAgent(
  agentId: string,
  updates: Partial<AgentConfig>,
): Promise<AgentResponse> {
  return callApiRoute('/api/elevenlabs-agent/update', {
    method: 'PATCH',
    body: JSON.stringify({
      agent_id: agentId,
      updates,
    }),
  });
}

export async function deleteElevenLabsAgent(
  agentId: string,
): Promise<AgentResponse> {
  return callApiRoute(`/api/elevenlabs-agent/delete/${agentId}`, {
    method: 'DELETE',
  });
}

export async function startConversation(
  agentId: string,
  accountId: string,
  businessId: string,
  initialMessage?: string,
): Promise<AgentResponse> {
  return callApiRoute('/api/agent-conversation/start', {
    method: 'POST',
    body: JSON.stringify({
      agent_id: agentId,
      account_id: accountId,
      business_id: businessId,
      initial_message: initialMessage,
    }),
  });
}

export async function sendMessage(
  conversationId: string,
  message: string,
  accountId: string,
): Promise<AgentResponse> {
  return callApiRoute('/api/agent-conversation/send', {
    method: 'POST',
    body: JSON.stringify({
      conversation_id: conversationId,
      message,
      account_id: accountId,
    }),
  });
}

export async function testAgentVoice(agentId: string): Promise<AgentResponse> {
  return callApiRoute('/api/agent-conversation/test-voice', {
    method: 'POST',
    body: JSON.stringify({
      agent_id: agentId,
    }),
  });
}
