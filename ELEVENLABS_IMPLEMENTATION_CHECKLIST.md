# ElevenLabs Implementation - Technical Checklist

**Last Updated:** October 31, 2025
**Status:** Ready for Implementation

---

## Phase 1: Database Setup (Week 1)

### Database Migrations
- [ ] Create migration file: `add_agent_config_tables.sql`
- [ ] Create `agent_versions` table
- [ ] Create `agent_knowledge_documents` table
- [ ] Create `workflow_edge_conditions` table
- [ ] Create `agent_tools` table
- [ ] Create `agent_tests` table
- [ ] Create `agent_test_results` table
- [ ] Create `agent_analytics` table
- [ ] Add indexes to all new tables
- [ ] Enable RLS policies on new tables
- [ ] Add columns to `agents` table:
  - [ ] ASR settings (provider, quality, language, keywords)
  - [ ] LLM settings (model, temperature, max_tokens, custom_llm_url)
  - [ ] TTS settings (model, stability, similarity_boost, output_format)
  - [ ] Conversation parameters (turn_timeout, silence_timeout, eagerness)
  - [ ] Sync status tracking (last_synced_at, sync_status, sync_error)
  - [ ] Platform settings (JSONB)
  - [ ] Tags array
  - [ ] Metadata JSONB
- [ ] Create RLS policies for `agents` table relations
- [ ] Run migration: `pnpm supabase:reset`
- [ ] Generate types: `pnpm supabase:typegen`
- [ ] Copy to app types: Update `apps/web/lib/database.types.ts`
- [ ] Test: Verify all tables created and accessible

### Database Testing
- [ ] Query agent_versions from agent
- [ ] Query knowledge_documents from agent
- [ ] Test RLS policies with team members
- [ ] Test concurrent inserts
- [ ] Verify indexes are used in EXPLAIN PLAN

---

## Phase 2: API Routes (Week 1-2)

### Agent Creation & Config Routes
- [ ] Create `apps/web/app/api/agents/create/route.ts`
  - [ ] POST endpoint for full agent creation
  - [ ] Validate config before ElevenLabs call
  - [ ] Create ElevenLabs agent
  - [ ] Store config in Henk DB
  - [ ] Handle errors gracefully
  - [ ] Log all operations
  - [ ] Return agent with ID

- [ ] Create `apps/web/app/api/agents/[id]/config/route.ts`
  - [ ] GET agent configuration
  - [ ] PUT to update configuration
  - [ ] Create new version on update
  - [ ] Validate config changes
  - [ ] Sync with ElevenLabs
  - [ ] Track change history

### Workflow Routes
- [ ] Create `apps/web/app/api/agents/[id]/workflow/route.ts`
  - [ ] GET workflow definition
  - [ ] PUT to update workflow
  - [ ] Validate node references
  - [ ] Validate edge connections
  - [ ] Check for orphaned nodes
  - [ ] Create workflow versions
  - [ ] Sync with ElevenLabs

- [ ] Create workflow validation utility
  - [ ] Check all edges reference valid nodes
  - [ ] Validate node types
  - [ ] Check edge conditions are valid
  - [ ] Ensure no cycles (or allow if needed)
  - [ ] Validate condition syntax

### Knowledge Base Routes
- [ ] Create `apps/web/app/api/agents/[id]/knowledge-base/route.ts`
  - [ ] GET list documents
  - [ ] POST add document
  - [ ] Track document metadata
  - [ ] Update sync status

- [ ] Enhance existing upload routes
  - [ ] POST `/api/elevenlabs-agent/knowledge-base/upload`
  - [ ] POST `/api/elevenlabs-agent/knowledge-base/upload` (files)
  - [ ] DELETE `/api/elevenlabs-agent/knowledge-base/[id]`
  - [ ] Add progress tracking
  - [ ] Handle large files

