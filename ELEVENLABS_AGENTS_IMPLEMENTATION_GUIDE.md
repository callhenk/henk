# ElevenLabs Agent Creator Flow - Implementation Guide

**Last Updated:** October 31, 2025

This guide outlines the complete flow for implementing ElevenLabs agent creation within the Henk platform, including API specifications, architectural patterns, and step-by-step implementation guidance.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Components](#architecture--components)
3. [Agent Creation Flow](#agent-creation-flow)
4. [API Specification](#api-specification)
5. [Configuration Management](#configuration-management)
6. [Implementation Patterns](#implementation-patterns)
7. [Deployment Channels](#deployment-channels)
8. [Testing & Monitoring](#testing--monitoring)
9. [Integration with Henk Platform](#integration-with-henk-platform)

---

## Overview

### What is ElevenLabs Agents?

ElevenLabs Agents (Conversational AI Agents) is a platform that enables building voice-interactive conversational AI systems. Launched in November 2024, it provides a complete solution for:

- Creating multimodal conversational agents
- Managing complex conversation flows with visual workflows
- Integrating custom LLMs and knowledge bases
- Deploying across multiple channels (telephony, web, mobile)

### Key Capabilities (2025 Updates)

- **Agent Testing Framework**: Create, manage, and execute automated tests for agents
- **Complex Workflow Expressions**: Deterministic conditions using logical operators, dynamic variables, and LLM evaluation
- **Edge Ordering**: Explicit control over edge evaluation order for deterministic workflow execution
- **Custom LLM Integration**: Bring your own language models or use providers like OpenAI, Google, Anthropic
- **Knowledge Base Management**: Up to 20MB or 300k characters per agent (standard accounts)
- **Multilingual Support**: 31 languages with 5,000+ voices
- **Real-time Performance Analytics**: Built-in testing, evals, and analytics

---

## Architecture & Components

### Core Platform Components

ElevenLabs Agents platform consists of four foundational components that work together:

```
┌─────────────────────────────────────────────┐
│      ElevenLabs Agents Platform              │
├─────────────────────────────────────────────┤
│  1. Speech Recognition (ASR)                │
│     - Fine-tuned automatic speech rec.      │
│     - Configurable quality & providers      │
│                                             │
│  2. Language Processing (LLM)               │
│     - Multiple LLM support                  │
│     - Custom model integration              │
│     - OpenAI, Google, Anthropic, etc.      │
│                                             │
│  3. Voice Synthesis (TTS)                   │
│     - Low-latency text-to-speech            │
│     - 5,000+ voices across 31 languages    │
│     - Configurable stability & speed       │
│                                             │
│  4. Conversation Management                 │
│     - Proprietary turn-taking model        │
│     - Workflow orchestration                │
│     - Tool execution & routing              │
└─────────────────────────────────────────────┘
```

### Configuration Layers

```
┌──────────────────────────────────────────┐
│        Platform Settings                  │
│  (Widgets, Auth, Privacy, Call Limits)   │
├──────────────────────────────────────────┤
│        Conversation Config                │
│  (ASR, TTS, LLM, Turn Management)        │
├──────────────────────────────────────────┤
│        Workflow Definition                │
│  (Nodes, Edges, Conditional Routing)     │
├──────────────────────────────────────────┤
│        Agent Metadata                     │
│  (Name, Tags, Knowledge Base, Tools)     │
└──────────────────────────────────────────┘
```

---

## Agent Creation Flow

### High-Level Flow Diagram

```
User Input
    ↓
[1] Define Agent Metadata (name, tags)
    ↓
[2] Configure Conversation Settings
    ├─ ASR (Audio → Text)
    ├─ LLM (Decision Making)
    ├─ TTS (Text → Voice)
    └─ Turn Management
    ↓
[3] Define Workflow (Nodes & Edges)
    ├─ Agent Nodes
    ├─ Tool Nodes
    ├─ Transfer Nodes
    └─ End Nodes
    ↓
[4] Setup Knowledge Base (Optional)
    ├─ Upload Files (PDF, TXT, DOCX, HTML, EPUB)
    ├─ Import URLs
    └─ Add Text Blocks
    ↓
[5] Configure Tools (Optional)
    ├─ Server Tools (Custom Logic)
    ├─ System Tools (Flow Control)
    └─ Tool Integration
    ↓
[6] Platform Settings (Optional)
    ├─ Widget Configuration
    ├─ Authentication
    ├─ Data Collection
    └─ Privacy Policies
    ↓
[7] Submit Agent Creation Request
    ↓
[8] Receive Agent ID & Access Details
    ↓
[9] Test & Deploy
    ├─ Dashboard Testing
    ├─ Simulation
    └─ Live Deployment
```

### Step-by-Step Process

#### Phase 1: Agent Definition

1. **Gather Requirements**
   - Agent purpose and use case
   - Target audience and languages
   - Deployment channels (phone, web, mobile)
   - Knowledge domain

2. **Collect Configuration Data**
   - Agent name and description
   - Classification tags
   - Initial greeting message
   - Conversation parameters (duration, timeout)

#### Phase 2: Configuration

3. **ASR Configuration**
   - Quality level (low, medium, high)
   - Provider selection
   - Audio format
   - Keyword hints for better recognition

4. **LLM Selection**
   - Choose model (OpenAI GPT-4, Claude, etc.)
   - Define system prompt
   - Set temperature and parameters
   - Attach knowledge base documents

5. **TTS Configuration**
   - Select voice (5,000+ options)
   - Set voice stability (0-100)
   - Set speaking speed (0-100)
   - Configure output format

6. **Turn Management**
   - Silence timeout duration
   - Eagerness level (how quickly to respond)
   - Max turn duration

#### Phase 3: Workflow Design

7. **Define Workflow Nodes**
   - Start node (with first message)
   - Agent nodes (conversation handlers)
   - Tool nodes (external integrations)
   - Transfer nodes (to human agents or phone numbers)
   - End nodes (conversation termination)

8. **Configure Edges**
   - LLM Condition routing (context-based)
   - Expression routing (deterministic logic)
   - Unconditional edges (automatic flow)
   - Backward edges (retry loops)

#### Phase 4: Enhancement

9. **Add Knowledge Base** (Optional)
   - Upload domain-specific documents
   - Import web content via URLs
   - Structure information for context awareness

10. **Integrate Tools** (Optional)
    - Define server tools for external actions
    - Configure system tools for flow control
    - Set up tool execution handling

11. **Platform Settings** (Optional)
    - Widget styling and placement
    - Authentication requirements
    - Call limits and quotas
    - Privacy and compliance settings

#### Phase 5: Deployment

12. **Create Agent**
    - Submit configuration via API
    - Receive agent ID
    - Verify creation success

13. **Test**
    - Use dashboard for manual testing
    - Run simulation mode
    - Monitor conversation logs

14. **Deploy**
    - Publish to selected channels
    - Monitor performance
    - Collect analytics

---

## API Specification

### Create Agent Endpoint

**Endpoint:** `POST https://api.elevenlabs.io/v1/convai/agents/create`

**Authentication:** `xi-api-key` header (string)

### Request Schema

```typescript
interface CreateAgentRequest {
  // Required fields
  conversation_config: ConversationConfig;
  workflow: AgentWorkflow;

  // Optional fields
  platform_settings?: PlatformSettings;
  name?: string;
  tags?: string[];
}
```

### Conversation Config

```typescript
interface ConversationConfig {
  // Auto Speech Recognition (ASR)
  asr?: {
    provider?: 'elevenlabs' | 'deepgram' | 'google' | 'openai';
    quality?: 'low' | 'medium' | 'high';
    audio_format?: 'pcm' | 'ulaw' | 'alaw';
    keywords?: string[]; // Hints for better recognition
    language?: string; // ISO 639-1 code
  };

  // Text-to-Speech (TTS)
  tts?: {
    model?: string; // TTS model identifier
    voice_id?: string; // ElevenLabs voice ID or custom
    voice_settings?: {
      stability?: number; // 0-100
      similarity_boost?: number; // 0-100
    };
    output_format?: 'mp3_22050' | 'mp3_44100' | 'pcm_16000';
  };

  // Language Model (LLM)
  llm?: {
    model?: string; // 'gpt-4', 'claude-3', etc.
    temperature?: number; // 0-1
    max_tokens?: number;
    custom_llm_url?: string; // For custom models
    custom_llm_api_key?: string; // For custom models
  };

  // Agent behavior
  agent?: {
    prompt?: string; // System prompt / instructions
    first_message?: string; // Initial greeting
    language?: string; // Conversation language
    text_only_mode?: boolean; // No voice synthesis
    call_duration_minutes?: number; // Max call length
    tools?: Tool[]; // Available tools for the agent
  };

  // Turn management
  turn_management?: {
    turn_timeout_seconds?: number;
    silence_timeout_ms?: number;
    eagerness?: number; // 0-100 (response speed)
    max_turn_duration?: number;
  };

  // Client events
  client_events?: string[];

  // Knowledge base
  knowledge_base?: {
    document_ids?: string[];
    document_types?: ('web' | 'file' | 'text')[];
  };
}
```

### Workflow Definition

```typescript
interface AgentWorkflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowNode {
  node_id: string;
  node_type: 'agent' | 'tool' | 'transfer' | 'transfer_to_number' | 'end';

  // For agent nodes - configuration overrides
  agent_node_config?: {
    system_prompt_override?: string;
    llm_override?: string;
    voice_override?: string;
    knowledge_base_override?: string[];
    tools_override?: Tool[];
  };

  // For tool nodes
  tool_config?: {
    tool_id: string;
    tool_name: string;
  };

  // For transfer nodes
  transfer_config?: {
    agent_id?: string; // For agent transfer
    phone_number?: string; // For phone transfer
  };

  // Metadata
  initial_message?: string;
  edge_order?: string[]; // Edge evaluation order
}

interface WorkflowEdge {
  source_node_id: string;
  target_node_id: string;
  edge_type: 'condition_lm' | 'expression' | 'tool_result' | 'none';

  // For LLM condition edges
  condition_description?: string; // Natural language condition

  // For expression edges
  condition_expression?: string; // Logical expression with variables

  // For tool result edges
  tool_result_condition?: 'success' | 'failure';
}
```

### Platform Settings

```typescript
interface PlatformSettings {
  // Widget configuration
  widget?: {
    variant?: 'default' | 'embedded' | 'mobile';
    position?: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';
    color_scheme?: {
      primary_color?: string;
      background_color?: string;
      text_color?: string;
    };
    feedback_mode?: 'enabled' | 'disabled';
  };

  // Authentication
  authentication?: {
    type?: 'none' | 'api_key' | 'oauth';
    provider?: string;
    allowed_domains?: string[];
  };

  // Data collection
  data_collection?: {
    collect_conversations?: boolean;
    collect_analytics?: boolean;
    retention_days?: number;
  };

  // Privacy & compliance
  privacy?: {
    privacy_policy_url?: string;
    terms_url?: string;
    gdpr_compliant?: boolean;
  };

  // Call management
  call_settings?: {
    max_concurrent_calls?: number;
    max_calls_per_hour?: number;
    rate_limit?: number;
  };

  // Evaluation criteria
  evaluation?: {
    metrics_enabled?: boolean;
    success_criteria?: string[];
  };
}
```

### Response Schema

```typescript
interface CreateAgentResponse {
  agent_id: string; // UUID format
  // Additional metadata returned by API
  status?: 'active' | 'inactive';
  created_at?: string;
  voice_id?: string;
}
```

### Error Responses

```typescript
interface ErrorResponse {
  detail?: string;
  status: number; // 422 for validation errors
  error_code?: string;
}
```

### Tools Definition

```typescript
interface Tool {
  tool_id?: string;
  tool_name: string;
  description: string;
  tool_type: 'server' | 'system';

  // For server tools
  server_url?: string;
  http_method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parameters?: ToolParameter[];

  // For system tools (flow control)
  system_tool_type?: 'transfer_to_agent' | 'transfer_to_number' | 'end_call';
}

interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  required: boolean;
  enum?: string[];
}
```

---

## Configuration Management

### ASR (Automatic Speech Recognition) Configuration

**Purpose:** Convert audio input to text

```typescript
const asrConfig = {
  provider: 'elevenlabs', // Options: elevenlabs, deepgram, google, openai
  quality: 'high', // low, medium, high
  language: 'en', // ISO 639-1 code
  audio_format: 'pcm', // pcm, ulaw, alaw
  keywords: ['donor', 'fundraising', 'campaign'] // Context hints
};
```

**Best Practices:**
- Use `high` quality for important conversational details
- Provide relevant keywords for better recognition in specific domains
- Match audio format to your infrastructure (WebRTC typically uses `pcm`)

### LLM Configuration

**Purpose:** Language understanding and response generation

```typescript
const llmConfig = {
  // Option 1: Use ElevenLabs recommended models
  model: 'gpt-4-turbo', // Latest OpenAI model
  temperature: 0.7, // 0=deterministic, 1=creative
  max_tokens: 500,

  // Option 2: Custom LLM
  custom_llm_url: 'https://your-llm-endpoint.com/v1/chat/completions',
  custom_llm_api_key: process.env.CUSTOM_LLM_KEY
};
```

**Model Recommendations:**
- **High accuracy:** GPT-4, Claude-3-Opus
- **Cost effective:** GPT-3.5-turbo, Llama-2
- **Custom:** Your own fine-tuned models

### TTS (Text-to-Speech) Configuration

**Purpose:** Convert text responses to natural speech

```typescript
const ttsConfig = {
  voice_id: 'EXAVITQu4vr4xnSDxMaL', // 5000+ voices available
  voice_settings: {
    stability: 75, // 0-100 (consistency)
    similarity_boost: 75 // 0-100 (naturalness)
  },
  model: 'eleven_monolingual_v1', // or multilingual
  output_format: 'mp3_44100' // pcm_16000 for streaming
};
```

**Voice Selection Tips:**
- Test multiple voices for your use case
- Consider gender, age, accent preferences
- For enterprise, get custom voice cloning

### System Prompt Engineering

**Critical for agent quality**

```typescript
const systemPrompt = `You are a professional fundraiser assistant for XYZ nonprofit organization.

Your role:
- Engage donors in warm, genuine conversations
- Answer questions about our mission and impact
- Guide donors through the giving process
- Maintain empathy and genuine care

Guidelines:
- Always be honest about the organization's work
- If unsure, acknowledge it and offer to connect with a team member
- Keep responses concise (2-3 sentences)
- Show genuine appreciation for donor interest
- Never pressure or use high-pressure tactics

Context about XYZ:
[Include key facts about the organization]

Available actions:
- Schedule a meeting with our development team
- Send donation materials via email
- Process donations up to $10,000
- Transfer to human fundraiser for complex questions`;
```

---

## Implementation Patterns

### Pattern 1: Basic Agent Creation (Minimum Config)

```typescript
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function createBasicAgent() {
  const agent = await elevenlabs.agents.create({
    name: 'Donor Engagement Agent',
    tags: ['fundraising', 'production'],
    conversation_config: {
      agent: {
        prompt: 'You are a friendly fundraiser helping donors...',
        first_message: 'Hello! Thanks for your interest in our cause.',
        language: 'en'
      },
      tts: {
        voice_id: 'EXAVITQu4vr4xnSDxMaL' // Professional female voice
      }
    },
    workflow: {
      nodes: [
        {
          node_id: 'start',
          node_type: 'agent',
          initial_message: 'Hello! How can I help you today?'
        },
        {
          node_id: 'end',
          node_type: 'end'
        }
      ],
      edges: [
        {
          source_node_id: 'start',
          target_node_id: 'end',
          edge_type: 'none'
        }
      ]
    }
  });

  return agent.agent_id;
}
```

### Pattern 2: Agent with Knowledge Base

```typescript
async function createKnowledgeableAgent(documentIds: string[]) {
  const agent = await elevenlabs.agents.create({
    name: 'Informed Fundraiser',
    tags: ['kb-enabled', 'fundraising'],
    conversation_config: {
      agent: {
        prompt: 'You are a knowledgeable fundraiser with access to our organization materials.',
        language: 'en'
      },
      knowledge_base: {
        document_ids: documentIds,
        document_types: ['file', 'web']
      },
      tts: {
        voice_id: 'voice_id_here'
      }
    },
    workflow: {
      nodes: [
        { node_id: 'start', node_type: 'agent' },
        { node_id: 'end', node_type: 'end' }
      ],
      edges: [{
        source_node_id: 'start',
        target_node_id: 'end',
        edge_type: 'none'
      }]
    }
  });

  return agent.agent_id;
}
```

### Pattern 3: Agent with Tools & Workflow

```typescript
async function createAdvancedAgent(toolConfig: ToolDefinition[]) {
  const agent = await elevenlabs.agents.create({
    name: 'Advanced Donor Assistant',
    tags: ['tools', 'workflow', 'production'],
    conversation_config: {
      agent: {
        prompt: 'You are a comprehensive donor support assistant...',
        tools: toolConfig // Server and system tools
      },
      tts: { voice_id: 'voice_id_here' }
    },
    workflow: {
      nodes: [
        {
          node_id: 'welcome',
          node_type: 'agent',
          initial_message: 'Welcome! How can I assist you?'
        },
        {
          node_id: 'question_classification',
          node_type: 'agent',
          agent_node_config: {
            system_prompt_override: 'Classify the donor question into: donation, impact, team_contact'
          }
        },
        {
          node_id: 'process_donation',
          node_type: 'tool',
          tool_config: {
            tool_name: 'process_donation',
            tool_id: 'donation-processor'
          }
        },
        {
          node_id: 'connect_team',
          node_type: 'transfer',
          transfer_config: {
            agent_id: 'human-team-agent-id' // Transfer to human agent
          }
        },
        {
          node_id: 'end',
          node_type: 'end'
        }
      ],
      edges: [
        {
          source_node_id: 'welcome',
          target_node_id: 'question_classification',
          edge_type: 'none'
        },
        {
          source_node_id: 'question_classification',
          target_node_id: 'process_donation',
          edge_type: 'condition_lm',
          condition_description: 'User wants to make a donation'
        },
        {
          source_node_id: 'question_classification',
          target_node_id: 'connect_team',
          edge_type: 'condition_lm',
          condition_description: 'User wants to speak with the team'
        },
        {
          source_node_id: 'process_donation',
          target_node_id: 'end',
          edge_type: 'tool_result',
          tool_result_condition: 'success'
        },
        {
          source_node_id: 'process_donation',
          target_node_id: 'connect_team',
          edge_type: 'tool_result',
          tool_result_condition: 'failure'
        }
      ]
    }
  });

  return agent.agent_id;
}
```

### Pattern 4: Agent with Complex Routing

```typescript
async function createIntelligentRouter() {
  const agent = await elevenlabs.agents.create({
    name: 'Smart Conversation Router',
    conversation_config: {
      agent: {
        prompt: 'Route conversations intelligently based on content and intent'
      }
    },
    workflow: {
      nodes: [
        {
          node_id: 'start',
          node_type: 'agent',
          initial_message: 'Hello! What brings you here today?'
        },
        {
          node_id: 'analyze_intent',
          node_type: 'agent',
          agent_node_config: {
            system_prompt_override: 'Analyze user intent: donation, question, complaint, other'
          }
        },
        {
          node_id: 'donation_flow',
          node_type: 'agent',
          agent_node_config: {
            system_prompt_override: 'Guide the user through donation process'
          }
        },
        {
          node_id: 'qa_flow',
          node_type: 'agent',
          agent_node_config: {
            system_prompt_override: 'Answer questions using knowledge base'
          }
        },
        {
          node_id: 'escalation',
          node_type: 'transfer',
          transfer_config: {
            phone_number: '+1-800-SUPPORT' // Transfer to phone
          }
        },
        {
          node_id: 'end',
          node_type: 'end'
        }
      ],
      edges: [
        // Express-based deterministic routing
        {
          source_node_id: 'start',
          target_node_id: 'analyze_intent',
          edge_type: 'none'
        },
        {
          source_node_id: 'analyze_intent',
          target_node_id: 'donation_flow',
          edge_type: 'expression',
          condition_expression: 'intent == "donation" AND amount >= 100'
        },
        {
          source_node_id: 'analyze_intent',
          target_node_id: 'qa_flow',
          edge_type: 'expression',
          condition_expression: 'intent == "question"'
        },
        {
          source_node_id: 'analyze_intent',
          target_node_id: 'escalation',
          edge_type: 'expression',
          condition_expression: 'sentiment == "negative" OR intent == "complaint"'
        },
        {
          source_node_id: 'donation_flow',
          target_node_id: 'end',
          edge_type: 'none'
        },
        {
          source_node_id: 'qa_flow',
          target_node_id: 'end',
          edge_type: 'none'
        }
      ]
    }
  });

  return agent.agent_id;
}
```

---

## Deployment Channels

### Channel 1: Telephony

**Providers:**
- Twilio
- Genesys
- Vonage
- Telynx
- Plivo
- Any SIP-compatible PBX system

**Implementation:**
```typescript
// Pseudo-code for Twilio integration
const twilioConfig = {
  agent_id: 'your-agent-id',
  twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
  twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
  webhook_url: 'https://your-domain.com/webhooks/elevenlabs',
  forward_to: '+1-800-YOUR-NUMBER'
};
```

**Timeline:** Agents can go live in 48 hours to 3 weeks depending on complexity.

### Channel 2: Web Widget

**Integration:**
```html
<!-- Embed agent in your website -->
<script src="https://elevenlabs.io/js/client.js"></script>
<script>
  ElevenLabsConvAI.initialize({
    agentId: 'your-agent-id',
    publicKey: 'your-public-key'
  });

  // Customize widget placement
  ElevenLabsConvAI.openWindow({
    position: 'bottom-right',
    theme: 'light'
  });
</script>
```

**React Integration:**
```typescript
import { ElevenLabsWidget } from '@elevenlabs/react';

export function DonorWidget() {
  return (
    <ElevenLabsWidget
      agentId={process.env.NEXT_PUBLIC_AGENT_ID}
      publicKey={process.env.NEXT_PUBLIC_ELEVENLABS_KEY}
    />
  );
}
```

### Channel 3: Mobile Apps

**SDKs Available:**
- React Native
- iOS (Swift)
- Android (Kotlin)

**Implementation Pattern:**
```typescript
// React Native example
import { ElevenLabsClient } from '@elevenlabs/react-native';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
  agentId: 'your-agent-id'
});

// Start conversation
await client.startConversation({
  language: 'en',
  onMessage: (message) => console.log(message),
  onError: (error) => console.error(error)
});
```

---

## Testing & Monitoring

### Testing Methods

#### 1. Dashboard Testing
```
1. Navigate to Agent in ElevenLabs Dashboard
2. Click "Test" button
3. Engage in conversation
4. Monitor real-time transcript
```

#### 2. Simulation Mode
```typescript
async function simulateConversation(agentId: string) {
  const conversation = await elevenlabs.agents.simulate({
    agent_id: agentId,
    user_input: 'I want to make a $1000 donation',
    conversation_id: 'test-123' // Optional: continue conversation
  });

  return {
    agent_response: conversation.response,
    transcript: conversation.transcript,
    confidence: conversation.confidence
  };
}
```

#### 3. Streaming Simulation
```typescript
async function streamSimulation(agentId: string, userInput: string) {
  const stream = await elevenlabs.agents.simulateStream({
    agent_id: agentId,
    user_input: userInput
  });

  for await (const chunk of stream) {
    console.log('Agent:', chunk.text);
  }
}
```

### Automated Testing Framework (2025)

```typescript
interface AgentTest {
  test_name: string;
  description: string;
  test_scenarios: TestScenario[];
  expected_outcomes: ExpectedOutcome[];
  pass_criteria: PassCriteria;
}

interface TestScenario {
  user_message: string;
  expected_agent_response_pattern?: string;
  expected_tool_call?: string;
  expected_routing?: string;
}

async function createAgentTest(agentId: string, test: AgentTest) {
  // Creates automated test suite for the agent
  const result = await elevenlabs.agents.createTest({
    agent_id: agentId,
    test_config: test
  });

  return result;
}

async function runAgentTests(agentId: string) {
  // Executes all tests for an agent
  const results = await elevenlabs.agents.runTests(agentId);

  return {
    total_tests: results.total,
    passed: results.passed,
    failed: results.failed,
    coverage: results.coverage,
    issues: results.issues
  };
}
```

### Analytics & Monitoring

```typescript
async function getAgentMetrics(agentId: string, period: 'day' | 'week' | 'month') {
  const metrics = await elevenlabs.agents.getMetrics({
    agent_id: agentId,
    period: period
  });

  return {
    total_conversations: metrics.total_conversations,
    avg_conversation_duration: metrics.avg_duration_seconds,
    user_satisfaction: metrics.satisfaction_score, // 0-100
    falloff_rate: metrics.falloff_rate, // % dropped
    tool_usage: metrics.tool_call_distribution,
    top_intents: metrics.intent_distribution,
    error_rate: metrics.error_rate,
    language_distribution: metrics.languages,
    peak_usage_hours: metrics.peak_hours
  };
}
```

### Monitoring Best Practices

1. **Track Key Metrics:**
   - Conversation completion rate
   - User satisfaction scores
   - Tool execution success rate
   - Falloff rate at each workflow node

2. **Set Alerts:**
   - Error rate exceeds 5%
   - Satisfaction drops below 70%
   - Tool failures increase

3. **Regular Review:**
   - Weekly conversation sample review
   - Monthly performance analysis
   - Quarterly configuration optimization

---

## Integration with Henk Platform

### 1. Database Schema Additions

```sql
-- Add to agents table (already exists)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS (
  elevenlabs_agent_id UUID,
  conversation_config JSONB,
  workflow_config JSONB,
  platform_settings JSONB,
  knowledge_base_document_ids TEXT[],
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(50) -- 'synced', 'pending', 'error'
);

-- New table for agent versions
CREATE TABLE agent_versions (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  version_number INT,
  elevenlabs_agent_id UUID,
  config JSONB,
  created_by UUID REFERENCES team_members(id),
  created_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Table for knowledge base documents
CREATE TABLE agent_knowledge_documents (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  elevenlabs_doc_id UUID,
  title VARCHAR(255),
  document_type VARCHAR(50), -- 'file', 'web', 'text'
  source_url TEXT,
  file_name TEXT,
  size_bytes INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API Routes for Agent Creation

```typescript
// apps/web/app/api/agents/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { businessId, agentConfig } = body;

  // Verify user has access to this business
  const { data: team } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('business_id', businessId)
    .single();

  if (!team) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    // Create agent on ElevenLabs
    const response = await elevenlabs.agents.create(agentConfig);

    // Store in Henk database
    const { data: agent } = await supabase
      .from('agents')
      .update({
        elevenlabs_agent_id: response.agent_id,
        conversation_config: agentConfig.conversation_config,
        workflow_config: agentConfig.workflow,
        platform_settings: agentConfig.platform_settings,
        last_synced_at: new Date().toISOString(),
        sync_status: 'synced'
      })
      .eq('business_id', businessId)
      .select()
      .single();

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Agent creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
```

### 3. React Hooks for Agent Management

```typescript
// packages/supabase/src/hooks/agents/use-agent-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentConfig: CreateAgentRequest) => {
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentConfig)
      });

      if (!response.ok) throw new Error('Failed to create agent');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId, config }: UpdateAgentRequest) => {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });

      if (!response.ok) throw new Error('Failed to update agent');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  });
}
```

### 4. Agent Creation UI Component

```typescript
// apps/web/app/home/agents/_components/agent-creator.tsx
'use client';

