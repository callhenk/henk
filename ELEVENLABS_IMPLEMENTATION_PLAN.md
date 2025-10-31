# ElevenLabs Agent Integration - Implementation Plan

**Created:** October 31, 2025
**Status:** Ready for Implementation
**LLM Choice:** ChatGPT (API key to be provided later)

---

## Executive Summary

The Henk platform already has foundational ElevenLabs integration in place. This plan outlines how to extend the current implementation to support the full ElevenLabs Agents Platform features including:

- Advanced conversation configuration (ASR, TTS, LLM settings)
- Workflow builder (nodes, edges, conditional routing)
- Knowledge base management
- Tools integration (server & system tools)
- Agent testing & monitoring
- Advanced analytics

**Current State:** Basic agent creation with minimal configuration
**Target State:** Full-featured agent creation with advanced configuration

---

## Current State Analysis

### What Already Exists ✅

1. **Database Schema**
   - `agents` table with 27 fields (agents/database.types.ts:63-162)
   - Fields already in place:
     - `elevenlabs_agent_id` (to store ElevenLabs agent ID)
     - `voice_id`, `voice_settings`, `voice_type`
     - `workflow_config` (JSONB for workflow)
     - `knowledge_base` (JSONB for knowledge base)
     - `starting_message`, `faqs`, `personality`
     - `organization_info`, `donor_context`
     - Status, timestamps, business_id, creator tracking

2. **Related Tables**
   - `workflows` - stores workflow definitions
   - `workflow_nodes` - individual workflow nodes with positions and data
   - `workflow_edges` - connections between nodes with conditions
   - `audio_generations` - for TTS audio generation tracking
   - `conversations` - conversation records with transcripts

3. **UI Components**
   - `CreateAgentPanel` (create-agent-panel.tsx) - Multi-step creation wizard
   - Agent list and detail views
   - Workflow builder components (workflow-canvas, node-types, etc.)
   - Voice testing components
   - FAQ editor

4. **API Routes**
   - POST `/api/elevenlabs-agent` - Create ElevenLabs agent
   - POST `/api/agents` - Create agent in Henk DB
   - POST `/api/agents/[id]/assign-phone` - Assign phone number
   - Multiple endpoints in `/api/elevenlabs-agent/*` for updates, details, knowledge base

5. **React Hooks**
   - `useCreateAgent()` - Create agent mutation
   - `useUpdateAgent()` - Update agent mutation
   - `useDeleteAgent()` - Delete agent mutation
   - `useAgents()` - Query agents
   - `useVoices()` - Get available voices

6. **Dependencies Already Installed**
   - `@elevenlabs/react`: "^0.4.5"
   - `react-hook-form`: "^7.56.4"
   - `zod`: "^3.25.32"
   - `@tanstack/react-query` (for mutations/queries)
   - `lucide-react` (for icons)

### What Needs to Be Built 🔨

---

## Implementation Plan (Phased)

### Phase 1: Database Extensions (Week 1)

#### 1.1 Add Configuration Tables

Create new migration: `add_agent_config_tables.sql`

