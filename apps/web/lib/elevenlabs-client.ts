export interface Voice {
  voice_id: string;
  name: string;
  samples: unknown[];
  category: string;
  fine_tuning: unknown;
  labels: Record<string, string>;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings: unknown;
  sharing: unknown;
  high_quality_base_model_ids: string[];
  safety_control: string;
  voice_verification: unknown;
}

export interface GenerateSpeechRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface GenerateSpeechResponse {
  audio: ArrayBuffer;
  duration: number;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export class ElevenLabsClient {
  private apiKey: string;
  private baseUrl: string;
  private voicesBaseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    // Voices API uses v2 per latest docs
    this.voicesBaseUrl = 'https://api.elevenlabs.io/v2';
  }

  /**
   * Conversational AI Phone Numbers
   */
  async listPhoneNumbers(): Promise<
    Array<{
      phone_number: string;
      label?: string;
      supports_inbound?: boolean;
      supports_outbound?: boolean;
      phone_number_id: string;
      assigned_agent?: { agent_id: string; agent_name?: string } | null;
      provider?: string;
    }>
  > {
    const headers: Record<string, string> = {
      'xi-api-key': this.apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    // Some workspaces require scoping; include if configured
    if (process.env.ELEVENLABS_WORKSPACE_ID) {
      headers['xi-workspace-id'] = process.env
        .ELEVENLABS_WORKSPACE_ID as string;
    }

    const response = await fetch(`${this.baseUrl}/convai/phone-numbers`, {
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch phone numbers: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.phone_numbers)) return data.phone_numbers;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  /**
   * Update an ElevenLabs ConvAI agent
   * Docs: https://elevenlabs.io/docs/api-reference/agents/update
   */
  async updateAgent(agentId: string, payload: Record<string, unknown>) {
    const response = await fetch(`${this.baseUrl}/convai/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to update agent: ${err?.detail || response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Assign phone number to agent by phone_number_id
   */
  async assignAgentPhoneNumber(agentId: string, phoneNumberId: string) {
    return this.updateAgent(agentId, {
      phone_numbers: [{ phone_number_id: phoneNumberId }],
    });
  }

  /**
   * Initiate an outbound call via ElevenLabs Twilio
   * Docs: https://elevenlabs.io/docs/api-reference/twilio/outbound-call
   */
  async twilioOutboundCall(params: {
    agent_id: string;
    agent_phone_number_id: string;
    to_number: string;
    conversation_initiation_client_data?: Record<string, unknown>;
  }) {
    const headers: Record<string, string> = {
      'xi-api-key': this.apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (process.env.ELEVENLABS_WORKSPACE_ID) {
      headers['xi-workspace-id'] = process.env
        .ELEVENLABS_WORKSPACE_ID as string;
    }

    const response = await fetch(
      `${this.baseUrl}/convai/twilio/outbound-call`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      },
    );

    if (!response.ok) {
      const err = await response.text().catch(() => '');
      throw new Error(
        `ElevenLabs outbound call failed: ${response.status} ${response.statusText}${err ? ' - ' + err : ''}`,
      );
    }

    return response.json();
  }

  /**
   * Get all available voices
   */
  async getVoices(): Promise<Voice[]> {
    const response = await fetch(`${this.voicesBaseUrl}/voices`, {
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }

    const data = await response.json();
    return data.voices || [];
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(
    request: GenerateSpeechRequest,
  ): Promise<GenerateSpeechResponse> {
    const response = await fetch(
      `${this.baseUrl}/text-to-speech/${request.voice_id}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          model_id: request.model_id || 'eleven_multilingual_v2',
          voice_settings: request.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to generate speech: ${error.detail || response.statusText}`,
      );
    }

    const audioBuffer = await response.arrayBuffer();

    // Calculate approximate duration (rough estimate)
    const duration = Math.ceil(request.text.length / 15); // ~15 characters per second

    return {
      audio: audioBuffer,
      duration,
    };
  }

  /**
   * Test voice with sample text
   */
  async testVoice(
    voiceId: string,
    sampleText: string,
  ): Promise<GenerateSpeechResponse> {
    return this.generateSpeech({
      text: sampleText,
      voice_id: voiceId,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    });
  }

  /**
   * List all knowledge bases
   */
  async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    const response = await fetch(`${this.baseUrl}/knowledge`, {
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list knowledge bases: ${response.statusText}`);
    }

    const data = await response.json();
    return data.knowledge_bases || [];
  }

  /**
   * Get knowledge base by ID
   */
  async getKnowledgeBase(id: string): Promise<KnowledgeBase> {
    const response = await fetch(`${this.baseUrl}/knowledge/${id}`, {
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get knowledge base: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create knowledge base
   */
  async createKnowledgeBase(data: {
    name: string;
    description?: string;
  }): Promise<KnowledgeBase> {
    const response = await fetch(`${this.baseUrl}/knowledge`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create knowledge base: ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Update knowledge base
   */
  async updateKnowledgeBase(
    id: string,
    updates: Partial<KnowledgeBase>,
  ): Promise<KnowledgeBase> {
    const response = await fetch(`${this.baseUrl}/knowledge/${id}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update knowledge base: ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Delete knowledge base
   */
  async deleteKnowledgeBase(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/knowledge/${id}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete knowledge base: ${response.statusText}`,
      );
    }
  }
}