import { useState } from 'react';
import { useCreateAgent } from '@kit/supabase/hooks/agents/use-agent-mutations';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';

export function AgentCreator({ businessId }: { businessId: string }) {
  const [formData, setFormData] = useState({
    name: '',
    systemPrompt: '',
    voiceId: '',
    firstMessage: ''
  });

  const createAgent = useCreateAgent();

  async function handleSubmit() {
    const config = {
      businessId,
      agentConfig: {
        name: formData.name,
        tags: ['henk-platform'],
        conversation_config: {
          agent: {
            prompt: formData.systemPrompt,
            first_message: formData.firstMessage,
            language: 'en'
          },
          tts: {
            voice_id: formData.voiceId
          }
        },
        workflow: {
          nodes: [
            {
              node_id: 'start',
              node_type: 'agent',
              initial_message: formData.firstMessage
            },
            {
              node_id: 'end',
              node_type: 'end'
            }
          ],
          edges: [
            {
              source_node_id: 'start',
              target_node_id: 'end',
              edge_type: 'none'
            }
          ]
        }
      }
    };

    await createAgent.mutateAsync(config);
  }

  return (
    <Card>
      <div className="space-y-4 p-6">
        <div>
          <label>Agent Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label>System Prompt</label>
          <Textarea
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            rows={6}
          />
        </div>
        <div>
          <label>Voice ID</label>
          <Input
            value={formData.voiceId}
            onChange={(e) => setFormData({ ...formData, voiceId: e.target.value })}
            placeholder="EXAVITQu4vr4xnSDxMaL"
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={createAgent.isPending}
        >
          {createAgent.isPending ? 'Creating...' : 'Create Agent'}
        </Button>
      </div>
    </Card>
  );
}
```

### 5. Agent Management Operations

```typescript
// packages/supabase/src/hooks/agents/use-agent-operations.ts