```sql
-- Table for agent versions/configurations
CREATE TABLE agent_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  name VARCHAR(255),
  conversation_config JSONB,
  platform_settings JSONB,
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(agent_id, version_number)
);

-- Table for knowledge base documents
CREATE TABLE agent_knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  elevenlabs_doc_id UUID,
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(50), -- 'file' | 'web' | 'text'
  source_url TEXT,
  file_name TEXT,
  file_size_bytes INT,
  content TEXT, -- For small text documents
  status VARCHAR(50) DEFAULT 'active', -- 'active' | 'archived'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Table for workflow edge conditions (detailed)
CREATE TABLE workflow_edge_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edge_id UUID NOT NULL REFERENCES workflow_edges(id) ON DELETE CASCADE,
  condition_type VARCHAR(50), -- 'llm' | 'expression' | 'tool_result' | 'none'
  condition_description TEXT, -- For LLM conditions
  condition_expression TEXT, -- For expression conditions
  tool_result_condition VARCHAR(50), -- 'success' | 'failure'
  edge_order INT, -- For deterministic evaluation
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table for tools configuration
CREATE TABLE agent_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  tool_name VARCHAR(255) NOT NULL,
  tool_type VARCHAR(50), -- 'server' | 'system'
  description TEXT,
  server_url TEXT,
  http_method VARCHAR(10), -- GET, POST, PUT, DELETE
  system_tool_type VARCHAR(50), -- For system tools
  parameters JSONB, -- Array of parameter definitions
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for agent test configurations
CREATE TABLE agent_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  test_name VARCHAR(255) NOT NULL,
  description TEXT,
  test_scenarios JSONB, -- Array of test cases
  expected_outcomes JSONB,
  pass_criteria JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for test execution results
CREATE TABLE agent_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES agent_tests(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id),
  execution_status VARCHAR(50), -- 'pending' | 'running' | 'completed' | 'failed'
  total_tests INT,
  passed_tests INT,
  failed_tests INT,
  coverage DECIMAL,
  issues JSONB,
  executed_at TIMESTAMP DEFAULT NOW(),
  duration_ms INT
);

-- Table for agent analytics/metrics
CREATE TABLE agent_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id),
  metric_date DATE NOT NULL,
  total_conversations INT DEFAULT 0,
  avg_duration_seconds DECIMAL,
  user_satisfaction DECIMAL, -- 0-100
  falloff_rate DECIMAL, -- percentage
  error_rate DECIMAL,
  tool_usage JSONB, -- Distribution of tool calls
  intent_distribution JSONB, -- User intent breakdown
  language_distribution JSONB, -- Languages used
  peak_hours TEXT[], -- Peak usage hours
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_id, metric_date)
);

-- Indexes for performance
CREATE INDEX idx_agent_versions_agent_id ON agent_versions(agent_id);
CREATE INDEX idx_knowledge_docs_agent_id ON agent_knowledge_documents(agent_id);
CREATE INDEX idx_workflow_edges_conditions ON workflow_edge_conditions(edge_id);
CREATE INDEX idx_agent_tools_agent_id ON agent_tools(agent_id);
CREATE INDEX idx_agent_tests_agent_id ON agent_tests(agent_id);
CREATE INDEX idx_test_results_agent_id ON agent_test_results(agent_id);
CREATE INDEX idx_analytics_agent_date ON agent_analytics(agent_id, metric_date);

-- RLS (Row Level Security) Policies
-- Enable RLS
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_analytics ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access agents for their business
CREATE POLICY "Users can view versions of agents in their business"
  ON agent_versions FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE business_id IN (
        SELECT business_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Similar policies for other tables...
```

#### 1.2 Enhance Agents Table

Update agents table with additional columns:

```sql
ALTER TABLE agents ADD COLUMN IF NOT EXISTS (
  -- ASR Configuration
  asr_provider VARCHAR(50) DEFAULT 'elevenlabs', -- elevenlabs, deepgram, google, openai
  asr_quality VARCHAR(50) DEFAULT 'high', -- low, medium, high
  asr_language VARCHAR(10) DEFAULT 'en',
  asr_keywords TEXT[],

  -- LLM Configuration
  llm_model VARCHAR(255) DEFAULT 'gpt-4-turbo', -- Will use ChatGPT
  llm_temperature DECIMAL DEFAULT 0.7,
  llm_max_tokens INT DEFAULT 500,
  custom_llm_url TEXT,
  custom_llm_api_key TEXT, -- Will be encrypted

  -- TTS Configuration
  tts_model VARCHAR(255) DEFAULT 'eleven_monolingual_v1',
  tts_stability INT DEFAULT 75,
  tts_similarity_boost INT DEFAULT 75,
  tts_output_format VARCHAR(50) DEFAULT 'mp3_44100',

  -- Conversation Parameters
  conversation_config JSONB, -- Comprehensive config object
  conversation_text_only BOOLEAN DEFAULT false,
  conversation_duration_minutes INT DEFAULT 30,

  -- Turn Management
  turn_timeout_seconds INT DEFAULT 30,
  silence_timeout_ms INT DEFAULT 3000,
  turn_eagerness INT DEFAULT 75, -- 0-100
  max_turn_duration INT DEFAULT 300,

  -- Sync Status
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(50) DEFAULT 'pending', -- pending, synced, error
  sync_error TEXT,

  -- Platform Settings
  platform_settings JSONB,

  -- Metadata
  tags TEXT[],
  metadata JSONB
);
```

#### 1.3 Update Database Types

Run: `pnpm supabase:typegen`