### Tools Routes
- [ ] Create `apps/web/app/api/agents/[id]/tools/route.ts`
  - [ ] GET list tools
  - [ ] POST add tool
  - [ ] PUT update tool
  - [ ] DELETE remove tool
  - [ ] Validate tool configuration
  - [ ] Test tool endpoints

- [ ] Create tool validation utility
  - [ ] Validate server URLs are reachable
  - [ ] Check HTTP methods
  - [ ] Validate parameter definitions
  - [ ] Ensure tool names are unique

### Testing Routes
- [ ] Create `apps/web/app/api/agents/[id]/test/create/route.ts`
  - [ ] POST to create test configuration
  - [ ] Store test in DB
  - [ ] Validate test scenarios

- [ ] Create `apps/web/app/api/agents/[id]/test/run/route.ts`
  - [ ] POST to execute tests
  - [ ] Call ElevenLabs simulation
  - [ ] Store results
  - [ ] Return results to client

- [ ] Create `apps/web/app/api/agents/[id]/test/results/route.ts`
  - [ ] GET test results
  - [ ] GET test history
  - [ ] Calculate coverage metrics

### Metrics Routes
- [ ] Create `apps/web/app/api/agents/[id]/metrics/route.ts`
  - [ ] GET agent metrics for period
  - [ ] Calculate aggregates
  - [ ] Return formatted data
  - [ ] Support daily/weekly/monthly periods

- [ ] Create `apps/web/app/api/agents/[id]/sync/route.ts`
  - [ ] POST to sync with ElevenLabs
  - [ ] Pull latest config from EL
  - [ ] Update DB
  - [ ] Handle conflicts

### Route Testing
- [ ] Test all routes with curl/Postman
- [ ] Test error responses
- [ ] Test authentication
- [ ] Test authorization (business_id checks)
- [ ] Test rate limiting
- [ ] Test concurrent requests

---

## Phase 2: React Hooks & Services (Week 2)

### Conversation Config Hooks
- [ ] Create `packages/supabase/src/hooks/agents/use-agent-config.ts`
  - [ ] `useAgentConversationConfig(agentId)` - Query hook
  - [ ] `useUpdateConversationConfig()` - Mutation hook
  - [ ] `useValidateConversationConfig()` - Validation hook
  - [ ] Handle loading states
  - [ ] Handle errors
  - [ ] Cache invalidation

### Workflow Hooks
- [ ] Create `packages/supabase/src/hooks/agents/use-agent-workflow.ts`
  - [ ] `useAgentWorkflow(agentId)` - Query hook
  - [ ] `useUpdateAgentWorkflow()` - Mutation hook
  - [ ] `useValidateWorkflow()` - Validation hook
  - [ ] `useWorkflowVersions(agentId)` - Query hook
  - [ ] Handle versioning
  - [ ] Track changes

### Knowledge Base Hooks
- [ ] Create `packages/supabase/src/hooks/agents/use-agent-knowledge-base.ts`
  - [ ] `useKnowledgeDocuments(agentId)` - Query hook
  - [ ] `useAddKnowledgeDocument()` - Mutation hook
  - [ ] `useRemoveKnowledgeDocument()` - Mutation hook
  - [ ] `useUploadKnowledgeFile()` - Upload hook
  - [ ] Track upload progress
  - [ ] Handle file types

### Tools Hooks
- [ ] Create `packages/supabase/src/hooks/agents/use-agent-tools.ts`
  - [ ] `useAgentTools(agentId)` - Query hook
  - [ ] `useAddAgentTool()` - Mutation hook
  - [ ] `useUpdateAgentTool()` - Mutation hook
  - [ ] `useRemoveAgentTool()` - Mutation hook
  - [ ] `useValidateTool()` - Validation hook
  - [ ] Test tool endpoints

### Testing Hooks
- [ ] Create `packages/supabase/src/hooks/agents/use-agent-testing.ts`
  - [ ] `useCreateAgentTest()` - Mutation hook
  - [ ] `useRunAgentTests()` - Mutation hook
  - [ ] `useAgentTestResults(agentId)` - Query hook
  - [ ] `useSimulateAgentConversation()` - Mutation hook
  - [ ] Track execution status
  - [ ] Handle long-running operations

