'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  ArrowLeft,
  BookOpen,
  Clock,
  Mic,
  Phone,
  Play,
  TrendingUp,
  Users,
  Volume2,
  Workflow,
} from 'lucide-react';

// Import our Supabase hooks
import { useUpdateAgent } from '@kit/supabase/hooks/agents/use-agent-mutations';
import { useAgent } from '@kit/supabase/hooks/agents/use-agents';
import { useCampaigns } from '@kit/supabase/hooks/campaigns/use-campaigns';
import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
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
import { WorkflowBuilder } from './workflow-builder';

const voiceTypes = [
  { value: 'ai_generated', label: 'AI Generated' },
  { value: 'custom', label: 'Custom Voice' },
];

const speakingTones = [
  { value: 'warm-friendly', label: 'Warm and friendly' },
  { value: 'professional-confident', label: 'Professional and confident' },
  { value: 'compassionate-caring', label: 'Compassionate and caring' },
  { value: 'enthusiastic-energetic', label: 'Enthusiastic and energetic' },
  { value: 'calm-reassuring', label: 'Calm and reassuring' },
];

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

  // Update mutation
  const updateAgentMutation = useUpdateAgent();

  // State for knowledge base form
  const [organizationInfo, setOrganizationInfo] = useState('');
  const [donorContext, setDonorContext] = useState('');
  const [faqs, setFaqs] = useState('');
  const [savingField, setSavingField] = useState<string | null>(null);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Initialize form data when agent loads
  useEffect(() => {
    if (agent) {
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
          ...(fieldName === 'organization_info' && {
            organization_info: value,
          }),
          ...(fieldName === 'donor_context' && { donor_context: value }),
        };

        await updateAgentMutation.mutateAsync(updateData);

        console.log(`Saved ${fieldName} changes...`, value);

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
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agents
        </Button>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-sm font-medium text-green-800">{saveSuccess}</p>
        </div>
      )}

      {/* Agent Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">{agent.name}</h1>
              <p className="text-muted-foreground">{agent.description}</p>
            </div>
          </div>
          {getStatusBadge(agent.status)}
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="voice">Voice & Tone</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Stats Cards */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Language
                      </label>
                      <p className="text-base">English</p>
                    </div>
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Tone
                      </label>
                      <p className="text-base">
                        {agent.speaking_tone || 'Default'}
                      </p>
                    </div>
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Voice
                      </label>
                      <p className="text-base">
                        {agent.voice_type || 'Default'}
                      </p>
                    </div>
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Last Edited
                      </label>
                      <p className="text-base">
                        {formatDate(agent.updated_at)}
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
            <div className="space-y-6">
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
                    disabled={isTestingVoice}
                    onClick={async () => {
                      setIsTestingVoice(true);
                      try {
                        // Create a test script based on agent's description
                        const testScript =
                          agent.description ||
                          "Hello, this is a test call from your AI fundraising agent. I'm calling to thank you for your support and discuss how we can make an even greater impact together.";

                        // Call the voice test API
                        const response = await fetch('/api/voice/test', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            agentId: agent.id,
                            agentName: agent.name,
                            voiceType: agent.voice_type,
                            speakingTone: agent.speaking_tone,
                            testScript: testScript,
                          }),
                        });

                        if (!response.ok) {
                          throw new Error(
                            `HTTP error! status: ${response.status}`,
                          );
                        }

                        const result = await response.json();

                        if (result.success) {
                          console.log('Voice test completed:', result.data);
                          alert(
                            `Voice Test Completed!\n\nAgent: ${result.data.agentName}\nVoice Type: ${result.data.voiceType}\nTone: ${result.data.speakingTone}\n\nTest Script:\n"${result.data.testScript}"\n\nStatus: ${result.data.status}\n\nNote: Audio playback will be available when ElevenLabs integration is complete.`,
                          );
                        } else {
                          throw new Error(result.error || 'Voice test failed');
                        }
                      } catch (error) {
                        console.error('Voice test failed:', error);
                        alert(
                          `Voice test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        );
                      } finally {
                        setIsTestingVoice(false);
                      }
                    }}
                  >
                    {isTestingVoice ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Test Voice
                      </>
                    )}
                  </Button>
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
              {/* Voice Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Type</label>
                <Select defaultValue="ai_generated">
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

              {/* Speaking Tone */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Speaking Tone</label>
                <Select defaultValue="warm-friendly">
                  <SelectTrigger>
                    <SelectValue placeholder="Select speaking tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {speakingTones.map((tone) => (
                      <SelectItem key={tone.value} value={tone.value}>
                        {tone.label}
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
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </Button>
                  <Button variant="outline">
                    <Play className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button size="sm">Save Voice Settings</Button>
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
