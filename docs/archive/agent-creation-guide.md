# ElevenLabs Agent Creation & Management Guide

## 🎯 Overview

This guide covers how to create and manage ElevenLabs Conversational AI agents using the new `elevenlabs-agent` Edge Function, with integrated voice testing capabilities.

## 🚀 Quick Start

### 1. Deploy the Agent Function

```bash
# Deploy all functions including the new agent function
./deploy.sh

# Or deploy individually
supabase functions deploy elevenlabs-agent

# Set environment variables
supabase secrets set ELEVENLABS_API_KEY=your_api_key
```

### 2. Frontend Integration

```javascript
// utils/agents.js
import { callEdgeFunction } from './api';

const EDGE_FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1';

// Create a new agent with ElevenLabs integration
export async function createAgent(agentConfig) {
  return callEdgeFunction(
    `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-agent/create`,
    {
      method: 'POST',
      body: JSON.stringify(agentConfig),
    },
  );
}

// List all agents
export async function listAgents() {
  return callEdgeFunction(`${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-agent/list`);
}

// Get agent details
export async function getAgent(agentId) {
  return callEdgeFunction(
    `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-agent/get/${agentId}`,
  );
}

// Update agent
export async function updateAgent(agentId, updates) {
  return callEdgeFunction(
    `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-agent/update/${agentId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(updates),
    },
  );
}

// Delete agent
export async function deleteAgent(agentId) {
  return callEdgeFunction(
    `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-agent/delete/${agentId}`,
    {
      method: 'DELETE',
    },
  );
}

// Test agent voice conversation
export async function testAgentVoice(agentId) {
  return callEdgeFunction(`${EDGE_FUNCTIONS_BASE_URL}/agent-conversation`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'start_conversation',
      agent_id: agentId,
      conversation_type: 'voice',
    }),
  });
}
```

## 📋 Agent Configuration

### Basic Agent Configuration with ElevenLabs

```javascript
const basicAgentConfig = {
  name: 'Fundraising Agent',
  voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
  llm_model: 'gpt-4o', // OpenAI GPT-4o

  // ElevenLabs integration settings
  elevenlabs_integration: {
    enabled: true,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    },
    conversation_settings: {
      connection_type: 'webrtc', // or "websocket"
      enable_voice_testing: true,
      fallback_to_simulation: true,
    },
  },
};
```

### Advanced Agent Configuration

```javascript
const advancedAgentConfig = {
  name: 'Red Cross Fundraising Agent',
  voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
  llm_model: 'gpt-4o', // OpenAI GPT-4o
  knowledge_base_id: 'kb_123456', // Optional: link to knowledge base

  // ElevenLabs integration
  elevenlabs_integration: {
    enabled: true,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    },
    conversation_settings: {
      connection_type: 'webrtc',
      enable_voice_testing: true,
      fallback_to_simulation: true,
      volume_control: true,
      real_time_transcription: true,
    },
  },

  // Organization context
  context_data: {
    organization_info: {
      name: 'Red Cross',
      mission: 'Help families in need through emergency relief programs',
      impact: 'Supporting communities worldwide',
      website: 'https://redcross.org',
    },
    campaign_info: {
      name: 'Annual Fundraising Campaign',
      goal: '$100,000',
      focus: 'Emergency relief and disaster response',
    },
    donor_context: {
      target_donation: '$25-$100',
      impact_examples: [
        '$25 provides emergency shelter for a family of four',
        '$50 provides emergency food for a family for a week',
        '$100 provides emergency medical supplies for 10 people',
      ],
    },
  },

  // Conversation flow
  conversation_flow: {
    greeting:
      'Hello {{lead_name}}, this is {{agent_name}} calling from Red Cross...',
    introduction:
      "We're reaching out to our community about our annual fundraising campaign...",
    value_proposition:
      'Your donation of $25 can provide emergency shelter for a family of four...',
    closing:
      'Thank you for your time and consideration. Every donation makes a difference.',
  },

  // Prompts for different scenarios
  prompts: {
    fundraising:
      'Your donation of $25 can provide emergency shelter for a family of four. Would you like to make a donation today?',
    objection_handling: {
      cost_concern:
        "I understand your concern about the cost. Every dollar goes directly to helping families in need, and we're transparent about how funds are used.",
      timing_issue:
        "I understand you're busy. This call will only take 2-3 minutes, and your donation can make an immediate impact.",
      already_donated:
        "That's wonderful! Thank you for your previous support. We're reaching out because the need continues to grow.",
    },
    closing_techniques: [
      'Would you like to make a donation of $25 today?',
      'Can I count on your support with a $25 donation?',
      'Your $25 donation can help a family in need right now.',
    ],
  },
};
```

## 🎯 Available Voices

### Popular Voice IDs

```javascript
const VOICES = {
  RACHEL: '21m00Tcm4TlvDq8ikWAM', // Professional female
  DOMI: 'AZnzlk1XvdvUeBnXmlld', // Professional male
  BELLA: 'EXAVITQu4vr4xnSDxMaL', // Warm female
  ANTONI: 'ErXwobaYiN019PkySvjV', // Warm male
  THOMAS: 'GBv7mTt0atIp3Br8iCZE', // Deep male
  JOSH: 'TxGEqnHWrfWFTfGW9XjX', // Casual male
  ARNOLD: 'VR6AewLTigWG4xSOukaG', // Strong male
  ADAM: 'pNInz6obpgDQGcFmaJgB', // Clear male
  SAM: 'yoZ06aMxZJJ28mfd3POQ', // Young male
  CALLUM: 'GBv7mTt0atIp3Br8iCZE', // British male
  SERENA: 'pMsXgVXv3BLzUgSkhhoJ', // British female
  FIN: 'VR6AewLTigWG4xSOukaG', // Irish male
  BELLE: 'EXAVITQu4vr4xnSDxMaL', // French female
  DOROTHY: 'ThT5KcBeYPX3keUQqHPh', // Australian female
  CLYDE: '2EiwWnXFnvU5JabPnv8n', // Scottish male
};
```

### Get Available Voices

```javascript
// First, get available voices
import { getVoices } from './voices';