This will regenerate types in both:
- `packages/supabase/src/database.types.ts`
- `apps/web/lib/database.types.ts`

---

### Phase 2: API Routes (Week 1-2)

#### 2.1 Agent Creation & Configuration Routes

**File:** `apps/web/app/api/agents/create/route.ts`

```typescript
// POST /api/agents/create
// Full agent creation with ElevenLabs integration
// Body: {
//   businessId: string,
//   agentConfig: CompleteAgentConfig,
//   createElevenLabsAgent: boolean // if false, use existing elevenlabs_agent_id
// }
```

**Features:**
- Accept comprehensive agent configuration
- Create ElevenLabs agent with full conversation_config
- Store configuration in Henk database
- Handle errors and sync status

#### 2.2 Configuration Management Routes

**File:** `apps/web/app/api/agents/[id]/config/route.ts`

```typescript
// GET - Get full agent configuration
// PUT - Update agent configuration (creates new version)
// Includes: conversation_config, platform_settings, workflow
```

#### 2.3 Knowledge Base Routes

**File:** `apps/web/app/api/agents/[id]/knowledge-base/route.ts`

```typescript
// GET - List knowledge base documents
// POST - Add document to knowledge base

// Existing files:
// - POST /api/elevenlabs-agent/knowledge-base/upload - Upload files
// - DELETE /api/elevenlabs-agent/knowledge-base/[id] - Remove documents
```

#### 2.4 Workflow Management Routes

**File:** `apps/web/app/api/agents/[id]/workflow/route.ts`

```typescript
// GET - Get workflow definition
// PUT - Update workflow (nodes and edges)
// POST - Save as new version

// Validate:
// - All nodes referenced in edges exist
// - No orphaned nodes
// - Valid node types
// - Proper edge routing
```

#### 2.5 Tools Management Routes

**File:** `apps/web/app/api/agents/[id]/tools/route.ts`

```typescript
// GET - List agent tools
// POST - Add tool
// PUT - Update tool
// DELETE - Remove tool

// Validate tool configuration:
// - Server URL is reachable
// - Parameters are valid
// - Tool name is unique
```

#### 2.6 Testing Routes

**Files:**
- `apps/web/app/api/agents/[id]/test/create/route.ts` - Create test configuration
- `apps/web/app/api/agents/[id]/test/run/route.ts` - Run tests
- `apps/web/app/api/agents/[id]/test/results/route.ts` - Get test results

#### 2.7 Sync & Analytics Routes

**Files:**
- `apps/web/app/api/agents/[id]/sync/route.ts` - Sync with ElevenLabs
- `apps/web/app/api/agents/[id]/metrics/route.ts` - Get analytics

---

### Phase 3: React Hooks & Services (Week 2)

#### 3.1 Conversation Config Hooks

**File:** `packages/supabase/src/hooks/agents/use-agent-config.ts`

```typescript
export function useAgentConversationConfig(agentId: string) {
  // Query agent's conversation configuration
}

export function useUpdateConversationConfig() {
  // Mutation to update conversation config
}

export function useValidateConversationConfig() {
  // Validate config before saving
}
```

#### 3.2 Workflow Hooks

**File:** `packages/supabase/src/hooks/agents/use-agent-workflow.ts`

```typescript
export function useAgentWorkflow(agentId: string) {
  // Get workflow definition
}

export function useUpdateAgentWorkflow() {
  // Update workflow (nodes and edges)
}

export function useValidateWorkflow() {
  // Validate workflow structure
}

export function useWorkflowVersions(agentId: string) {
  // Get workflow version history
}
```

#### 3.3 Knowledge Base Hooks

**File:** `packages/supabase/src/hooks/agents/use-agent-knowledge-base.ts`

```typescript
export function useKnowledgeDocuments(agentId: string) {
  // List knowledge base documents
}

export function useAddKnowledgeDocument() {
  // Add document (file, URL, or text)
}

export function useRemoveKnowledgeDocument() {
  // Remove document
}

export function useUploadKnowledgeFile() {
  // Upload file to knowledge base
}
```

#### 3.4 Tools Hooks

**File:** `packages/supabase/src/hooks/agents/use-agent-tools.ts`

```typescript
export function useAgentTools(agentId: string) {
  // List agent tools
}

export function useAddAgentTool() {
  // Add tool configuration
}

export function useUpdateAgentTool() {
  // Update tool
}

export function useRemoveAgentTool() {
  // Remove tool
}

export function useValidateTool() {
  // Validate tool configuration (endpoint reachable, etc.)
}
```

