'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { BookOpen, GitBranch, LayoutDashboard, Mic } from 'lucide-react';
import { toast } from 'sonner';

// Import our Supabase hooks
import { useUpdateAgent } from '@kit/supabase/hooks/agents/use-agent-mutations';
import { useAgent } from '@kit/supabase/hooks/agents/use-agents';
import { useCampaigns } from '@kit/supabase/hooks/campaigns/use-campaigns';
import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
import { useVoices } from '@kit/supabase/hooks/voices/use-voices';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { updateElevenLabsAgent } from '../../../../../lib/edge-functions';
import { AgentHeader } from './agent-header';
import { AgentKnowledge } from './agent-knowledge';
import { AgentOverview } from './agent-overview';
import { AgentVoice } from './agent-voice';
import { DebugTools } from './debug-tools';
import { RealtimeVoiceChat } from './realtime-voice-chat';
import { WorkflowBuilder } from './workflow-builder/index';

export function AgentDetail({ agentId }: { agentId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the default tab from URL parameter
  const defaultTab = searchParams.get('tab') || 'overview';

  // State for managing active tab
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Fetch real data
  const { data: agent, isLoading: loadingAgent, refetch } = useAgent(agentId);
  const { data: conversations = [] } = useConversations();
  const { data: campaigns = [] } = useCampaigns();
  const { data: voices = [] } = useVoices();

  // Update mutation
  const updateAgentMutation = useUpdateAgent();

  // State for save operations
  const [savingField, setSavingField] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // State for voice chat
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  // State for voice update confirmation
  const [showVoiceUpdateConfirm, setShowVoiceUpdateConfirm] = useState(false);
  const [pendingVoiceUpdate, setPendingVoiceUpdate] = useState<{
    fieldName: string;
    value: string;
  } | null>(null);

  // State for ElevenLabs agent details
  const [isLoadingAgentDetails, setIsLoadingAgentDetails] = useState(false);
  const [elevenLabsAgentDetails, setElevenLabsAgentDetails] = useState<Record<
    string,
    unknown
  > | null>(null);

  // State for agent training
  const [isTrainingAgent, setIsTrainingAgent] = useState(false);
  const [isCheckingKnowledgeBase, setIsCheckingKnowledgeBase] = useState(false);
  const [knowledgeBaseStatus, setKnowledgeBaseStatus] = useState<{
    hasDocuments: boolean;
    documentCount: number;
    documentTypes: string[];
    lastUpdated?: string;
    error?: string;
    hasKnowledgeBaseConfigured?: boolean;
    agentPromptLength?: number;
  } | null>(null);
  const [isLinkingKnowledgeBase, setIsLinkingKnowledgeBase] = useState(false);

  // Phone numbers (used for test calls). In the future we may allow selecting a caller ID here.
  const [availableCallerIds, setAvailableCallerIds] = useState<string[]>([]);
  // Test call state
  const [testToNumber, setTestToNumber] = useState('');
  const [testCallerId, setTestCallerId] = useState('');
  const [isPlacingTestCall, setIsPlacingTestCall] = useState(false);

  // Load phone numbers
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/voice/phone-numbers');
        const json = await resp.json();
        if (resp.ok && json?.success && Array.isArray(json.data)) {
          const numbers = (
            json.data as Array<{
              phone_number: string;
              supports_outbound?: boolean;
            }>
          )
            .filter((n) => n.supports_outbound)
            .map((n) => n.phone_number)
            .filter((p): p is string => typeof p === 'string' && p.length > 0);
          setAvailableCallerIds(numbers);
          if (!testCallerId && numbers.length > 0)
            setTestCallerId(numbers[0] ?? '');
        }
      } catch {
        // ignore
      }
    })();
  }, [testCallerId]);

  const handleBack = () => {
    router.push('/home/agents');
  };

  const handleTalkToAgent = () => {
    setShowVoiceChat(true);
  };

  const handleConfirmVoiceUpdate = async () => {
    if (!pendingVoiceUpdate || !agent) return;

    setSavingField(pendingVoiceUpdate.fieldName);
    try {
      const updateData = {
        id: agentId,
        voice_id: pendingVoiceUpdate.value,
      };

      await updateAgentMutation.mutateAsync(updateData);

      // Update ElevenLabs agent
      if (agent?.elevenlabs_agent_id) {
        try {
          const result = await updateElevenLabsAgent(
            agent.elevenlabs_agent_id,
            {
              voice_id: pendingVoiceUpdate.value,
            },
          );

          if (!result.success) {
            console.error(
              'ElevenLabs agent voice update failed:',
              result.error,
            );
          }

          // Refresh agent data to get the updated voice_id
          await refetch();
        } catch (elevenLabsError) {
          console.error(
            'Failed to update ElevenLabs agent voice:',
            elevenLabsError,
          );
        }
      }

      // Show success message
      setSaveSuccess('Voice updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to save voice changes:', error);
      alert(
        `Failed to save voice: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setSavingField(null);
      setShowVoiceUpdateConfirm(false);
      setPendingVoiceUpdate(null);
    }
  };

  const handleCancelVoiceUpdate = () => {
    setShowVoiceUpdateConfirm(false);
    setPendingVoiceUpdate(null);
  };

  const handleVoiceUpdate = (fieldName: string, value: string) => {
    if (agent?.elevenlabs_agent_id) {
      setPendingVoiceUpdate({ fieldName, value });
      setShowVoiceUpdateConfirm(true);
    } else {
      handleSaveField(fieldName, value);
    }
  };

  const checkElevenLabsAgentDetails = async () => {
    if (!agent?.elevenlabs_agent_id) {
      toast.error('No ElevenLabs agent ID found');
      return;
    }

    setIsLoadingAgentDetails(true);
    try {
      const response = await fetch(
        `/api/elevenlabs-agent/details/${agent.elevenlabs_agent_id}`,
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch agent details: ${response.status} ${response.statusText}`,
        );
      }
      const raw = await response.text();
      let parsed: unknown = {};
      try {
        parsed = raw ? JSON.parse(raw) : {};
      } catch {
        // ignore
      }
      const details =
        (parsed as Record<string, unknown>)?.data ?? parsed ?? null;
      setElevenLabsAgentDetails(details as Record<string, unknown> | null);
      const keys =
        details && typeof details === 'object'
          ? Object.keys(details as Record<string, unknown>).length
          : 0;
      console.log('[agent-details] fetched', {
        keys,
        preview: JSON.stringify(details).slice(0, 400),
      });
      toast.success(keys > 0 ? 'Agent details loaded' : 'No details returned');
    } catch (error) {
      console.error('Error fetching ElevenLabs agent details:', error);
      toast.error(
        `Failed to fetch agent details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsLoadingAgentDetails(false);
    }
  };

  const trainAgent = async () => {
    if (!agent?.elevenlabs_agent_id) {
      toast.error('No ElevenLabs agent ID found');
      return;
    }

    setIsTrainingAgent(true);
    try {
      // Prepare training data
      const trainingData = {
        agent_id: agent.elevenlabs_agent_id,
        organization_info: agent.organization_info || '',
        donor_context: agent.donor_context || '',
        starting_message: agent.starting_message || '',
        faqs: agent.faqs || null,
      };

      const response = await fetch('/api/elevenlabs-agent/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      });

      if (!response.ok) {
        throw new Error(`Training failed: ${response.statusText}`);
      }

      const result = await response.json();
      toast.success('Agent training completed successfully!');
      console.log('Training result:', result);
    } catch (error) {
      console.error('Error training agent:', error);
      toast.error(
        `Training failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsTrainingAgent(false);
    }
  };

  const checkKnowledgeBaseAccess = async () => {
    if (!agent?.elevenlabs_agent_id) {
      toast.error('No ElevenLabs agent ID found');
      return;
    }

    setIsCheckingKnowledgeBase(true);
    try {
      // Check knowledge base documents
      const kbResponse = await fetch('/api/elevenlabs-agent/knowledge-base');
      if (!kbResponse.ok) {
        throw new Error(
          `Failed to fetch knowledge base: ${kbResponse.statusText}`,
        );
      }
      const kbData = await kbResponse.json();

      // Check agent details to see if knowledge base is configured
      const agentResponse = await fetch(
        `/api/elevenlabs-agent/details/${agent.elevenlabs_agent_id}`,
      );
      if (!agentResponse.ok) {
        throw new Error(
          `Failed to fetch agent details: ${agentResponse.statusText}`,
        );
      }
      const agentData = await agentResponse.json();

      const documents = kbData.data?.documents || [];
      const documentTypes = [
        ...new Set(documents.map((doc: { type: string }) => doc.type)),
      ];

      const status = {
        hasDocuments: documents.length > 0,
        documentCount: documents.length,
        documentTypes: documentTypes as string[],
        lastUpdated:
          documents.length > 0
            ? new Date(
                Math.max(
                  ...documents.map(
                    (doc: { metadata?: { created_at_unix_secs?: number } }) =>
                      (doc.metadata?.created_at_unix_secs || 0) * 1000,
                  ),
                ),
              ).toISOString()
            : undefined,
        error: undefined,
      };

      // Check if agent has knowledge base configured
      const agentConfig = agentData.data?.conversation_config?.agent?.prompt;
      const hasKnowledgeBaseConfigured =
        agentConfig?.knowledge_base &&
        Array.isArray(agentConfig.knowledge_base) &&
        agentConfig.knowledge_base.length > 0;

      setKnowledgeBaseStatus({
        ...status,
        hasKnowledgeBaseConfigured,
        agentPromptLength: agentConfig?.prompt?.length || 0,
      });

      console.log('Knowledge Base Status:', status);
      console.log('Agent Knowledge Base Config:', agentConfig?.knowledge_base);

      if (documents.length === 0) {
        toast.warning(
          'No knowledge base documents found. Add documents to enable knowledge base access.',
        );
      } else if (!hasKnowledgeBaseConfigured) {
        toast.warning(
          'Knowledge base documents exist but agent is not configured to use them. Try training the agent.',
        );
      } else {
        toast.success(
          `Knowledge base access verified! ${documents.length} documents available.`,
        );
      }
    } catch (error) {
      console.error('Error checking knowledge base access:', error);
      setKnowledgeBaseStatus({
        hasDocuments: false,
        documentCount: 0,
        documentTypes: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      toast.error(
        `Knowledge base check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsCheckingKnowledgeBase(false);
    }
  };

  const linkKnowledgeBaseToAgent = async () => {
    if (!agent?.elevenlabs_agent_id) {
      toast.error('No ElevenLabs agent ID found');
      return;
    }

    setIsLinkingKnowledgeBase(true);
    try {
      // First, get all knowledge base documents
      const kbResponse = await fetch('/api/elevenlabs-agent/knowledge-base');
      if (!kbResponse.ok) {
        throw new Error(
          `Failed to fetch knowledge base: ${kbResponse.statusText}`,
        );
      }
      const kbData = await kbResponse.json();
      const documents = kbData.data?.documents || [];

      if (documents.length === 0) {
        toast.error(
          'No knowledge base documents found. Please add documents first.',
        );
        return;
      }

      // Extract document IDs for knowledge base
      const knowledgeBaseIds = documents.map((doc: { id: string }) => doc.id);

      const updateResponse = await fetch(`/api/elevenlabs-agent/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agent.elevenlabs_agent_id,
          knowledge_base_ids: knowledgeBaseIds,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}));
        throw new Error(
          `Failed to link knowledge base: ${errorData.detail || updateResponse.statusText}`,
        );
      }

      toast.success(
        `Successfully linked ${knowledgeBaseIds.length} documents to agent!`,
      );

      // Refresh the knowledge base status
      await checkKnowledgeBaseAccess();
    } catch (error) {
      console.error('Error linking knowledge base:', error);
      toast.error(
        `Failed to link knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsLinkingKnowledgeBase(false);
    }
  };

  const handleSaveField = useCallback(
    async (fieldName: string, value: string) => {
      if (!agent) return;

      setSavingField(fieldName);
      try {
        const updateData = {
          id: agentId,
          ...(fieldName === 'name' && { name: value }),
          ...(fieldName === 'starting_message' && { starting_message: value }),
          ...(fieldName === 'organization_info' && {
            organization_info: value,
          }),
          ...(fieldName === 'donor_context' && { donor_context: value }),
          ...(fieldName === 'voice_type' && { voice_type: value }),
        };

        await updateAgentMutation.mutateAsync(updateData);

        // Update ElevenLabs agent if it exists
        if (agent?.elevenlabs_agent_id) {
          try {
            const elevenLabsUpdates: Record<string, unknown> = {};

            if (fieldName === 'name') {
              elevenLabsUpdates.name = value;
            }
            if (fieldName === 'voice_id') {
              elevenLabsUpdates.voice_id = value;
            }
            if (fieldName === 'organization_info') {
              elevenLabsUpdates.context_data = {
                organization_info: value,
              };
            }
            if (fieldName === 'donor_context') {
              elevenLabsUpdates.context_data = {
                donor_context: value,
              };
            }
            if (fieldName === 'starting_message') {
              elevenLabsUpdates.starting_message = value;
            }

            if (Object.keys(elevenLabsUpdates).length > 0) {
              await updateElevenLabsAgent(
                agent.elevenlabs_agent_id,
                elevenLabsUpdates,
              );
              console.log('ElevenLabs agent updated successfully');
            }
          } catch (elevenLabsError) {
            console.error(
              'Failed to update ElevenLabs agent:',
              elevenLabsError,
            );
          }
        }

        // Show success message
        setSaveSuccess(
          `${fieldName === 'faqs' ? 'FAQs' : fieldName.replace('_', ' ')} saved successfully!`,
        );
        setTimeout(() => setSaveSuccess(null), 3000);
      } catch (error) {
        console.error(`Failed to save ${fieldName} changes:`, error);
        alert(
          `Failed to save ${fieldName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      } finally {
        setSavingField(null);
      }
    },
    [agent, agentId, updateAgentMutation],
  );

  const handleSaveSuccess = (message: string) => {
    setSaveSuccess(message);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // Show loading state while fetching agent data
  if (loadingAgent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} size="sm">
            ← Back to Agents
          </Button>
        </div>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading agent data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if agent not found
  if (!agent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} size="sm">
            ← Back to Agents
          </Button>
        </div>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Agent not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {saveSuccess && (
        <div className="rounded-lg border p-3">
          <p className="text-sm font-medium">{saveSuccess}</p>
        </div>
      )}

      {/* Header */}
      <AgentHeader
        agent={agent}
        onBack={handleBack}
        onTalkToAgent={handleTalkToAgent}
        onSaveField={handleSaveField}
      />

      {/* Tabbed Content */}
      <Card className={'glass-panel'}>
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', value);
            router.replace(`?${params.toString()}`, { scroll: false });
          }}
          className="w-full"
        >
          <CardHeader>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger
                value="overview"
                className="inline-flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="knowledge"
                className="inline-flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Knowledge</span>
              </TabsTrigger>
              <TabsTrigger
                value="voice"
                className="inline-flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                <span>Voice</span>
              </TabsTrigger>
              <TabsTrigger
                value="workflow"
                className="inline-flex items-center gap-2"
              >
                <GitBranch className="h-4 w-4" />
                <span>Workflow</span>
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            {/* Overview Tab */}
            <TabsContent value="overview">
              <AgentOverview
                agent={agent}
                conversations={conversations}
                campaigns={campaigns}
              />

              {/* Outbound Caller ID
                  Hidden for now. Caller ID will be automatically set to the only
                  available phone number on agent creation. In the future, we may
                  expose a picker here to choose among multiple numbers. */}

              {/* Simulate/Test Call */}
              <Card className="glass-panel mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold">
                        Place test call
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Quickly call your own number using this agent and a
                        selected caller ID
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    placeholder="Your phone (e.g. +15551234567)"
                    value={testToNumber}
                    onChange={(e) => setTestToNumber(e.target.value)}
                    className="sm:w-80"
                  />
                  <Select value={testCallerId} onValueChange={setTestCallerId}>
                    <SelectTrigger className="sm:w-72">
                      <SelectValue placeholder="Select caller ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCallerIds.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={
                      isPlacingTestCall ||
                      !testToNumber ||
                      !testCallerId ||
                      !agent
                    }
                    onClick={async () => {
                      try {
                        if (!agent) return;
                        setIsPlacingTestCall(true);
                        const resp = await fetch(
                          '/api/campaigns/simulate-call',
                          {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              to_number: testToNumber,
                              agent_id: agent.elevenlabs_agent_id || undefined,
                              caller_id: testCallerId,
                              lead_name: 'Test Call',
                              goal_metric: 'pledge_rate',
                            }),
                          },
                        );
                        const json = await resp.json();
                        if (!resp.ok || !json?.success) {
                          throw new Error(
                            json?.error || `Failed (${resp.status})`,
                          );
                        }
                        toast.success('Test call started');
                      } catch (e) {
                        toast.error(
                          e instanceof Error
                            ? e.message
                            : 'Failed to start test call',
                        );
                      } finally {
                        setIsPlacingTestCall(false);
                      }
                    }}
                  >
                    {isPlacingTestCall ? 'Starting…' : 'Place test call'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Knowledge Base Tab */}
            <TabsContent value="knowledge">
              <AgentKnowledge
                agent={agent}
                onSaveField={handleSaveField}
                savingField={savingField}
                onSaveSuccess={handleSaveSuccess}
              />
            </TabsContent>

            {/* Voice & Tone Tab */}
            <TabsContent value="voice">
              <AgentVoice
                agent={agent}
                voices={voices}
                onSaveField={handleSaveField}
                onVoiceUpdate={handleVoiceUpdate}
              />
            </TabsContent>

            {/* Workflow Tab */}
            <TabsContent value="workflow">
              <WorkflowBuilder />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Voice Chat Modal */}
      {showVoiceChat && (
        <RealtimeVoiceChat
          agentId={agentId}
          agentName={agent?.name || 'AI Agent'}
          elevenlabsAgentId={agent?.elevenlabs_agent_id || 'default'}
          onClose={() => setShowVoiceChat(false)}
        />
      )}

      {/* Voice Update Confirmation Dialog */}
      {showVoiceUpdateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card text-card-foreground mx-4 w-full max-w-md rounded-lg p-6">
            <h3 className="mb-4 text-lg font-semibold">Confirm Voice Update</h3>
            <p className="text-muted-foreground mb-6">
              This will update the voice for both the local agent and the
              ElevenLabs agent. Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelVoiceUpdate}
                disabled={savingField === 'voice_id'}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmVoiceUpdate}
                disabled={savingField === 'voice_id'}
              >
                {savingField === 'voice_id' ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                    Updating...
                  </>
                ) : (
                  'Update Voice'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Tools */}
      <DebugTools
        agent={agent}
        onCheckAgentDetails={checkElevenLabsAgentDetails}
        onTrainAgent={trainAgent}
        onCheckKnowledgeBase={checkKnowledgeBaseAccess}
        onLinkKnowledgeBase={linkKnowledgeBaseToAgent}
        isLoadingAgentDetails={isLoadingAgentDetails}
        isTrainingAgent={isTrainingAgent}
        isCheckingKnowledgeBase={isCheckingKnowledgeBase}
        isLinkingKnowledgeBase={isLinkingKnowledgeBase}
        elevenLabsAgentDetails={elevenLabsAgentDetails}
        knowledgeBaseStatus={knowledgeBaseStatus}
      />
    </div>
  );
}
