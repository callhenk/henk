# Edge Functions Migration Guide

## 🚀 **Overview**

This guide helps you migrate your Supabase Edge Functions to your Next.js frontend. Edge functions are overkill for basic CRUD operations and can be handled more efficiently in your frontend with proper API routes.

## 📊 **Current Edge Functions Analysis**

### **✅ Keep as Edge Functions (Complex Operations)**

| Function                 | Purpose                      | Keep?       | Reason                                     |
| ------------------------ | ---------------------------- | ----------- | ------------------------------------------ |
| `agent-conversation`     | Real-time AI conversations   | ✅ **Keep** | Complex AI processing, real-time responses |
| `campaign-processor`     | Automated campaign execution | ✅ **Keep** | Background processing, scheduled tasks     |
| `conversation-processor` | Post-call analysis           | ✅ **Keep** | Background processing, data analysis       |

### **🔄 Migrate to Next.js (Simple CRUD)**

| Function                    | Purpose               | Migrate?       | Reason                                   |
| --------------------------- | --------------------- | -------------- | ---------------------------------------- |
| `elevenlabs-voices`         | List available voices | ✅ **Migrate** | Simple API call, can be done in frontend |
| `elevenlabs-test-voice`     | Test voice generation | ✅ **Migrate** | Simple API call with file upload         |
| `elevenlabs-generate`       | Generate speech       | ✅ **Migrate** | Simple API call with file upload         |
| `elevenlabs-knowledge-base` | Knowledge base CRUD   | ✅ **Migrate** | Basic CRUD operations                    |
| `agent-trainer`             | Agent training logic  | ✅ **Migrate** | Database operations, can be API routes   |

## 🛠️ **Migration Implementation**

### **1. ElevenLabs Voices API Route**

Create `app/api/elevenlabs/voices/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

import { ElevenLabsClient } from '@/lib/elevenlabs-client';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY || 'demo_key_for_testing';
    const elevenLabs = new ElevenLabsClient(apiKey);

    const voices = await elevenLabs.getVoices();

    return NextResponse.json({
      success: true,
      data: voices,
      count: voices.length,
      demo_mode: apiKey === 'demo_key_for_testing',
    });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch voices',
      },
      { status: 500 },
    );
  }
}
```

### **2. ElevenLabs Test Voice API Route**

Create `app/api/elevenlabs/test-voice/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

import { ElevenLabsClient } from '@/lib/elevenlabs-client';
import { StorageClient } from '@/lib/storage-client';

export async function POST(request: NextRequest) {
  try {
    const { voice_id, sample_text } = await request.json();

    if (!voice_id) {
      return NextResponse.json(
        { success: false, error: 'voice_id is required' },
        { status: 400 },
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY || 'demo_key_for_testing';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    const elevenLabs = new ElevenLabsClient(apiKey);
    const storage = new StorageClient(supabaseUrl, supabaseServiceKey);

    const textToTest =
      sample_text || 'Hello! This is a test of the voice. How does it sound?';
    const speechResult = await elevenLabs.testVoice(voice_id, textToTest);

    const fileName = storage.generateFileName(voice_id, Date.now());
    const uploadResult = await storage.uploadAudio(
      speechResult.audio,
      fileName,
    );

    return NextResponse.json({
      success: true,
      data: {
        audio_url: uploadResult.url,
        file_path: uploadResult.path,
        file_size: uploadResult.size,
        duration: speechResult.duration,
        voice_id,
        sample_text: textToTest,
        demo_mode: apiKey === 'demo_key_for_testing',
      },
    });
  } catch (error) {
    console.error('Error testing voice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test voice',
      },
      { status: 500 },
    );
  }
}
```

### **3. ElevenLabs Generate Speech API Route**