#### 3.5 Testing Hooks

**File:** `packages/supabase/src/hooks/agents/use-agent-testing.ts`

```typescript
export function useCreateAgentTest() {
  // Create test configuration
}

export function useRunAgentTests() {
  // Execute tests
}

export function useAgentTestResults(agentId: string) {
  // Get test results
}

export function useSimulateAgentConversation() {
  // Single test conversation
}
```

#### 3.6 Analytics Hooks

**File:** `packages/supabase/src/hooks/agents/use-agent-analytics.ts`

```typescript
export function useAgentMetrics(agentId: string, period: 'day' | 'week' | 'month') {
  // Get agent metrics
}

export function useAgentAnalytics(agentId: string) {
  // Get detailed analytics
}
```

#### 3.7 ElevenLabs Service

**File:** `apps/web/lib/elevenlabs/client.ts`

```typescript
// Wrapper around @elevenlabs/react SDK for server-side operations
export const elevenlabsClient = {
  // Agent operations
  createAgent(config: AgentConfig),
  updateAgent(agentId: string, config: Partial<AgentConfig>),
  getAgent(agentId: string),
  listAgents(),
  deleteAgent(agentId: string),

  // Workflow operations
  updateWorkflow(agentId: string, workflow: Workflow),

  // Knowledge base
  addDocument(agentId: string, doc: Document),
  removeDocument(agentId: string, docId: string),

  // Simulation & testing
  simulateConversation(agentId: string, input: string),
  simulateConversationStream(agentId: string, input: string),

  // Metrics
  getMetrics(agentId: string, period: string),
}
```

---

### Phase 4: UI Components (Week 2-3)

#### 4.1 Conversation Configuration Panel

**File:** `apps/web/app/home/agents/[id]/_components/conversation-config.tsx`

```typescript
// Component to configure:
// - ASR settings (provider, quality, keywords)
// - LLM settings (model, temperature, tokens)
// - TTS settings (voice, stability, speed)
// - Turn management (timeouts, eagerness)
// - System prompt editor with validation
// - First message editor
```

**Features:**
- Form validation with Zod
- Live preview of configuration
- Preset templates
- Save as version

#### 4.2 Advanced Workflow Builder

**Enhance:** `apps/web/app/home/agents/[id]/_components/workflow-builder/`

**Additions:**
- LLM condition editor (natural language)
- Expression editor (with variable hints)
- Tool node configuration
- Transfer node configuration (agent or phone)
- Edge condition validation
- Visual feedback for routing logic
- Workflow testing mode

#### 4.3 Knowledge Base Manager

**File:** `apps/web/app/home/agents/[id]/_components/knowledge-base-manager.tsx`

```typescript
// Upload/manage knowledge base documents:
// - File upload (PDF, TXT, DOCX, HTML, EPUB)
// - URL import
// - Text entry
// - Document preview
// - Status tracking
// - Size management (20MB limit)
```

#### 4.4 Tools Configuration Panel

**File:** `apps/web/app/home/agents/[id]/_components/tools-config.tsx`

```typescript
// Configure tools:
// - Add server tools (URL, HTTP method, parameters)
// - Add system tools (transfer, handoff)
// - Test tool endpoints
// - Parameter definitions
// - Tool usage in workflows
```

#### 4.5 Agent Testing Interface

**File:** `apps/web/app/home/agents/[id]/_components/testing/`

```typescript
// Create and run tests:
// - Test scenario definition
// - Run individual tests
// - View test results
// - Coverage metrics
// - Issue tracking
```

#### 4.6 Analytics Dashboard

**File:** `apps/web/app/home/agents/[id]/_components/analytics/`

```typescript
// Display agent metrics:
// - Conversation metrics (count, duration, satisfaction)
// - Intent distribution
// - Language distribution
// - Error rates
// - Tool usage
// - Falloff analysis
// - Charts and graphs
```

---

### Phase 5: Enhanced Agent Creator (Week 3)

#### 5.1 Multi-Step Configuration Wizard

**Enhance:** `apps/web/app/home/agents/_components/create-agent-panel.tsx`