// Get agent details
export async function getAgent(agentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single();
  return data;
}

// List agents for business
export async function listAgents(businessId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('agents')
    .select('*')
    .eq('business_id', businessId)
    .eq('sync_status', 'synced');
  return data;
}

// Get agent metrics
export async function getAgentMetrics(
  agentId: string,
  period: 'day' | 'week' | 'month'
) {
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  const agent = await getAgent(agentId);
  const metrics = await elevenlabs.agents.getMetrics({
    agent_id: agent.elevenlabs_agent_id,
    period
  });

  return metrics;
}

// Test agent
export async function testAgent(agentId: string, userInput: string) {
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  const agent = await getAgent(agentId);
  const result = await elevenlabs.agents.simulate({
    agent_id: agent.elevenlabs_agent_id,
    user_input: userInput
  });

  return result;
}

// Sync agent configuration
export async function syncAgentConfig(agentId: string) {
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  const agent = await getAgent(agentId);

  // Get latest from ElevenLabs
  const latestConfig = await elevenlabs.agents.get({
    agent_id: agent.elevenlabs_agent_id
  });

  // Update in Henk
  const supabase = await createClient();
  await supabase
    .from('agents')
    .update({
      conversation_config: latestConfig.conversation_config,
      last_synced_at: new Date().toISOString()
    })
    .eq('id', agentId);
}
```

---

## Best Practices & Optimization

### 1. System Prompt Engineering

✅ **Do:**
- Be specific about the agent's role and scope
- Provide context about your organization
- List available actions/capabilities
- Define tone and communication style
- Include constraints and boundaries

❌ **Don't:**
- Use vague instructions
- Assume context the agent should know
- Create overly long prompts (quality > quantity)
- Forget to mention limitations

### 2. Knowledge Base Management

✅ **Do:**
- Segment large documents into focused sections
- Keep information current and accurate
- Use clear headings and structure
- Monitor conversation logs for gaps
- Regular quarterly reviews

❌ **Don't:**
- Upload raw, unstructured data
- Keep outdated information
- Mix multiple topics in one document
- Ignore user feedback about knowledge gaps

### 3. Workflow Design

✅ **Do:**
- Start simple, add complexity as needed
- Use LLM conditions for nuance
- Use expressions for deterministic logic
- Test each edge thoroughly
- Include fallback paths

❌ **Don't:**
- Create overly complex workflows immediately
- Use LLM conditions for simple routing
- Forget error handling paths
- Test only happy paths

### 4. Performance Optimization

```typescript
// Optimize TTS latency
const ttsConfig = {
  output_format: 'pcm_16000', // Better for streaming
  voice_settings: {
    stability: 50, // Lower = faster response
    similarity_boost: 75
  }
};

