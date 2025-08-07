export interface Voice {
  voice_id: string;
  name: string;
  samples: any[];
  category: string;
  fine_tuning: any;
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

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  /**
   * Get all available voices
   */
  async getVoices(): Promise<Voice[]> {
    const response = await fetch(`${this.baseUrl}/voices`, {
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