**New Steps:**
1. Agent Information (name, description)
2. Voice Configuration (voice selection)
3. Conversation Config (ASR, LLM, TTS settings)
4. Workflow Template (basic or advanced)
5. Knowledge Base (optional upload)
6. Tools (optional configuration)
7. Review & Create

#### 5.2 Configuration Presets

**File:** `apps/web/lib/elevenlabs/agent-presets.ts`

```typescript
// Pre-configured templates for:
// - Donor engagement agent
// - Customer support agent
// - Sales agent
// - Information assistant
// - Survey agent

export const AGENT_TEMPLATES = {
  donor_engagement: { conversation_config: {...}, workflow: {...} },
  // ...
}
```

---

### Phase 6: Advanced Features (Week 3-4)

#### 6.1 Agent Versioning

- Store multiple versions of configuration
- Compare versions
- Rollback to previous version
- Deployment management

#### 6.2 Sync Management

- Manual sync with ElevenLabs
- Auto-sync on changes
- Conflict resolution
- Sync history

#### 6.3 Performance Optimization

- Configuration caching
- Query optimization
- Lazy loading of workflow/KB
- Analytics aggregation

#### 6.4 Error Handling & Logging

- Comprehensive error messages
- Debug logging
- Error analytics
- User-friendly fallbacks

---

## API Integration Details

### Environment Variables Required

Add to `.env.local`:

```bash
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_WORKSPACE_ID=your_workspace_id # Optional

# ChatGPT Configuration (to be provided)
OPENAI_API_KEY=your_openai_key_here

# Feature Flags
ENABLE_ADVANCED_WORKFLOWS=true
ENABLE_AGENT_TESTING=true
ENABLE_KNOWLEDGE_BASE=true
```

### Data Structures

#### Agent Configuration Object

```typescript
interface AgentConfig {
  name: string;
  description?: string;
  tags?: string[];

  conversation_config: {
    asr?: {
      provider?: 'elevenlabs' | 'deepgram' | 'google' | 'openai';
      quality?: 'low' | 'medium' | 'high';
      language?: string;
      audio_format?: string;
      keywords?: string[];
    };

    llm?: {
      model?: string; // 'gpt-4-turbo', etc.
      temperature?: number; // 0-1
      max_tokens?: number;
      custom_llm_url?: string;
    };

    tts?: {
      model?: string;
      voice_id?: string;
      voice_settings?: {
        stability?: number;
        similarity_boost?: number;
      };
      output_format?: string;
    };

    agent?: {
      prompt: string;
      first_message?: string;
      language?: string;
      text_only_mode?: boolean;
      call_duration_minutes?: number;
      tools?: Tool[];
    };

    turn_management?: {
      turn_timeout_seconds?: number;
      silence_timeout_ms?: number;
      eagerness?: number;
      max_turn_duration?: number;
    };

    knowledge_base?: {
      document_ids?: string[];
      document_types?: string[];
    };
  };

  workflow?: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };

  platform_settings?: {
    widget?: {
      variant?: string;
      position?: string;
      color_scheme?: Record<string, string>;
    };
    authentication?: {
      type?: string;
      provider?: string;
    };
    // ... other settings
  };
}
```

---

## Testing Strategy

### Unit Tests

- Conversation config validation
- Workflow structure validation
- Tool configuration validation
- Hook functions

### Integration Tests

- End-to-end agent creation
- ElevenLabs API integration
- Database operations
- Knowledge base upload

### E2E Tests

- Complete agent creation workflow
- Configuration update workflow
- Knowledge base management
- Workflow builder operations

---

## Rollout Plan

### Week 1
- ✅ Database schema updates
- ✅ API routes (basic CRUD)

### Week 2
- ✅ React hooks and services
- ✅ Conversation config UI

### Week 3
- ✅ Workflow builder enhancements
- ✅ Knowledge base manager
- ✅ Tools configuration

### Week 4
- ✅ Testing framework
- ✅ Analytics dashboard
- ✅ Documentation

---

## Risk Assessment

### High Risk Items
1. **ElevenLabs API Rate Limits** - Monitor API usage
2. **Large Knowledge Bases** - Optimize storage/retrieval
3. **Complex Workflows** - Performance testing needed

### Mitigation
- Implement rate limiting on API routes
- Cache frequently accessed data
- Lazy load workflow definitions
- Test with large datasets early

---

## Success Criteria

