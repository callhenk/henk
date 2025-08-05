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
  Upload,
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
import { useVoiceTestMutation } from '@kit/supabase/hooks/voices/use-voice-mutations';
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

import { FAQEditor } from './faq-editor';
import { KnowledgeUpload } from './knowledge-upload';
import { WorkflowBuilder } from './workflow-builder/index';

// Type for voice settings
interface VoiceSettings {
  voice_id: string;
  stability?: number;
  similarity_boost?: number;
}

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
  const { data: agent, isLoading: loadingAgent } = useAgent(agentId);
  const { data: conversations = [] } = useConversations();
  const { data: campaigns = [] } = useCampaigns();
  const { data: voices = [] } = useVoices();

  // Update mutation
  const updateAgentMutation = useUpdateAgent();
  const voiceTestMutation = useVoiceTestMutation();
  const supabase = useSupabase();

  // State for knowledge base form
  const [organizationInfo, setOrganizationInfo] = useState('');
  const [donorContext, setDonorContext] = useState('');
  const [faqs, setFaqs] = useState('');
  const [savingField, setSavingField] = useState<string | null>(null);
  const [isTestingVoice, _setIsTestingVoice] = useState(false);
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

  // Initialize form data when agent loads
  useEffect(() => {
    if (agent) {
      setAgentName(agent.name || '');
      setOrganizationInfo(agent.organization_info || '');
      setDonorContext(agent.donor_context || '');

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

  const handleSaveField = useCallback(
    async (fieldName: string, value: string) => {
      if (!agent) return;

      setSavingField(fieldName);
      try {
        const updateData = {
          id: agentId,
          ...(fieldName === 'name' && { name: value }),
          ...(fieldName === 'organization_info' && {
            organization_info: value,
          }),
          ...(fieldName === 'donor_context' && { donor_context: value }),
        };

        await updateAgentMutation.mutateAsync(updateData);

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

      {/* Header with Agent Name */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              {editingName ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="h-8 text-2xl font-bold"
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
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">{agentName}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingName(true)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-muted-foreground">{agent.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(agent.status)}
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="text-xs sm:text-sm">
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="voice" className="text-xs sm:text-sm">
            Voice & Tone
          </TabsTrigger>
          <TabsTrigger value="workflow" className="text-xs sm:text-sm">
            Workflow
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="mt-6">
          <div className="space-y-6">
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
                  className="min-h-[200px] resize-none"
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
                <CardTitle>Prompt</CardTitle>
                <CardDescription>
                  The prompt or context that guides the agent&apos;s responses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={donorContext}
                  onChange={(e) => setDonorContext(e.target.value)}
                  className="min-h-[200px] resize-none"
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Knowledge Documents
                </CardTitle>
                <CardDescription>
                  Upload documents and files to enhance your agent&apos;s
                  knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <KnowledgeUpload
                  agentId={agentId}
                  onSaveSuccess={() => {
                    setSaveSuccess('Knowledge documents saved successfully!');
                    setTimeout(() => setSaveSuccess(null), 3000);
                  }}
                />
              </CardContent>
            </Card>
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
                <Select
                  value={
                    (agent.voice_settings as unknown as VoiceSettings)
                      ?.voice_id || ''
                  }
                  onValueChange={async (voiceId) => {
                    try {
                      await updateAgentMutation.mutateAsync({
                        id: agentId,
                        voice_settings: { voice_id: voiceId },
                      });
                      toast.success('Voice updated successfully');
                    } catch (error) {
                      toast.error('Failed to update voice');
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
                <p className="text-muted-foreground text-xs">
                  Choose from available AI voices for your agent
                </p>
              </div>

              {/* Voice Preview */}
              {(agent.voice_settings as unknown as VoiceSettings)?.voice_id && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Voice Preview</label>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-muted-foreground text-xs">
                        Ready
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
                            Sample Audio
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
                            // First try to get a cached sample
                            const cachedUrl = await getCachedVoiceSample(
                              (agent.voice_settings as unknown as VoiceSettings)
                                ?.voice_id,
                            );

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

                            // If no cached sample, generate one
                            toast.info(
                              'Generating voice sample (this may take a moment)...',
                            );

                            const result = await voiceTestMutation.mutateAsync({
                              voice_id: (
                                agent.voice_settings as unknown as VoiceSettings
                              )?.voice_id,
                              sample_text: 'Hello, this is a voice preview.',
                            });

                            // Extract the file path from the public URL
                            const url = new URL(result.audio_url);
                            const pathMatch = url.pathname.match(
                              /\/storage\/v1\/object\/public\/audio\/(.+)/,
                            );

                            if (pathMatch && pathMatch[1]) {
                              const originalFilePath = pathMatch[1];

                              // Try to cache the file for future use
                              try {
                                const { data: fileData } =
                                  await supabase.storage
                                    .from('audio')
                                    .download(originalFilePath);

                                if (fileData) {
                                  const sampleFileName = `samples/${(agent.voice_settings as unknown as VoiceSettings)?.voice_id}_sample.mp3`;
                                  await supabase.storage
                                    .from('audio')
                                    .upload(sampleFileName, fileData, {
                                      contentType: 'audio/mpeg',
                                      upsert: true,
                                    });
                                  console.log(
                                    'Voice sample cached successfully',
                                  );
                                }
                              } catch (cacheError) {
                                console.error(
                                  'Failed to cache sample:',
                                  cacheError,
                                );
                                // Continue anyway - we can still play the original
                              }

                              // Get authenticated URL for the original file
                              const { data: signedUrl, error: signedUrlError } =
                                await supabase.storage
                                  .from('audio')
                                  .createSignedUrl(originalFilePath, 3600);

                              if (signedUrlError) {
                                console.error(
                                  'Signed URL error:',
                                  signedUrlError,
                                );
                                toast.error(
                                  'Failed to generate authenticated audio URL',
                                );
                                return;
                              }

                              if (signedUrl) {
                                // Play the audio with authenticated URL
                                const audio = new Audio(signedUrl.signedUrl);
                                setIsPlayingPreview(true);

                                audio.onended = () =>
                                  setIsPlayingPreview(false);
                                audio.onerror = () => {
                                  setIsPlayingPreview(false);
                                  toast.error('Failed to play voice preview.');
                                };

                                await audio.play();
                                toast.success('Playing voice preview...');
                              } else {
                                toast.error(
                                  'Failed to generate authenticated audio URL',
                                );
                              }
                            } else {
                              toast.error('Invalid audio URL format');
                            }
                          } catch (error) {
                            console.error('Voice preview error:', error);
                            toast.error('Failed to generate voice preview.');
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
                      <span>•</span>
                      <span>High quality audio</span>
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
                    } catch (error) {
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
    </div>
  );
}