// Optimize ASR
const asrConfig = {
  quality: 'medium', // Balance quality vs latency
  keywords: ['critical-terms'] // Improve accuracy
};

// Optimize LLM
const llmConfig = {
  temperature: 0.5, // More consistent
  max_tokens: 300 // Shorter responses = faster
};
```

### 5. Cost Optimization

- Use streaming where possible
- Adjust quality levels based on use case
- Monitor tool usage for expensive calls
- Consider batch processing for non-real-time

---

## Troubleshooting Guide

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Agent not responding | Network timeout | Check API key, verify agent ID, check ElevenLabs status |
| Poor speech recognition | Wrong ASR provider/quality | Adjust quality level, add keywords, test audio format |
| Unnatural voice | Stability/similarity too high | Reduce stability setting, test different voices |
| Workflow routing fails | Condition logic error | Review condition syntax, use simulation to debug |
| Knowledge base not used | Documents not attached | Verify document IDs in config, check document status |
| Tool not executing | Tool definition error | Verify tool schema, test endpoint, check parameters |

---

## Resources & References

### Official Documentation
- [ElevenLabs Agents Platform](https://elevenlabs.io/docs/agents-platform/overview)
- [API Reference](https://elevenlabs.io/docs/agents-platform/api-reference)
- [Quickstart Guide](https://elevenlabs.io/docs/cookbooks/agents-platform/quickstart)

### SDKs & Libraries
- **Python:** `pip install elevenlabs`
- **Node.js:** `npm install @elevenlabs/elevenlabs-js`
- **React:** `npm install @elevenlabs/react`
- **React Native:** `npm install @elevenlabs/react-native`

### Integration Guides
- [Twilio Integration](https://elevenlabs.io/docs/integrations/twilio)
- [Voiceflow Integration](https://www.voiceflow.com/blog/build-a-custom-voice-ai-agent-with-elevenlabs-api)
- [Raspberry Pi Deployment](https://elevenlabs.io/docs/cookbooks/agents-platform/raspberry-pi)

### Learning Resources
- [Agent Workflows Deep Dive](https://www.webfuse.com/blog/a-deep-dive-into-elevenlabs-agent-workflows)
- [Building Intelligent Voice Agents](https://medium.com/@LakshmiNarayana_U/building-intelligent-voice-agents-with-elevenlabs-agent-workflows)
- [ElevenLabs Blog](https://elevenlabs.io/blog)

### Changelog
- [July 2025 Updates](https://elevenlabs.io/docs/changelog/2025/7/22)
- [2025 Roadmap](https://elevenlabs.io/docs/changelog)

---

## Appendix: Complete Example

### Full Agent Creation Example

```typescript
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