### Analytics Hooks
- [ ] Create `packages/supabase/src/hooks/agents/use-agent-analytics.ts`
  - [ ] `useAgentMetrics(agentId, period)` - Query hook
  - [ ] `useAgentAnalytics(agentId)` - Query hook
  - [ ] Format data for charts
  - [ ] Handle empty data

### ElevenLabs Service
- [ ] Create `apps/web/lib/elevenlabs/client.ts`
  - [ ] Wrap @elevenlabs/react SDK
  - [ ] Create agent operations
  - [ ] Update agent operations
  - [ ] Get agent operations
  - [ ] List agents operation
  - [ ] Delete agent operation
  - [ ] Handle API errors
  - [ ] Add request logging
  - [ ] Add retry logic

- [ ] Create `apps/web/lib/elevenlabs/types.ts`
  - [ ] Define AgentConfig type
  - [ ] Define Workflow types
  - [ ] Define Tool types
  - [ ] Define Document types
  - [ ] Define Test types
  - [ ] Export all types

- [ ] Create `apps/web/lib/elevenlabs/agent-presets.ts`
  - [ ] Define donor engagement preset
  - [ ] Define customer support preset
  - [ ] Define sales preset
  - [ ] Define information assistant preset
  - [ ] Define survey preset
  - [ ] Add more as needed

### Validators
- [ ] Create `apps/web/lib/elevenlabs/validators.ts`
  - [ ] Conversation config validator (Zod)
  - [ ] Workflow validator (Zod)
  - [ ] Tool validator (Zod)
  - [ ] Document validator (Zod)
  - [ ] Config validation utilities

### Hook Testing
- [ ] Test all query hooks
- [ ] Test all mutation hooks
- [ ] Test error handling
- [ ] Test cache invalidation
- [ ] Test loading states

---

## Phase 3: UI Components (Week 2-3)

### Conversation Config Component
- [ ] Create `apps/web/app/home/agents/[id]/_components/conversation-config.tsx`
  - [ ] ASR settings panel
    - [ ] Provider select
    - [ ] Quality select
    - [ ] Language select
    - [ ] Keywords input
  - [ ] LLM settings panel
    - [ ] Model select (with ChatGPT default)
    - [ ] Temperature slider
    - [ ] Max tokens input
    - [ ] Custom LLM URL (optional)
  - [ ] TTS settings panel
    - [ ] Model select
    - [ ] Voice preview
    - [ ] Stability slider
    - [ ] Similarity boost slider
    - [ ] Output format select
  - [ ] System prompt editor
    - [ ] Large textarea
    - [ ] Syntax highlighting
    - [ ] Character count
    - [ ] Validation feedback
  - [ ] First message editor
  - [ ] Save button
  - [ ] Version history button
  - [ ] Form validation
  - [ ] Error messages

### Knowledge Base Manager
- [ ] Create `apps/web/app/home/agents/[id]/_components/knowledge-base-manager.tsx`
  - [ ] File upload section
    - [ ] Drag & drop
    - [ ] File type filtering
    - [ ] Size validation
    - [ ] Upload progress
  - [ ] URL import section
    - [ ] URL input
    - [ ] Validate URL
    - [ ] Import button
  - [ ] Text input section
    - [ ] Large textarea
    - [ ] Save as document
  - [ ] Document list
    - [ ] Show file name
    - [ ] Show size
    - [ ] Show date added
    - [ ] Show status
    - [ ] Delete button
    - [ ] Preview button
  - [ ] Storage usage indicator
  - [ ] Size limit warning