const voices = await getVoices();
console.log('Available voices:', voices);
```

## 🤖 LLM Models

### Available Models

```javascript
const LLM_MODELS = {
  GPT_4O: 'gpt-4o', // OpenAI GPT-4o (recommended)
  GPT_4O_MINI: 'gpt-4o-mini', // OpenAI GPT-4o Mini
  CLAUDE_3_5_SONNET: 'claude-3-5-sonnet', // Anthropic Claude
  CLAUDE_3_HAIKU: 'claude-3-haiku', // Anthropic Claude (faster)
  GEMINI_PRO: 'gemini-pro', // Google Gemini
  GEMINI_FLASH: 'gemini-flash', // Google Gemini (faster)
};
```

## 📚 Knowledge Base Integration

### Create Knowledge Base First

```javascript
import { createKnowledgeBaseFromText } from './knowledge-base';

// Create a knowledge base for your agent
const knowledgeBase = await createKnowledgeBaseFromText(
  'Fundraising FAQ',
  `Q: How can I donate?
A: You can donate online, by phone, or by mail.

Q: Where does my donation go?
A: 100% of your donation goes directly to helping families in need.

Q: Is my donation tax-deductible?
A: Yes, all donations are tax-deductible to the extent allowed by law.

Q: How much should I donate?
A: Any amount helps! $25 can provide emergency shelter for a family of four.`,
  'Common fundraising questions and answers',
);

console.log('Knowledge Base ID:', knowledgeBase.data.id);
```

### Use Knowledge Base in Agent

```javascript
const agentWithKnowledgeBase = {
  name: 'Fundraising Agent',
  voice_id: '21m00Tcm4TlvDq8ikWAM',
  llm_model: 'gpt-4o',
  knowledge_base_id: knowledgeBase.data.id, // Link to knowledge base
  // ... other config
};
```

## 🎯 React Component Example with ElevenLabs Integration

```javascript
// components/AgentManager.js
import React, { useEffect, useState } from 'react';

import {
  createAgent,
  deleteAgent,
  listAgents,
  testAgentVoice,
} from '../utils/agents';
import { getVoices } from '../utils/voices';