✅ Agent creation with full configuration
✅ Knowledge base upload and management
✅ Advanced workflow builder
✅ Tools integration
✅ Agent testing framework
✅ Analytics and monitoring
✅ All tests passing
✅ Zero breaking changes to existing features

---

## Dependencies & Compatibility

### Current Stack
- ✅ Next.js 15
- ✅ React 19
- ✅ TypeScript 5
- ✅ Supabase (PostgreSQL)
- ✅ Tailwind CSS 4
- ✅ @tanstack/react-query
- ✅ react-hook-form
- ✅ zod
- ✅ @elevenlabs/react

### Additional Package Considerations
- `@dnd-kit/*` - For drag-and-drop in workflow builder (if not using React Flow)
- `recharts` - For analytics charts (if not already included)
- `zustand` - State management for workflow builder (if needed)

---

## File Structure Summary

```
apps/web/
├── app/
│   ├── api/
│   │   └── agents/
│   │       ├── route.ts (enhanced)
│   │       ├── create/route.ts (new)
│   │       ├── [id]/
│   │       │   ├── route.ts (enhanced)
│   │       │   ├── config/route.ts (new)
│   │       │   ├── workflow/route.ts (new)
│   │       │   ├── tools/route.ts (new)
│   │       │   ├── knowledge-base/route.ts (new)
│   │       │   ├── test/
│   │       │   │   ├── create/route.ts (new)
│   │       │   │   ├── run/route.ts (new)
│   │       │   │   └── results/route.ts (new)
│   │       │   ├── sync/route.ts (new)
│   │       │   └── metrics/route.ts (new)
│   │       └── train/route.ts (existing)
│   ├── home/agents/
│   │   ├── _components/
│   │   │   ├── create-agent-panel.tsx (enhanced)
│   │   │   ├── conversation-config.tsx (new)
│   │   │   ├── knowledge-base-manager.tsx (new)
│   │   │   ├── tools-config.tsx (new)
│   │   │   ├── testing/
│   │   │   │   └── agent-testing.tsx (new)
│   │   │   ├── analytics/
│   │   │   │   └── analytics-dashboard.tsx (new)
│   │   │   └── workflow-builder/ (enhanced)
│   │   └── [id]/page.tsx (enhanced)
│   └── lib/
│       └── elevenlabs/
│           ├── client.ts (new)
│           ├── agent-presets.ts (new)
│           └── types.ts (new)
│
packages/supabase/src/
├── hooks/
│   └── agents/
│       ├── use-agent-mutations.ts (enhanced)
│       ├── use-agent-config.ts (new)
│       ├── use-agent-workflow.ts (new)
│       ├── use-agent-knowledge-base.ts (new)
│       ├── use-agent-tools.ts (new)
│       ├── use-agent-testing.ts (new)
│       └── use-agent-analytics.ts (new)
└── database.types.ts (auto-generated after migrations)
```

---

## Performance Targets

- **Agent Creation:** < 2 seconds
- **Configuration Save:** < 1 second
- **Knowledge Base Upload:** < 5 seconds
- **Workflow Save:** < 1 second
- **Metrics Load:** < 2 seconds
- **API Response Time:** < 500ms (excluding external calls)

---

## Documentation Deliverables

1. ✅ Implementation Plan (this document)
2. 🔄 API Documentation (with examples)
3. 🔄 Component Documentation
4. 🔄 User Guide
5. 🔄 Admin Guide
6. 🔄 Troubleshooting Guide

---

## Questions & Clarifications

### Clarified
- ✅ Using ChatGPT for LLM (API key to be provided later)
- ✅ Using existing database schema with enhancements
- ✅ Using existing UI components and patterns

### To Clarify
- [ ] Should we support multiple LLM providers initially or just ChatGPT?
- [ ] What's the priority: Basic features first or full feature set?
- [ ] Should knowledge base auto-sync with external sources (URLs)?
- [ ] Do we need real-time collaboration features in workflow builder?
- [ ] What's the SLA for agent analytics updates?

---

## Next Steps

1. **Week 1 Start:** Kick off database migrations
2. **Week 1 End:** Complete API routes
3. **Week 2 Start:** Begin React component development
4. **Week 3 Start:** Testing and refinement
5. **Week 4 End:** Production deployment

---

**Status:** Ready for Implementation
**Approval Required From:** Engineering Lead
**Document Version:** 1.0