Create `app/api/elevenlabs/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

import { ElevenLabsClient } from '@/lib/elevenlabs-client';
import { StorageClient } from '@/lib/storage-client';

export async function POST(request: NextRequest) {
  try {
    const { text, voice_id, model_id, voice_settings } = await request.json();

    if (!text || !voice_id) {
      return NextResponse.json(
        { success: false, error: 'text and voice_id are required' },
        { status: 400 },
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY || 'demo_key_for_testing';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    const elevenLabs = new ElevenLabsClient(apiKey);
    const storage = new StorageClient(supabaseUrl, supabaseServiceKey);

    const speechResult = await elevenLabs.generateSpeech({
      text,
      voice_id,
      model_id,
      voice_settings,
    });

    const fileName = storage.generateFileName(voice_id);
    const uploadResult = await storage.uploadAudio(
      speechResult.audio,
      fileName,
    );

    return NextResponse.json({
      success: true,
      data: {
        audio_url: uploadResult.url,
        file_path: uploadResult.path,
        file_size: uploadResult.size,
        duration: speechResult.duration,
        voice_id,
        text,
        demo_mode: apiKey === 'demo_key_for_testing',
      },
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to generate speech',
      },
      { status: 500 },
    );
  }
}
```

### **4. Knowledge Base API Routes**

Create `app/api/elevenlabs/knowledge-base/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

import { ElevenLabsClient } from '@/lib/elevenlabs-client';

const elevenLabs = new ElevenLabsClient(process.env.ELEVENLABS_API_KEY || '');

// List knowledge bases
export async function GET() {
  try {
    const result = await elevenLabs.listKnowledgeBases();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to list knowledge bases',
      },
      { status: 500 },
    );
  }
}

// Create knowledge base
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    const result = await elevenLabs.createKnowledgeBase({ name, description });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create knowledge base',
      },
      { status: 500 },
    );
  }
}
```

Create `app/api/elevenlabs/knowledge-base/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

import { ElevenLabsClient } from '@/lib/elevenlabs-client';

const elevenLabs = new ElevenLabsClient(process.env.ELEVENLABS_API_KEY || '');

// Get knowledge base
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const result = await elevenLabs.getKnowledgeBase(params.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get knowledge base',
      },
      { status: 500 },
    );
  }
}

// Update knowledge base
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const updates = await request.json();
    const result = await elevenLabs.updateKnowledgeBase(params.id, updates);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update knowledge base',
      },
      { status: 500 },
    );
  }
}

// Delete knowledge base
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const result = await elevenLabs.deleteKnowledgeBase(params.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete knowledge base',
      },
      { status: 500 },
    );
  }
}
```

### **5. Agent Trainer API Routes**

Create `app/api/agents/train/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

import { ElevenLabsClient } from '@/lib/elevenlabs-client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const elevenLabs = new ElevenLabsClient(process.env.ELEVENLABS_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { agent_id, business_id } = await request.json();

    if (!agent_id || !business_id) {
      return NextResponse.json(
        { success: false, error: 'agent_id and business_id are required' },
        { status: 400 },
      );
    }

    // Get agent and business details
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 },
      );
    }

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 },
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

    return NextResponse.json({
      success: true,
      data: { trainingContext, elevenLabsConfig },
    });
  } catch (error) {
    console.error('Error training agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to train agent',
      },
      { status: 500 },
    );
  }
}

function buildTrainingContext(agent: any, business: any) {
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
    prompts: agent.workflow_config?.prompts || {},
    training_data: agent.knowledge_base || {},
    conversation_flow: buildConversationFlow(agent),
  };
}

function buildElevenLabsAgentConfig(agent: any, trainingContext: any) {
  return {
    agent_id: agent.id,
    name: agent.name,
    voice_id: agent.voice_id,
    llm_model: agent.llm_model || 'gpt-4o',
    knowledge_base_id: agent.knowledge_base_id,
    context_data: {
      organization_info: agent.organization_info,
      donor_context: agent.donor_context,
      speaking_tone: agent.speaking_tone,
      conversation_style: agent.conversation_style || 'professional_friendly',
    },
    conversation_flow: trainingContext.conversation_flow,
    prompts: trainingContext.prompts,
    training_data: trainingContext.training_data,
  };
}

function buildConversationFlow(agent: any) {
  return {
    greeting: agent.workflow_config?.conversation_flow?.greeting || '',
    introduction: agent.workflow_config?.conversation_flow?.introduction || '',
    value_proposition:
      agent.workflow_config?.conversation_flow?.value_proposition || '',
    objection_handling:
      agent.workflow_config?.conversation_flow?.objection_handling || {},
    closing_techniques:
      agent.workflow_config?.conversation_flow?.closing_techniques || [],
    follow_up: agent.workflow_config?.conversation_flow?.follow_up || '',
  };
}
```