export default function AgentManager() {
  const [agents, setAgents] = useState([]);
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    voice_id: '',
    llm_model: 'gpt-4o',
    knowledge_base_id: '',
    elevenlabs_enabled: true,
    voice_stability: 0.5,
    voice_similarity_boost: 0.75,
    enable_voice_testing: true,
    fallback_to_simulation: true,
  });

  useEffect(() => {
    loadAgents();
    loadVoices();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await listAgents();
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const loadVoices = async () => {
    try {
      const response = await getVoices();
      setVoices(response.voices || []);
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const agentConfig = {
        name: formData.name,
        voice_id: formData.voice_id,
        llm_model: formData.llm_model,
        knowledge_base_id: formData.knowledge_base_id || undefined,

        // ElevenLabs integration
        elevenlabs_integration: {
          enabled: formData.elevenlabs_enabled,
          voice_settings: {
            stability: formData.voice_stability,
            similarity_boost: formData.voice_similarity_boost,
            style: 0.0,
            use_speaker_boost: true,
          },
          conversation_settings: {
            connection_type: 'webrtc',
            enable_voice_testing: formData.enable_voice_testing,
            fallback_to_simulation: formData.fallback_to_simulation,
            volume_control: true,
            real_time_transcription: true,
          },
        },

        context_data: {
          organization_info: {
            name: 'Your Organization',
            mission: 'Help people in need',
          },
        },
        conversation_flow: {
          greeting: `Hello, this is ${formData.name} calling...`,
          introduction: "We're reaching out about our campaign...",
        },
      };

      await createAgent(agentConfig);
      alert('Agent created successfully!');
      setFormData({
        name: '',
        voice_id: '',
        llm_model: 'gpt-4o',
        knowledge_base_id: '',
        elevenlabs_enabled: true,
        voice_stability: 0.5,
        voice_similarity_boost: 0.75,
        enable_voice_testing: true,
        fallback_to_simulation: true,
      });
      loadAgents();
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Error creating agent: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      await deleteAgent(agentId);
      alert('Agent deleted successfully!');
      loadAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Error deleting agent: ' + error.message);
    }
  };

  const handleTestVoice = async (agentId) => {
    try {
      const response = await testAgentVoice(agentId);
      if (response.success) {
        alert(
          'Voice test started! Check the agent detail page for voice testing.',
        );
      } else {
        alert('Voice test failed: ' + response.error);
      }
    } catch (error) {
      console.error('Error testing voice:', error);
      alert('Error testing voice: ' + error.message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Agent Manager</h1>

      {/* Create Agent Form */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Create New Agent</h2>

        <form onSubmit={handleCreateAgent} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Agent Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-md border p-2"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Voice</label>
            <select
              value={formData.voice_id}
              onChange={(e) =>
                setFormData({ ...formData, voice_id: e.target.value })
              }
              className="w-full rounded-md border p-2"
              required
            >
              <option value="">Select a voice</option>
              {voices.map((voice) => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name} - {voice.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">LLM Model</label>
            <select
              value={formData.llm_model}
              onChange={(e) =>
                setFormData({ ...formData, llm_model: e.target.value })
              }
              className="w-full rounded-md border p-2"
              required
            >
              <option value="gpt-4o">GPT-4o (Recommended)</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
              <option value="gemini-pro">Gemini Pro</option>
              <option value="gemini-flash">Gemini Flash</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Knowledge Base ID (Optional)
            </label>
            <input
              type="text"
              value={formData.knowledge_base_id}
              onChange={(e) =>
                setFormData({ ...formData, knowledge_base_id: e.target.value })
              }
              className="w-full rounded-md border p-2"
              placeholder="kb_123456"
            />
          </div>

          {/* ElevenLabs Integration Settings */}
          <div className="border-t pt-4">
            <h3 className="mb-4 text-lg font-medium">
              ElevenLabs Voice Integration
            </h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="elevenlabs_enabled"
                  checked={formData.elevenlabs_enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      elevenlabs_enabled: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label
                  htmlFor="elevenlabs_enabled"
                  className="text-sm font-medium"
                >
                  Enable ElevenLabs Voice Integration
                </label>
              </div>

              {formData.elevenlabs_enabled && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Voice Stability (0.0 - 1.0)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.voice_stability}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          voice_stability: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <span className="text-xs text-gray-600">
                      {formData.voice_stability}
                    </span>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Voice Similarity Boost (0.0 - 1.0)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.voice_similarity_boost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          voice_similarity_boost: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <span className="text-xs text-gray-600">
                      {formData.voice_similarity_boost}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable_voice_testing"
                      checked={formData.enable_voice_testing}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enable_voice_testing: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <label
                      htmlFor="enable_voice_testing"
                      className="text-sm font-medium"
                    >
                      Enable Voice Testing
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="fallback_to_simulation"
                      checked={formData.fallback_to_simulation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fallback_to_simulation: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <label
                      htmlFor="fallback_to_simulation"
                      className="text-sm font-medium"
                    >
                      Fallback to Simulation if ElevenLabs Unavailable
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Agent'}
          </button>
        </form>
      </div>

      {/* Agents List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Existing Agents</h2>
        <div className="space-y-4">
          {agents.map((agent) => (
            <div key={agent.agent_id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{agent.name}</h3>
                  <p className="text-sm text-gray-600">ID: {agent.agent_id}</p>
                  <p className="text-sm text-gray-600">
                    Voice: {agent.voice_id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Model: {agent.llm_model}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {agent.status}
                  </p>
                  {agent.elevenlabs_integration && (
                    <p className="text-sm text-green-600">
                      ✓ ElevenLabs Voice Enabled
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestVoice(agent.agent_id)}
                    className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                  >
                    Test Voice
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(agent.agent_id)}
                    className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 🔧 API Endpoints

### Create Agent

```bash
POST /functions/v1/elevenlabs-agent/create
```

**Request Body:**

```json
{
  "name": "Fundraising Agent",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "llm_model": "gpt-4o",
  "knowledge_base_id": "kb_123456",
  "elevenlabs_integration": {
    "enabled": true,
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.75,
      "style": 0.0,
      "use_speaker_boost": true
    },
    "conversation_settings": {
      "connection_type": "webrtc",
      "enable_voice_testing": true,
      "fallback_to_simulation": true,
      "volume_control": true,
      "real_time_transcription": true
    }
  },
  "context_data": {
    "organization_info": {
      "name": "Red Cross",
      "mission": "Help families in need"
    }
  },
  "conversation_flow": {
    "greeting": "Hello {{lead_name}}, this is {{agent_name}}...",
    "introduction": "We're reaching out about our campaign..."
  },
  "prompts": {
    "fundraising": "Your donation of $25 can help...",
    "objection_handling": "I understand your concern..."
  }
}
```

### Update Agent

```bash
PATCH /functions/v1/elevenlabs-agent/update/{agentId}
```

### Get Agent Details

```bash
GET /functions/v1/elevenlabs-agent/get/{agentId}
```

### List Agents

```bash
GET /functions/v1/elevenlabs-agent/list
```

### Delete Agent

```bash
DELETE /functions/v1/elevenlabs-agent/delete/{agentId}
```

### Test Agent Voice

```bash
POST /functions/v1/agent-conversation
```

**Request Body:**

```json
{
  "action": "start_conversation",
  "agent_id": "your_agent_id",
  "conversation_type": "voice"
}
```

## 🎯 Voice Testing Integration

### Agent Detail Page Integration

When you create an agent with ElevenLabs integration enabled, you can test the voice functionality directly from the agent detail page:

1. **Navigate to Agent Detail Page**
2. **Click on "Testing" Tab**
3. **Click "Connect Microphone"**
4. **Click "Start Voice Test"**
5. **Speak into your microphone**
6. **Listen for the agent's response**

### Voice Testing Features

- ✅ **Real-time voice conversations** (when ElevenLabs is configured)
- ✅ **Simulated conversations** (fallback when ElevenLabs is not available)
- ✅ **Volume control**
- ✅ **Connection status monitoring**
- ✅ **Agent speaking indicators**
- ✅ **Error handling and user feedback**

## 🎯 Next Steps

1. **Create your first agent** using the React component above
2. **Configure ElevenLabs integration** during agent creation
3. **Test voice functionality** from the agent detail page
4. **Train the agent** using the `agent-trainer` function
5. **Start conversations** using the `agent-conversation` function
6. **Monitor performance** and iterate on your agent configuration

This provides everything you need to create and manage ElevenLabs agents with integrated voice testing! 🎯