### Tools Configuration Component
- [ ] Create `apps/web/app/home/agents/[id]/_components/tools-config.tsx`
  - [ ] Tools list
    - [ ] Show tool name
    - [ ] Show type (server/system)
    - [ ] Show description
    - [ ] Edit button
    - [ ] Delete button
    - [ ] Test button
  - [ ] Add tool dialog
    - [ ] Tool name input
    - [ ] Tool type select
    - [ ] Description input
    - [ ] Server URL (conditional)
    - [ ] HTTP method (conditional)
    - [ ] Parameters editor
    - [ ] Save button
  - [ ] Test tool dialog
    - [ ] URL reachability check
    - [ ] Parameter preview
    - [ ] Response preview
  - [ ] System tools section
    - [ ] List available system tools
    - [ ] Show descriptions

### Advanced Workflow Builder Enhancements
- [ ] Enhance `apps/web/app/home/agents/[id]/_components/workflow-builder/`
  - [ ] LLM condition editor
    - [ ] Natural language input
    - [ ] Preview condition
    - [ ] Validate condition
  - [ ] Expression editor
    - [ ] Visual expression builder
    - [ ] Variable hints
    - [ ] Syntax help
    - [ ] Test expression
  - [ ] Tool node editor
    - [ ] Select tool
    - [ ] Configure parameters
    - [ ] Test execution
    - [ ] Handle success/failure
  - [ ] Transfer node editor
    - [ ] Select target agent or phone
    - [ ] Add notes
  - [ ] Edge condition validation
    - [ ] Visual feedback
    - [ ] Error messages
  - [ ] Testing mode
    - [ ] Simulate conversation
    - [ ] Step through workflow
    - [ ] View decisions

### Agent Testing Interface
- [ ] Create `apps/web/app/home/agents/[id]/_components/testing/agent-testing.tsx`
  - [ ] Test list
    - [ ] Show test name
    - [ ] Show description
    - [ ] Show status
    - [ ] Run button
    - [ ] Edit button
    - [ ] Delete button
  - [ ] Create test dialog
    - [ ] Test name input
    - [ ] Description input
    - [ ] Test scenario editor
      - [ ] Add scenario
      - [ ] Input message
      - [ ] Expected response pattern
      - [ ] Expected tool calls
    - [ ] Save button
  - [ ] Test results
    - [ ] Show pass/fail
    - [ ] Show coverage
    - [ ] Show issues
    - [ ] Export results

### Analytics Dashboard
- [ ] Create `apps/web/app/home/agents/[id]/_components/analytics/`
  - [ ] Metrics summary cards
    - [ ] Total conversations
    - [ ] Avg duration
    - [ ] Satisfaction score
    - [ ] Falloff rate
  - [ ] Charts
    - [ ] Conversation trends
    - [ ] Intent distribution (pie)
    - [ ] Language distribution (pie)
    - [ ] Error rate over time
    - [ ] Tool usage (bar)
  - [ ] Period selector
    - [ ] Day/Week/Month
  - [ ] Data export
    - [ ] CSV export
    - [ ] PDF report

### Enhanced Agent Creator
- [ ] Enhance `apps/web/app/home/agents/_components/create-agent-panel.tsx`
  - [ ] Update to 7 steps
    1. [ ] Agent Information
    2. [ ] Voice Configuration
    3. [ ] Conversation Config
    4. [ ] Workflow Template
    5. [ ] Knowledge Base
    6. [ ] Tools
    7. [ ] Review & Create
  - [ ] Add wizard state management
  - [ ] Add step navigation
  - [ ] Add validation per step
  - [ ] Add progress indicator
  - [ ] Handle preview/save

### Component Testing
- [ ] Test form validation
- [ ] Test file uploads
- [ ] Test drag & drop
- [ ] Test API calls
- [ ] Test error states
- [ ] Test loading states
- [ ] Test responsive design

---

## Phase 4: Integration & Polish (Week 3-4)

### Integration Testing
- [ ] End-to-end agent creation
- [ ] Configuration updates
- [ ] Knowledge base operations
- [ ] Workflow changes
- [ ] Tool management
- [ ] Test execution
- [ ] Metrics retrieval