async function createCompleteDonorAgent() {
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  const completeConfig = {
    name: 'Comprehensive Donor Engagement Agent',
    tags: ['donor-engagement', 'production', 'v1.0'],

    conversation_config: {
      // ASR Settings
      asr: {
        provider: 'elevenlabs',
        quality: 'high',
        language: 'en',
        keywords: ['donation', 'fundraising', 'donor', 'campaign', 'impact']
      },

      // TTS Settings
      tts: {
        model: 'eleven_monolingual_v1',
        voice_id: 'EXAVITQu4vr4xnSDxMaL', // Professional female
        voice_settings: {
          stability: 75,
          similarity_boost: 80
        },
        output_format: 'mp3_44100'
      },

      // LLM Settings
      llm: {
        model: 'gpt-4-turbo',
        temperature: 0.7,
        max_tokens: 500
      },

      // Agent Behavior
      agent: {
        prompt: `You are a warm, empathetic fundraising agent for [Organization Name].

Your Purpose:
- Build meaningful relationships with donors
- Answer questions about our mission and impact
- Guide donors through the giving process
- Provide genuine appreciation and recognition

Your Capabilities:
- Accept donations of any amount
- Explain our current campaigns and projects
- Share impact stories and success metrics
- Schedule meetings with our development team
- Send donation materials and receipts

Communication Guidelines:
- Be authentic and genuine
- Use clear, accessible language
- Listen actively to donor concerns
- Acknowledge and appreciate all interest
- Never pressure - empower choice
- Maintain confidentiality

Organization Context:
[Include specific facts about the organization, current campaigns, mission statement, etc.]

When you don't know something, be honest and offer to connect the donor with our team.`,

        first_message: 'Hello! I\'m so glad you\'ve reached out. I\'d love to hear what brings you to us today and how I can help support your interest in our mission.',

        language: 'en',
        call_duration_minutes: 30,

        tools: [
          {
            tool_name: 'schedule_meeting',
            tool_type: 'server',
            description: 'Schedule a meeting with development team',
            server_url: 'https://your-domain.com/api/schedule-meeting',
            http_method: 'POST',
            parameters: [
              { name: 'donor_name', type: 'string', required: true },
              { name: 'email', type: 'string', required: true },
              { name: 'preferred_time', type: 'string', required: false }
            ]
          },
          {
            tool_name: 'process_donation',
            tool_type: 'server',
            description: 'Process donation through payment processor',
            server_url: 'https://your-domain.com/api/process-donation',
            http_method: 'POST',
            parameters: [
              { name: 'amount', type: 'number', required: true },
              { name: 'donor_email', type: 'string', required: true },
              { name: 'campaign_id', type: 'string', required: false }
            ]
          },
          {
            tool_name: 'transfer_to_agent',
            tool_type: 'system',
            description: 'Transfer to human agent',
            system_tool_type: 'transfer_to_agent'
          }
        ]
      },

      // Turn Management
      turn_management: {
        turn_timeout_seconds: 30,
        silence_timeout_ms: 3000,
        eagerness: 75,
        max_turn_duration: 300
      },

      // Knowledge Base
      knowledge_base: {
        document_ids: [
          'doc-mission-overview',
          'doc-current-campaigns',
          'doc-impact-stories',
          'doc-faq'
        ],
        document_types: ['file', 'web']
      }
    },

    // Platform Settings
    platform_settings: {
      widget: {
        variant: 'embedded',
        position: 'bottom_right',
        color_scheme: {
          primary_color: '#2563eb',
          background_color: '#ffffff',
          text_color: '#1f2937'
        },
        feedback_mode: 'enabled'
      },

      authentication: {
        type: 'none'
      },

      data_collection: {
        collect_conversations: true,
        collect_analytics: true,
        retention_days: 90
      },

      privacy: {
        gdpr_compliant: true
      },

      call_settings: {
        max_concurrent_calls: 100,
        max_calls_per_hour: 1000
      }
    },

    // Workflow Definition
    workflow: {
      nodes: [
        {
          node_id: 'welcome',
          node_type: 'agent',
          initial_message: 'Hello! Thanks for reaching out. How can I help you today?'
        },
        {
          node_id: 'assess_intent',
          node_type: 'agent',
          agent_node_config: {
            system_prompt_override: 'Listen to the donor and assess their primary intent: donation, information, scheduling meeting, or other.'
          }
        },
        {
          node_id: 'donation_path',
          node_type: 'agent',
          agent_node_config: {
            system_prompt_override: 'Guide the donor through our donation process. Discuss their preferred amount, impact areas, and recognition preferences.'
          }
        },
        {
          node_id: 'process_donation_tool',
          node_type: 'tool',
          tool_config: {
            tool_name: 'process_donation',
            tool_id: 'donation-processor'
          }
        },
        {
          node_id: 'donation_confirmation',
          node_type: 'agent',
          agent_node_config: {
            system_prompt_override: 'Thank the donor warmly, confirm their contribution details, and explain what happens next.'
          }
        },
        {
          node_id: 'info_path',
          node_type: 'agent',
          agent_node_config: {
            system_prompt_override: 'Answer questions about our mission, campaigns, and impact using the knowledge base.'
          }
        },
        {
          node_id: 'meeting_path',
          node_type: 'agent',
          agent_node_config: {
            system_prompt_override: 'Help schedule a meeting with our development team. Collect name, email, and preferred timing.'
          }
        },
        {
          node_id: 'schedule_meeting_tool',
          node_type: 'tool',
          tool_config: {
            tool_name: 'schedule_meeting',
            tool_id: 'meeting-scheduler'
          }
        },
        {
          node_id: 'schedule_confirmation',
          node_type: 'agent',
          agent_node_config: {
            system_prompt_override: 'Confirm the scheduled meeting details and thank them for their interest.'
          }
        },
        {
          node_id: 'escalation',
          node_type: 'transfer',
          transfer_config: {
            agent_id: 'human-support-agent-id'
          }
        },
        {
          node_id: 'end',
          node_type: 'end'
        }
      ],

      edges: [
        // Initial flow
        {
          source_node_id: 'welcome',
          target_node_id: 'assess_intent',
          edge_type: 'none'
        },

        // Route based on intent
        {
          source_node_id: 'assess_intent',
          target_node_id: 'donation_path',
          edge_type: 'condition_lm',
          condition_description: 'The donor wants to make a donation'
        },
        {
          source_node_id: 'assess_intent',
          target_node_id: 'info_path',
          edge_type: 'condition_lm',
          condition_description: 'The donor wants information about our work'
        },
        {
          source_node_id: 'assess_intent',
          target_node_id: 'meeting_path',
          edge_type: 'condition_lm',
          condition_description: 'The donor wants to schedule a meeting'
        },
        {
          source_node_id: 'assess_intent',
          target_node_id: 'escalation',
          edge_type: 'condition_lm',
          condition_description: 'The donor needs to speak with someone or has complex questions'
        },

        // Donation flow
        {
          source_node_id: 'donation_path',
          target_node_id: 'process_donation_tool',
          edge_type: 'none'
        },
        {
          source_node_id: 'process_donation_tool',
          target_node_id: 'donation_confirmation',
          edge_type: 'tool_result',
          tool_result_condition: 'success'
        },
        {
          source_node_id: 'process_donation_tool',
          target_node_id: 'escalation',
          edge_type: 'tool_result',
          tool_result_condition: 'failure'
        },
        {
          source_node_id: 'donation_confirmation',
          target_node_id: 'end',
          edge_type: 'none'
        },

        // Info flow
        {
          source_node_id: 'info_path',
          target_node_id: 'end',
          edge_type: 'none'
        },

        // Meeting flow
        {
          source_node_id: 'meeting_path',
          target_node_id: 'schedule_meeting_tool',
          edge_type: 'none'
        },
        {
          source_node_id: 'schedule_meeting_tool',
          target_node_id: 'schedule_confirmation',
          edge_type: 'tool_result',
          tool_result_condition: 'success'
        },
        {
          source_node_id: 'schedule_meeting_tool',
          target_node_id: 'escalation',
          edge_type: 'tool_result',
          tool_result_condition: 'failure'
        },
        {
          source_node_id: 'schedule_confirmation',
          target_node_id: 'end',
          edge_type: 'none'
        },

        // Fallback
        {
          source_node_id: 'escalation',
          target_node_id: 'end',
          edge_type: 'none'
        }
      ]
    }
  };

  try {
    const agent = await elevenlabs.agents.create(completeConfig);
    console.log('✓ Agent created:', agent.agent_id);
    return agent;
  } catch (error) {
    console.error('✗ Failed to create agent:', error);
    throw error;
  }
}
```

---

## Document Metadata

**Version:** 1.0
**Last Updated:** October 31, 2025
**Status:** Current & Up-to-Date
**Maintained By:** Claude Code
**Review Frequency:** Quarterly

### Changelog

- **v1.0** (October 31, 2025): Initial comprehensive guide covering:
  - ElevenLabs Agents Platform overview
  - Complete API specification
  - Configuration management
  - Implementation patterns
  - Deployment channels
  - Testing & monitoring
  - Integration with Henk platform
  - 2025 features including testing framework and complex workflow expressions