## 📁 **Required Library Files**

### **1. ElevenLabs Client (`lib/elevenlabs-client.ts`)**

```typescript
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

export class ElevenLabsClient {
  private apiKey: string;
  private baseUrl: string;
  public isDemoMode: boolean;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.isDemoMode = !this.apiKey || this.apiKey === 'demo_key_for_testing';
  }

  async getVoices(): Promise<Voice[]> {
    try {
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

  async generateSpeech(
    request: GenerateSpeechRequest,
  ): Promise<GenerateSpeechResponse> {
    try {
      if (this.isDemoMode) {
        const sampleRate = 44100;
        const duration = 1;
        const samples = sampleRate * duration;
        const audioBuffer = new ArrayBuffer(samples * 2);
        const view = new Int16Array(audioBuffer);

        for (let i = 0; i < samples; i++) {
          view[i] = Math.sin(i * 0.01) * 1000;
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
        duration: audioBuffer.byteLength / 32000,
      };
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

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

  // Knowledge Base methods
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
}
```

### **2. Storage Client (`lib/storage-client.ts`)**

```typescript
import { createClient } from '@supabase/supabase-js';

export class StorageClient {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  generateFileName(voiceId: string, timestamp?: number): string {
    const time = timestamp || Date.now();
    return `audio/${voiceId}/${time}_generated.mp3`;
  }

  async uploadAudio(audioBuffer: ArrayBuffer, fileName: string) {
    try {
      const { data, error } = await this.supabase.storage
        .from('audio')
        .upload(fileName, audioBuffer, {
          contentType: 'audio/mpeg',
          cacheControl: '3600',
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = this.supabase.storage
        .from('audio')
        .getPublicUrl(fileName);

      return {
        path: data.path,
        url: urlData.publicUrl,
        size: audioBuffer.byteLength,
      };
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
  }
}
```

## 🔄 **Frontend Integration**

### **1. Update API Calls**

Replace edge function calls with Next.js API routes:

```typescript
// Before (Edge Function)
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/elevenlabs-voices`,
  {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
  }
);

// After (Next.js API Route)
const response = await fetch("/api/elevenlabs/voices");
```

### **2. Environment Variables**

Update your `.env.local`:

```bash
# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🎯 **Benefits of Migration**

### **✅ Advantages**

1. **Reduced Complexity**: No need to manage edge function deployments
2. **Better Development Experience**: Direct integration with Next.js
3. **Faster Development**: No cold starts for simple operations
4. **Cost Effective**: No edge function execution costs for CRUD
5. **Better Error Handling**: Standard HTTP error responses
6. **Type Safety**: Full TypeScript support

### **⚠️ Considerations**

1. **Keep Complex Functions**: `agent-conversation`, `campaign-processor`, `conversation-processor`
2. **Security**: Ensure proper authentication in API routes
3. **Rate Limiting**: Implement rate limiting for external API calls
4. **Caching**: Add caching for frequently accessed data

## 🚀 **Migration Checklist**

- [ ] Create Next.js API routes for simple functions
- [ ] Migrate ElevenLabs client to frontend
- [ ] Update frontend API calls
- [ ] Test all migrated endpoints
- [ ] Update environment variables
- [ ] Remove migrated edge functions
- [ ] Update documentation

## 📚 **Next Steps**

1. **Start with simple functions**: `elevenlabs-voices`, `elevenlabs-test-voice`
2. **Test thoroughly**: Ensure all functionality works
3. **Gradually migrate**: Move one function at a time
4. **Keep complex functions**: Leave `agent-conversation` as edge function
5. **Monitor performance**: Ensure no performance degradation

This migration will significantly simplify your architecture while maintaining all functionality! 🎉