### Performance Optimization
- [ ] Profile API routes
- [ ] Optimize database queries
- [ ] Add caching where appropriate
- [ ] Lazy load large components
- [ ] Optimize bundle size
- [ ] Test with large workflows
- [ ] Test with large knowledge bases

### Error Handling
- [ ] Comprehensive error messages
- [ ] User-friendly fallbacks
- [ ] Debug logging
- [ ] Error tracking/monitoring
- [ ] Graceful degradation
- [ ] Retry logic

### Documentation
- [ ] Update CLAUDE.md with new patterns
- [ ] API endpoint documentation
- [ ] Component prop documentation
- [ ] Usage examples
- [ ] Troubleshooting guide
- [ ] Architecture diagrams

### Testing
- [ ] Unit tests for validators
- [ ] Unit tests for hooks
- [ ] Integration tests for API routes
- [ ] E2E tests for workflows
- [ ] Load testing
- [ ] Security testing

### Code Quality
- [ ] Run `pnpm typecheck`
- [ ] Run `pnpm lint`
- [ ] Run `pnpm format`
- [ ] Code review
- [ ] Remove console logs
- [ ] Add JSDoc comments

### Deployment
- [ ] Create feature branch
- [ ] Push to staging
- [ ] Test in staging
- [ ] Get approval
- [ ] Merge to main
- [ ] Deploy to production
- [ ] Monitor for issues

---

## Environment Setup

### Required Env Variables
```bash
# Add to .env.local
ELEVENLABS_API_KEY=xxx                      # Provided later
ELEVENLABS_WORKSPACE_ID=xxx                 # Optional
OPENAI_API_KEY=xxx                          # For ChatGPT (provided later)

# Feature flags
ENABLE_ADVANCED_WORKFLOWS=true
ENABLE_AGENT_TESTING=true
ENABLE_KNOWLEDGE_BASE=true
ENABLE_AGENT_ANALYTICS=true
```

### Verification Checklist
- [ ] All env vars set
- [ ] Supabase connection working
- [ ] Database migrations applied
- [ ] Types generated
- [ ] App builds without errors
- [ ] Dev server starts
- [ ] Hot reload working

---

## Rollout Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Staging tested
- [ ] Performance acceptable
- [ ] Security reviewed

### Deployment
- [ ] Create release notes
- [ ] Deploy to production
- [ ] Monitor logs
- [ ] Check error tracking
- [ ] Monitor performance
- [ ] Monitor user feedback

### Post-Deployment
- [ ] Verify features working
- [ ] Monitor for errors
- [ ] Collect user feedback
- [ ] Plan iterations
- [ ] Document learnings

---

## Known Limitations & Future Enhancements

### Phase 1 (Current)
- ✅ Basic agent creation
- ✅ Simple workflow builder
- ✅ Knowledge base upload
- ✅ Tool configuration
- ✅ Agent testing

### Phase 2 (Future)
- [ ] Real-time collaboration in workflow builder
- [ ] Advanced analytics with predictions
- [ ] Multi-LLM support (not just ChatGPT)
- [ ] Custom voice cloning
- [ ] Agent marketplace/templates
- [ ] Advanced RAG for knowledge base
- [ ] Performance optimization with caching
- [ ] Webhook integrations

---

## Questions for Clarification

- [ ] Should we support multiple LLM providers initially?
- [ ] What's the max knowledge base size we need to support?
- [ ] Do we need real-time notifications for long-running operations?
- [ ] Should analytics be real-time or batch processed?
- [ ] Do we need to support agent templates from community?

---

## Sign-Off

- [ ] Implementation plan reviewed
- [ ] Technical approach approved
- [ ] Resources allocated
- [ ] Timeline confirmed
- [ ] Ready to start Phase 1

---

**Checklist Last Updated:** October 31, 2025
**Total Items:** 150+
**Estimated Completion:** 4 weeks
