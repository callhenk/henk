'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  ArrowLeft,
  BookOpen,
  Clock,
  Edit,
  Mic,
  Phone,
  Play,
  TrendingUp,
  Users,
  Volume2,
  Workflow,
} from 'lucide-react';
import { toast } from 'sonner';

// Import our Supabase hooks
import { useUpdateAgent } from '@kit/supabase/hooks/agents/use-agent-mutations';
import { useAgent } from '@kit/supabase/hooks/agents/use-agents';
import { useCampaigns } from '@kit/supabase/hooks/campaigns/use-campaigns';
import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useVoices } from '@kit/supabase/hooks/voices/use-voices';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Textarea } from '@kit/ui/textarea';

import { updateElevenLabsAgent } from '../../../../../lib/edge-functions';
import { EnhancedKnowledgeBase } from './enhanced-knowledge-base';
import { FAQEditor } from './faq-editor';
import { RealtimeVoiceChat } from './realtime-voice-chat';
import { WorkflowBuilder } from './workflow-builder/index';

const voiceTypes = [
  { value: 'ai_generated', label: 'AI Generated' },
  { value: 'custom', label: 'Custom Voice' },
];

// Helper functions to convert enum values to user-friendly labels
const getVoiceTypeLabel = (voiceType: string | null | undefined): string => {
  if (!voiceType) return 'Default';
  const voiceTypeOption = voiceTypes.find((type) => type.value === voiceType);
  return voiceTypeOption?.label || voiceType;
};

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
  const supabase = useSupabase();

  // State for knowledge base form
  const [organizationInfo, setOrganizationInfo] = useState('');
  const [donorContext, setDonorContext] = useState('');
  const [startingMessage, setStartingMessage] = useState('');
  const [faqs, setFaqs] = useState('');
  const [savingField, setSavingField] = useState<string | null>(null);
  const [_isTestingVoice, _setIsTestingVoice] = useState(false);

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // State for custom voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  // State for inline editing
  const [editingName, setEditingName] = useState(false);
  const [agentName, setAgentName] = useState('');

  // State for voice chat
  const [showVoiceChat, setShowVoiceChat] = useState(false);

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

  // State for debug tools
  const [isDebugToolsMinimized, setIsDebugToolsMinimized] = useState(false);

  // Initialize form data when agent loads
  useEffect(() => {
    if (agent) {
      setAgentName(agent.name || '');
      setOrganizationInfo(agent.organization_info || '');
      setDonorContext(agent.donor_context || '');
      setStartingMessage(agent.starting_message || '');

      // Handle FAQs field - Supabase returns JSON, so we stringify for the editor
      if (agent.faqs) {
        // Supabase returns JSON object/array, convert to string for the editor
        try {
          const faqsString = JSON.stringify(agent.faqs, null, 2);
          setFaqs(faqsString);
        } catch {
          setFaqs('');
        }
      } else {
        setFaqs('');
      }
    }
  }, [agent]);

  // Check if there are unsaved changes for each field
  const hasOrganizationChanges =
    organizationInfo !== (agent?.organization_info || '');
  const hasDonorContextChanges = donorContext !== (agent?.donor_context || '');
  const hasStartingMessageChanges =
    startingMessage !== (agent?.starting_message || '');

  // Calculate agent performance metrics
  const agentConversations = conversations.filter(
    (conv) => conv.agent_id === agentId,
  );
  const agentCampaigns = campaigns.filter(
    (campaign) => campaign.agent_id === agentId,
  );

  const callsHandled = agentConversations.length;
  const successfulCalls = agentConversations.filter(
    (conv) => conv.outcome === 'donated' || conv.status === 'completed',
  ).length;
  const conversionRate =
    callsHandled > 0 ? Math.round((successfulCalls / callsHandled) * 100) : 0;
  const activeHours = Math.round(
    agentConversations.reduce(
      (sum, conv) => sum + (conv.duration_seconds || 0),
      0,
    ) / 3600,
  );

  // Function to get cached voice sample URL
  const getCachedVoiceSample = async (voiceId: string) => {
    try {
      // Try to get a cached sample from the audio bucket
      const { data: signedUrl, error } = await supabase.storage
        .from('audio')
        .createSignedUrl(`samples/${voiceId}_sample.mp3`, 3600);

      if (signedUrl && !error) {
        return signedUrl.signedUrl;
      }

      // If no cached sample exists, return null (don't log error for missing files)
      return null;
    } catch (error) {
      // If there's an actual error (not just missing file), log it
      console.error('Error getting cached sample:', error);
      return null;
    }
  };

  // Custom voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedAudio(blob);
        stream.getTracks().forEach((track) => track.stop());
        toast.success('Recording completed!');
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            stopRecording();
            clearInterval(timer);
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

      toast.info('Recording started... Speak clearly for 30 seconds');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error(
        'Failed to start recording. Please check microphone permissions.',
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const playRecording = () => {
    if (!recordedAudio) {
      toast.error('No recording available to play');
      return;
    }

    const audio = new Audio(URL.createObjectURL(recordedAudio));
    setIsPlayingRecording(true);

    audio.onended = () => setIsPlayingRecording(false);
    audio.onerror = () => {
      setIsPlayingRecording(false);
      toast.error('Failed to play recording.');
    };

    audio.play().catch((error) => {
      console.error('Failed to play recording:', error);
      setIsPlayingRecording(false);
      toast.error('Failed to play recording.');
    });
  };

  const handleBack = () => {
    router.push('/home/agents');
  };

  const handleTalkToAgent = () => {
    // Open voice chat modal
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
          // Don't fail the entire operation if ElevenLabs update fails
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
          `Failed to fetch agent details: ${response.statusText}`,
        );
      }
      const data = await response.json();
      setElevenLabsAgentDetails(data.data);
      toast.success('Agent details fetched successfully');
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
        organization_info: organizationInfo,
        donor_context: donorContext,
        starting_message: startingMessage,
        faqs: faqs ? JSON.parse(faqs) : null,
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

      // Show confirmation for voice updates
      if (fieldName === 'voice_id' && agent?.elevenlabs_agent_id) {
        setPendingVoiceUpdate({ fieldName, value });
        setShowVoiceUpdateConfirm(true);
        return;
      }

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
            // Don't fail the entire operation if ElevenLabs update fails
          }
        }

        // Show success message
        setSaveSuccess(
          `${fieldName === 'faqs' ? 'FAQs' : fieldName.replace('_', ' ')} saved successfully!`,
        );
        setTimeout(() => setSaveSuccess(null), 3000);

        // Auto-train agent for knowledge base updates
        if (
          [
            'organization_info',
            'donor_context',
            'starting_message',
            'faqs',
          ].includes(fieldName)
        ) {
          try {
            const trainingData = {
              agent_id: agent.elevenlabs_agent_id,
              organization_info:
                fieldName === 'organization_info' ? value : organizationInfo,
              donor_context:
                fieldName === 'donor_context' ? value : donorContext,
              starting_message:
                fieldName === 'starting_message' ? value : startingMessage,
              faqs:
                fieldName === 'faqs'
                  ? JSON.parse(value)
                  : faqs
                    ? JSON.parse(faqs)
                    : null,
            };

            const response = await fetch('/api/elevenlabs-agent/train', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(trainingData),
            });

            if (response.ok) {
              toast.success('Agent automatically trained with new knowledge!');
            }
          } catch (trainingError) {
            console.error('Auto-training failed:', trainingError);
            // Don't show error toast for auto-training to avoid cluttering the UI
          }
        }
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

  // Show loading state while fetching agent data
  if (loadingAgent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
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
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 transition-colors hover:bg-green-200">
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-gray-100 text-gray-800 transition-colors hover:bg-gray-200">
            Inactive
          </Badge>
        );
      case 'agent_paused':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 transition-colors hover:bg-yellow-200">
            Paused
          </Badge>
        );
      case 'training':
        return (
          <Badge className="bg-blue-100 text-blue-800 transition-colors hover:bg-blue-200">
            Training
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="hover:bg-muted transition-colors">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {saveSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-sm font-medium text-green-800">{saveSuccess}</p>
        </div>
      )}

      {/* Header with Agent Name and Talk to Agent Button */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Agents</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              {editingName ? (
                <div className="flex w-full items-center space-x-2">
                  <Input
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="h-8 flex-1 text-lg font-bold sm:text-2xl"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveField('name', agentName);
                        setEditingName(false);
                      } else if (e.key === 'Escape') {
                        setAgentName(agent?.name || '');
                        setEditingName(false);
                      }
                    }}
                    onBlur={() => {
                      handleSaveField('name', agentName);
                      setEditingName(false);
                    }}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleSaveField('name', agentName);
                      setEditingName(false);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    ✓
                  </Button>
                </div>
              ) : (
                <div className="flex min-w-0 items-center space-x-2">
                  <h1 className="truncate text-lg font-bold sm:text-2xl">
                    {agentName}
                  </h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingName(true)}
                    className="h-6 w-6 flex-shrink-0 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-muted-foreground truncate text-sm">
              {agent.description}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(agent.status)}
          <Button
            onClick={handleTalkToAgent}
            className="flex items-center gap-2"
            size="sm"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Start Voice Chat</span>
            <span className="sm:hidden">Chat</span>
          </Button>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-2">
          <TabsTrigger
            value="overview"
            className="px-2 text-xs sm:px-3 sm:text-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="knowledge"
            className="px-2 text-xs sm:px-3 sm:text-sm"
          >
            Knowledge
          </TabsTrigger>
          <TabsTrigger
            value="voice"
            className="px-2 text-xs sm:px-3 sm:text-sm"
          >
            Voice
          </TabsTrigger>
          <TabsTrigger
            value="workflow"
            className="px-2 text-xs sm:px-3 sm:text-sm"
          >
            Workflow
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Stats Cards */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Calls Handled
                    </CardTitle>
                    <Phone className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{callsHandled}</div>
                    <p className="text-muted-foreground text-xs">
                      Total calls made
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Conversion Rate
                    </CardTitle>
                    <TrendingUp className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{conversionRate}%</div>
                    <p className="text-muted-foreground text-xs">
                      Successful calls
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Hours
                    </CardTitle>
                    <Clock className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeHours}</div>
                    <p className="text-muted-foreground text-xs">
                      Hours this month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Agent Details */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Agent Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Language
                      </label>
                      <p className="text-base">English</p>
                    </div>
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Voice Type
                      </label>
                      <p className="text-base">
                        {getVoiceTypeLabel(agent.voice_type)}
                      </p>
                    </div>
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Last Edited
                      </label>
                      <p className="text-base">
                        {agent.updated_at
                          ? formatDate(agent.updated_at)
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Linked Campaigns */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Linked Campaigns</CardTitle>
                  <CardDescription>
                    Campaigns this agent is assigned to
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {agentCampaigns.map((campaign, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <span className="font-medium">{campaign.name}</span>
                        <Badge
                          variant="outline"
                          className="hover:bg-muted transition-colors"
                        >
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-1">
              {/* Default Script */}
              <Card>
                <CardHeader>
                  <CardTitle>Default Script</CardTitle>
                  <CardDescription>
                    The agent&apos;s primary conversation starter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm">
                      {agent.description || 'No script available'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setActiveTab('knowledge')}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Knowledge Base
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setActiveTab('workflow')}
                  >
                    <Workflow className="mr-2 h-4 w-4" />
                    Edit Workflow
                  </Button>
                  <Button className="w-full" onClick={handleTalkToAgent}>
                    <Phone className="mr-2 h-4 w-4" />
                    Start Voice Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="my-6">
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Organization Information
                </CardTitle>
                <CardDescription>
                  Give the AI agent useful background to personalize calls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={organizationInfo}
                  onChange={(e) => setOrganizationInfo(e.target.value)}
                  className="min-h-[150px] resize-none sm:min-h-[200px]"
                  placeholder="Enter organization information..."
                />
                {hasOrganizationChanges && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleSaveField('organization_info', organizationInfo)
                      }
                      disabled={savingField === 'organization_info'}
                    >
                      {savingField === 'organization_info'
                        ? 'Saving...'
                        : 'Save Organization Info'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Starting Message
                </CardTitle>
                <CardDescription>
                  The initial message the agent uses when starting a call
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={startingMessage}
                  onChange={(e) => setStartingMessage(e.target.value)}
                  className="min-h-[120px] resize-none sm:min-h-[150px]"
                  placeholder="Enter the starting message for the agent (e.g., 'Hello, this is [Agent Name] calling from [Organization]. How are you today?')"
                />
                {hasStartingMessageChanges && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleSaveField('starting_message', startingMessage)
                      }
                      disabled={savingField === 'starting_message'}
                    >
                      {savingField === 'starting_message'
                        ? 'Saving...'
                        : 'Save Starting Message'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ElevenLabs Agent Details Display */}
            {elevenLabsAgentDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    ElevenLabs Agent Details
                  </CardTitle>
                  <CardDescription>
                    Current configuration from ElevenLabs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="overflow-auto text-xs">
                      {JSON.stringify(elevenLabsAgentDetails, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Knowledge Base Status Display */}
            {knowledgeBaseStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Knowledge Base Status
                  </CardTitle>
                  <CardDescription>
                    Current knowledge base access status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Documents Available:
                      </span>
                      <Badge
                        variant={
                          knowledgeBaseStatus.hasDocuments
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {knowledgeBaseStatus.documentCount} documents
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Agent Configured:
                      </span>
                      <Badge
                        variant={
                          knowledgeBaseStatus.hasKnowledgeBaseConfigured
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {knowledgeBaseStatus.hasKnowledgeBaseConfigured
                          ? 'Yes'
                          : 'No'}
                      </Badge>
                    </div>
                    {knowledgeBaseStatus.documentTypes.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Document Types:
                        </span>
                        <div className="flex gap-1">
                          {knowledgeBaseStatus.documentTypes.map((type) => (
                            <Badge
                              key={type}
                              variant="outline"
                              className="text-xs"
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {knowledgeBaseStatus.hasDocuments &&
                      !knowledgeBaseStatus.hasKnowledgeBaseConfigured && (
                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                          <p className="text-sm text-orange-800">
                            <strong>⚠️ Action Required:</strong> Documents exist
                            but agent is not configured to use them. Click
                            &ldquo;Link KB to Agent&rdquo; in debug tools.
                          </p>
                        </div>
                      )}
                    {knowledgeBaseStatus.error && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-sm text-red-800">
                          <strong>Error:</strong> {knowledgeBaseStatus.error}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Floating Debug Panel - Only show in development/staging */}
            {process.env.NODE_ENV === 'development' && (
              <div className="fixed right-2 bottom-4 z-50 sm:right-4">
                <div className="rounded-lg border border-gray-200 bg-white shadow-lg sm:p-3">
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-xs font-medium text-gray-700">
                        Debug Tools
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setIsDebugToolsMinimized(!isDebugToolsMinimized)
                      }
                      className="h-6 w-6 p-0"
                    >
                      {isDebugToolsMinimized ? (
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      )}
                    </Button>
                  </div>
                  {!isDebugToolsMinimized && (
                    <div className="space-y-2 p-2 pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={checkElevenLabsAgentDetails}
                        disabled={
                          isLoadingAgentDetails || !agent?.elevenlabs_agent_id
                        }
                        className="w-full"
                      >
                        {isLoadingAgentDetails ? (
                          <>
                            <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                            Loading...
                          </>
                        ) : (
                          'Check Agent Details'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={trainAgent}
                        disabled={
                          isTrainingAgent || !agent?.elevenlabs_agent_id
                        }
                        className="w-full"
                      >
                        {isTrainingAgent ? (
                          <>
                            <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                            Training...
                          </>
                        ) : (
                          'Train Agent'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={checkKnowledgeBaseAccess}
                        disabled={
                          isCheckingKnowledgeBase || !agent?.elevenlabs_agent_id
                        }
                        className="w-full"
                      >
                        {isCheckingKnowledgeBase ? (
                          <>
                            <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                            Checking...
                          </>
                        ) : (
                          'Check KB Access'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={linkKnowledgeBaseToAgent}
                        disabled={
                          isLinkingKnowledgeBase || !agent?.elevenlabs_agent_id
                        }
                        className="w-full"
                      >
                        {isLinkingKnowledgeBase ? (
                          <>
                            <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                            Linking...
                          </>
                        ) : (
                          'Link KB to Agent'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
                <CardDescription>
                  The prompt or context that guides the agent&apos;s responses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={donorContext}
                  onChange={(e) => setDonorContext(e.target.value)}
                  className="min-h-[150px] resize-none sm:min-h-[200px]"
                  placeholder="Enter the prompt or context for the agent."
                />
                {hasDonorContextChanges && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleSaveField('donor_context', donorContext)
                      }
                      disabled={savingField === 'donor_context'}
                    >
                      {savingField === 'donor_context'
                        ? 'Saving...'
                        : 'Save Prompt'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Add common questions and responses to help your agent handle
                  objections effectively
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FAQEditor
                  value={faqs}
                  agentId={agentId}
                  onSaveSuccess={() => {
                    setSaveSuccess('FAQs saved successfully!');
                    setTimeout(() => setSaveSuccess(null), 3000);
                  }}
                />
              </CardContent>
            </Card>

            <EnhancedKnowledgeBase
              _agentId={agentId}
              elevenlabsAgentId={agent?.elevenlabs_agent_id || undefined}
            />
          </div>
        </TabsContent>

        {/* Voice & Tone Tab */}
        <TabsContent value="voice" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Voice Configuration
              </CardTitle>
              <CardDescription>
                Customize how your agent sounds and speaks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Voice</label>
                <div className="flex items-center gap-2">
                  <Select
                    value={agent.voice_id || ''}
                    onValueChange={(voiceId) => {
                      // Show confirmation for voice updates
                      if (agent?.elevenlabs_agent_id) {
                        setPendingVoiceUpdate({
                          fieldName: 'voice_id',
                          value: voiceId,
                        });
                        setShowVoiceUpdateConfirm(true);
                      } else {
                        // If no ElevenLabs agent, update directly
                        handleSaveField('voice_id', voiceId);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-muted-foreground text-xs">
                  Choose from available AI voices for your agent
                </p>
              </div>

              {/* Voice Preview */}
              {agent.voice_id && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Voice Preview</label>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-muted-foreground text-xs">
                        Using Cached Sample
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 shadow-sm">
                          <Volume2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Cached Sample Audio
                          </p>
                          <p className="text-muted-foreground text-xs">
                            &ldquo;Hello, this is a voice preview.&rdquo;
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPlayingPreview}
                        onClick={async () => {
                          try {
                            const voiceId = agent.voice_id;

                            if (!voiceId) {
                              toast.error('No voice selected for preview');
                              return;
                            }

                            // First try to get a cached sample
                            const cachedUrl =
                              await getCachedVoiceSample(voiceId);

                            if (cachedUrl) {
                              // Play cached sample
                              const audio = new Audio(cachedUrl);
                              setIsPlayingPreview(true);

                              audio.onended = () => setIsPlayingPreview(false);
                              audio.onerror = () => {
                                setIsPlayingPreview(false);
                                toast.error('Failed to play voice preview.');
                              };

                              await audio.play();
                              toast.success('Playing cached voice preview...');
                              return;
                            }

                            // If no cached sample exists, show message instead of generating
                            toast.info(
                              'No cached sample available. Please generate a voice sample first.',
                            );
                          } catch (error) {
                            console.error('Voice preview error:', error);
                            toast.error('Failed to play voice preview.');
                          }
                        }}
                        className="flex items-center gap-2 px-4"
                      >
                        {isPlayingPreview ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                            <span>Playing...</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            <span>Play Sample</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                        <span>Cached sample available</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Type</label>
                <Select
                  value={agent.voice_type || 'ai_generated'}
                  onValueChange={async (voiceType) => {
                    try {
                      await updateAgentMutation.mutateAsync({
                        id: agentId,
                        voice_type: voiceType,
                      });

                      toast.success('Voice type updated successfully');
                    } catch {
                      toast.error('Failed to update voice type');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice type" />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceTypes.map((voice) => (
                      <SelectItem key={voice.value} value={voice.value}>
                        {voice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Record Custom Voice */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Record Custom Voice
                  </label>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Record a 30-second sample for voice cloning
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isPlayingRecording}
                  >
                    {isRecording ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                        Recording... ({30 - recordingTime}s)
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        {recordedAudio ? 'Record Again' : 'Start Recording'}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={playRecording}
                    disabled={
                      !recordedAudio || isPlayingRecording || isRecording
                    }
                  >
                    {isPlayingRecording ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                        Playing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Preview
                      </>
                    )}
                  </Button>
                </div>
                {recordedAudio && (
                  <div className="mt-2 text-xs text-green-600">
                    ✓ Recording saved. You can preview or record again.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="mt-6">
          <WorkflowBuilder />
        </TabsContent>
      </Tabs>

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
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Confirm Voice Update</h3>
            <p className="mb-6 text-gray-600">
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
    </div>
  );
}
