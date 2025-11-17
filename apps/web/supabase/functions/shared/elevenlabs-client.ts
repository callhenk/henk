// ElevenLabs API Client for Supabase Edge Functions
// Handles voice listing, speech generation, and voice testing

export interface Voice {
  voice_id: string;
  name: string;
  samples: any[];
  category: string;
  fine_tuning: {
    language: string;
    is_allowed_to_fine_tune: boolean;
    finetuning_request_status: string;
    verification_attempts: any[];
    manual_verification_requested: boolean;
    language_description: string;
    verification_attempts_count: number;
    verification_failures: string[];
    verification: any[];
  };
  labels: Record<string, string>;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings: any;
  sharing: any;
  high_quality_base_model_ids: string[];
  safety_control: string;
  voice_verification: any;
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

export class ElevenLabsClient {
  private apiKey: string;
  private baseUrl: string;
  public isDemoMode: boolean;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || Deno.env.get('ELEVENLABS_API_KEY') || '';
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.isDemoMode = !this.apiKey || this.apiKey === 'demo_key_for_testing';

    // Note: Conversational AI endpoints are not available for all plans
    // The function will automatically fall back to demo mode for these features
  }

  /**
   * Get list of available voices from ElevenLabs
   */
  async getVoices(): Promise<Voice[]> {
    try {
      // If in demo mode, return mock data
      if (this.isDemoMode) {
        return [
          {
            voice_id: '21m00Tcm4TlvDq8ikWAM',
            name: 'Rachel',
            category: 'cloned',
            description: 'Professional female voice for demo',
            preview_url: 'https://example.com/rachel-preview.mp3',
            labels: { language: 'en', gender: 'female' },
            samples: [],
            fine_tuning: {
              language: 'en',
              is_allowed_to_fine_tune: false,
              finetuning_request_status: 'not_requested',
              verification_attempts: [],
              manual_verification_requested: false,
              language_description: 'English',
              verification_attempts_count: 0,
              verification_failures: [],
              verification: [],
            },
            available_for_tiers: ['free'],
            settings: {},
            sharing: {},
            high_quality_base_model_ids: ['eleven_multilingual_v2'],
            safety_control: 'none',
            voice_verification: {},
          },
          {
            voice_id: 'AZnzlk1XvdvUeBnXmlld',
            name: 'Domi',
            category: 'cloned',
            description: 'Professional male voice for demo',
            preview_url: 'https://example.com/domi-preview.mp3',
            labels: { language: 'en', gender: 'male' },
            samples: [],
            fine_tuning: {
              language: 'en',
              is_allowed_to_fine_tune: false,
              finetuning_request_status: 'not_requested',
              verification_attempts: [],
              manual_verification_requested: false,
              language_description: 'English',
              verification_attempts_count: 0,
              verification_failures: [],
              verification: [],
            },
            available_for_tiers: ['free'],
            settings: {},
            sharing: {},
            high_quality_base_model_ids: ['eleven_multilingual_v2'],
            safety_control: 'none',
            voice_verification: {},
          },
        ];
      }

      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch voices: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  /**
   * Generate speech from text using specified voice
   */
  async generateSpeech(
    request: GenerateSpeechRequest,
  ): Promise<GenerateSpeechResponse> {
    try {
      // If in demo mode, return mock audio data
      if (this.isDemoMode) {
        // Create a mock audio buffer (1 second of silence at 44.1kHz)
        const sampleRate = 44100;
        const duration = 1; // 1 second
        const samples = sampleRate * duration;
        const audioBuffer = new ArrayBuffer(samples * 2); // 16-bit audio = 2 bytes per sample
        const view = new Int16Array(audioBuffer);

        // Fill with a simple sine wave for demo purposes
        for (let i = 0; i < samples; i++) {
          view[i] = Math.sin(i * 0.01) * 1000; // Simple sine wave
        }

        return {
          audio: audioBuffer,
          duration: duration,
        };
      }

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
              similarity_boost: 0.5,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to generate speech: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const audioBuffer = await response.arrayBuffer();

      return {
        audio: audioBuffer,
        duration: audioBuffer.byteLength / 32000, // Rough estimate for MP3
      };
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

  /**
   * Test a voice with sample text
   */
  async testVoice(
    voiceId: string,
    sampleText: string = 'Hello! This is a test of the voice.',
  ): Promise<GenerateSpeechResponse> {
    return this.generateSpeech({
      text: sampleText,
      voice_id: voiceId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.0,
        use_speaker_boost: true,
      },
    });
  }

  /**
   * Get voice details by ID
   */
  async getVoice(voiceId: string): Promise<Voice | null> {
    try {
      // If in demo mode, return mock voice data
      if (this.isDemoMode) {
        const voices = await this.getVoices();
        return voices.find((v) => v.voice_id === voiceId) || null;
      }

      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(
          `Failed to fetch voice: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching voice:', error);
      throw error;
    }
  }

  // Enhanced Knowledge Base methods based on current ElevenLabs API documentation

  async createKnowledgeBaseFromText(knowledgeBaseConfig: any) {
    if (this.isDemoMode) {
      return {
        id: `demo_kb_${Date.now()}`,
        name: knowledgeBaseConfig.name,
        content_count: knowledgeBaseConfig.texts?.length || 0,
        status: 'active',
        demo_mode: true,
      };
    }

    const response = await fetch(`${this.baseUrl}/convai/knowledge-base/text`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: knowledgeBaseConfig.name,
        text: knowledgeBaseConfig.text,
        description: knowledgeBaseConfig.description,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create knowledge base from text: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async createKnowledgeBaseFromUrl(knowledgeBaseConfig: any) {
    if (this.isDemoMode) {
      return {
        id: `demo_kb_${Date.now()}`,
        name: knowledgeBaseConfig.name || 'Demo Knowledge Base',
        demo_mode: true,
      };
    }

    const response = await fetch(`${this.baseUrl}/convai/knowledge-base/url`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: knowledgeBaseConfig.url,
        name: knowledgeBaseConfig.name,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create knowledge base from URL: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async addToKnowledgeBase(agentId: string, knowledgeBaseData: any) {
    if (this.isDemoMode) {
      return {
        id: `demo_kb_${Date.now()}`,
        name: knowledgeBaseData.name || 'Demo Knowledge Base',
        demo_mode: true,
      };
    }

    // Create form data for multipart upload
    const formData = new FormData();

    if (knowledgeBaseData.name) {
      formData.append('name', knowledgeBaseData.name);
    }

    if (knowledgeBaseData.url) {
      formData.append('url', knowledgeBaseData.url);
    }

    if (knowledgeBaseData.file) {
      formData.append('file', knowledgeBaseData.file);
    }

    const response = await fetch(
      `${this.baseUrl}/convai/knowledge-base?agent_id=${agentId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          // Note: Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to add to knowledge base: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async createKnowledgeBase(knowledgeBaseConfig: any) {
    if (this.isDemoMode) {
      return {
        knowledge_base_id: `demo_kb_${Date.now()}`,
        name: knowledgeBaseConfig.name,
        content_count: knowledgeBaseConfig.content?.length || 0,
        status: 'active',
        demo_mode: true,
      };
    }

    const response = await fetch(`${this.baseUrl}/convai/knowledge-base`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: knowledgeBaseConfig.name,
        description: knowledgeBaseConfig.description,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create knowledge base: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async addTextToKnowledgeBase(knowledgeBaseId: string, texts: string[]) {
    if (this.isDemoMode) {
      return {
        knowledge_base_id: knowledgeBaseId,
        added_texts: texts.length,
        status: 'updated',
        demo_mode: true,
      };
    }

    const response = await fetch(
      `${this.baseUrl}/convai/knowledge-base/${knowledgeBaseId}/text`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: texts.join('\n\n'),
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to add text to knowledge base: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async getKnowledgeBase(knowledgeBaseId: string) {
    if (this.isDemoMode) {
      return {
        id: knowledgeBaseId,
        name: 'Demo Knowledge Base',
        description: 'Demo knowledge base for testing',
        content_count: 5,
        status: 'active',
        demo_mode: true,
      };
    }

    const response = await fetch(
      `${this.baseUrl}/convai/knowledge-base/${knowledgeBaseId}`,
      {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get knowledge base: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async listKnowledgeBases() {
    if (this.isDemoMode) {
      return {
        knowledge_bases: [
          {
            id: 'demo_kb_1',
            name: 'Demo Knowledge Base 1',
            description: 'Demo knowledge base for testing',
            content_count: 5,
            status: 'active',
          },
        ],
        demo_mode: true,
      };
    }

    const response = await fetch(`${this.baseUrl}/convai/knowledge-base`, {
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to list knowledge bases: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async updateKnowledgeBase(knowledgeBaseId: string, updates: any) {
    if (this.isDemoMode) {
      return {
        id: knowledgeBaseId,
        status: 'updated',
        demo_mode: true,
      };
    }

    const response = await fetch(
      `${this.baseUrl}/convai/knowledge-base/${knowledgeBaseId}`,
      {
        method: 'PATCH',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update knowledge base: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async deleteKnowledgeBase(knowledgeBaseId: string) {
    if (this.isDemoMode) {
      return {
        id: knowledgeBaseId,
        status: 'deleted',
        demo_mode: true,
      };
    }

    const response = await fetch(
      `${this.baseUrl}/convai/knowledge-base/${knowledgeBaseId}`,
      {
        method: 'DELETE',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to delete knowledge base: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  // New Conversational AI methods

  async createAgent(agentConfig: any) {
    if (this.isDemoMode) {
      return {
        agent_id: `demo_agent_${Date.now()}`,
        name: agentConfig.name,
        voice_id: agentConfig.voice_id,
        llm_model: agentConfig.llm_model,
        knowledge_base_id: agentConfig.knowledge_base_id,
        status: 'active',
        demo_mode: true,
      };
    }

    console.log('🤖 Creating ElevenLabs agent with config:', {
      name: agentConfig.name,
      voice_id: agentConfig.voice_id,
      llm_model: agentConfig.llm_model,
      has_knowledge_base: !!agentConfig.knowledge_base_id,
      has_context: !!agentConfig.context_data,
    });

    try {
      const response = await fetch(`${this.baseUrl}/convai/agents/create`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_config: {
            name: agentConfig.name,
            voice_id: agentConfig.voice_id,
            llm_model: agentConfig.llm_model,
            knowledge_base_id: agentConfig.knowledge_base_id,
            context_data: agentConfig.context_data,
            conversation_flow: agentConfig.conversation_flow,
            prompts: agentConfig.prompts,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ElevenLabs API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorText: errorText,
        });
        throw new Error(
          `Failed to create agent: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const result = await response.json();
      console.log('✅ ElevenLabs agent created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating ElevenLabs agent:', error);

      // If it's a 404, the endpoint might be wrong or API key doesn't have access
      if (error.message.includes('404')) {
        console.log('🔄 Falling back to demo mode due to 404 error');
        this.isDemoMode = true;
        return {
          agent_id: `demo_agent_${Date.now()}`,
          name: agentConfig.name,
          voice_id: agentConfig.voice_id,
          llm_model: agentConfig.llm_model,
          knowledge_base_id: agentConfig.knowledge_base_id,
          status: 'active',
          demo_mode: true,
        };
      }

      // If it's a 422 (validation error), try with minimal config
      if (error.message.includes('422')) {
        console.log('🔄 Retrying with minimal agent config');
        const minimalResponse = await fetch(
          `${this.baseUrl}/convai/agents/create`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': this.apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conversation_config: {
                name: agentConfig.name,
                voice_id: agentConfig.voice_id || 'pNInz6obpgDQGcFmaJgB',
                llm_model: agentConfig.llm_model || 'gpt-4o',
              },
            }),
          },
        );

        if (minimalResponse.ok) {
          const result = await minimalResponse.json();
          console.log('✅ Agent created with minimal config:', result);
          return result;
        }
      }

      throw error;
    }
  }

  async updateAgent(agentId: string, updates: any) {
    if (this.isDemoMode) {
      return {
        agent_id: agentId,
        status: 'updated',
        demo_mode: true,
      };
    }

    const response = await fetch(`${this.baseUrl}/convai/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update agent: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async initiateConversation(agentId: string, context: any) {
    if (this.isDemoMode) {
      return {
        conversation_id: `demo_conv_${Date.now()}`,
        agent_id: agentId,
        status: 'active',
        context: context,
        demo_mode: true,
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/convai/agents/${agentId}/conversations`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            context: context,
            initial_message:
              context.conversation_flow?.greeting ||
              'Hello, how can I help you today?',
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ElevenLabs conversation error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
        });

        // If conversation fails, fall back to demo mode
        if (response.status === 404 || response.status === 422) {
          console.log(
            '🔄 Conversation endpoints not available, using demo mode',
          );
          this.isDemoMode = true;
          return {
            conversation_id: `demo_conv_${Date.now()}`,
            agent_id: agentId,
            status: 'active',
            context: context,
            demo_mode: true,
          };
        }

        throw new Error(
          `Failed to initiate conversation: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const result = await response.json();
      console.log('✅ ElevenLabs conversation initiated:', result);
      return result;
    } catch (error) {
      console.error('❌ Error initiating conversation:', error);

      // Fall back to demo mode
      console.log('🔄 Falling back to demo mode due to conversation error');
      this.isDemoMode = true;
      return {
        conversation_id: `demo_conv_${Date.now()}`,
        agent_id: agentId,
        status: 'active',
        context: context,
        demo_mode: true,
      };
    }
  }

  async sendMessage(conversationId: string, message: string, context?: any) {
    if (this.isDemoMode) {
      return {
        conversation_id: conversationId,
        message: message,
        response: 'Thank you for your message. This is a demo response.',
        context: context,
        demo_mode: true,
      };
    }

    const response = await fetch(
      `${this.baseUrl}/convai/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          context: context,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to send message: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async getConversationHistory(conversationId: string) {
    if (this.isDemoMode) {
      return {
        conversation_id: conversationId,
        messages: [
          {
            role: 'agent',
            content: 'Hello, how can I help you today?',
            timestamp: new Date().toISOString(),
          },
          {
            role: 'user',
            content: 'Tell me about your fundraising campaign.',
            timestamp: new Date().toISOString(),
          },
          {
            role: 'agent',
            content:
              'Thank you for your interest in our fundraising campaign. We are raising funds to support families in need.',
            timestamp: new Date().toISOString(),
          },
        ],
        demo_mode: true,
      };
    }

    const response = await fetch(
      `${this.baseUrl}/convai/conversations/${conversationId}/messages`,
      {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get conversation history: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async endConversation(conversationId: string) {
    if (this.isDemoMode) {
      return {
        conversation_id: conversationId,
        status: 'ended',
        demo_mode: true,
      };
    }

    const response = await fetch(
      `${this.baseUrl}/convai/conversations/${conversationId}/end`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to end conversation: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async getAgentAnalytics(agentId: string, dateRange?: string) {
    if (this.isDemoMode) {
      return {
        agent_id: agentId,
        total_conversations: 150,
        average_conversation_duration: 180,
        success_rate: 0.85,
        common_topics: ['fundraising', 'donations', 'impact'],
        demo_mode: true,
      };
    }

    const params = dateRange ? `?date_range=${dateRange}` : '';
    const response = await fetch(
      `${this.baseUrl}/conversational-ai/agents/${agentId}/analytics${params}`,
      {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get agent analytics: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }
}
