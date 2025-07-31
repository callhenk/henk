'use client';

import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  BookOpen,
  Clock,
  Mic,
  Phone,
  Play,
  Settings,
  TrendingUp,
  Users,
  Workflow,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Switch } from '@kit/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Textarea } from '@kit/ui/textarea';

import { WorkflowBuilder } from './workflow-builder';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused';
  language: string;
  tone: string;
  voiceId: string;
  voiceName: string;
  defaultScript: string;
  campaigns: string[];
  callsHandled: number;
  conversionRate: number;
  activeHours: number;
  lastEdited: Date;
  organizationInfo: string;
  donorContext: string;
  faqs: string;
  workflowRules: string;
}

// Mock agent data
const mockAgent: Agent = {
  id: 'agent_001',
  name: 'Renewal Agent',
  description: 'Persuades donors to upgrade membership',
  status: 'active',
  language: 'english',
  tone: 'friendly',
  voiceId: 'voice_sarah_001',
  voiceName: 'Sarah (ElevenLabs)',
  defaultScript:
    'Hello, this is Sarah calling on behalf of [Organization]. We&apos;re reaching out to discuss our current fundraising campaign...',
  campaigns: ['Summer Fundraiser 2024', 'Holiday Campaign'],
  callsHandled: 245,
  conversionRate: 68,
  activeHours: 156,
  lastEdited: new Date('2024-01-15T10:30:00'),
  organizationInfo: `Our organization is dedicated to supporting local youth programs through comprehensive summer camps and educational activities. We serve over 200 children annually, providing them with opportunities to learn, grow, and develop new skills in a safe and nurturing environment.

Our mission is to ensure that every child, regardless of their background, has access to quality educational and recreational programs that help them reach their full potential.`,
  donorContext: `Our donors are typically:
- Previous supporters who have donated $50-$500 in the past
- Parents and grandparents who value education and youth development
- Local community members who want to make a positive impact
- Business owners who support community initiatives

Key talking points:
- Emphasize the direct impact of their donation
- Share specific success stories
- Highlight the comprehensive nature of our programs
- Mention the long-term benefits for children`,
  faqs: `Common Questions and Responses:

Q: "How much of my donation goes directly to the programs?"
A: "85% of every dollar goes directly to program costs, with only 15% covering administrative expenses."

Q: "What if I can't afford to donate right now?"
A: "We understand that everyone's situation is different. Even small donations make a big difference, and we also offer monthly giving options starting at just $10."

Q: "How do I know my donation is making an impact?"
A: "We provide regular updates on our programs and can share specific stories of children who have benefited from our services."

Q: "Can I volunteer instead of donating?"
A: "Absolutely! We welcome volunteers and can connect you with opportunities that match your interests and schedule."`,
  workflowRules: `Call Workflow Rules:

1. Initial Contact
   - Greet donor warmly and introduce yourself
   - Confirm you're speaking with the right person
   - Briefly mention your organization and purpose

2. If donor doesn't pick up
   - Leave a brief voicemail with callback number
   - Schedule retry for different time (3 attempts total)
   - Note in CRM for follow-up

3. If donor pledges
   - Confirm donation amount and payment method
   - Thank them warmly and explain next steps
   - Tag as "converted" in CRM
   - Send immediate confirmation email

4. If donor is confused or has questions
   - Listen actively and address concerns
   - Provide clear, helpful information
   - Offer to send additional materials
   - Route to fallback script if needed

5. If donor declines
   - Thank them for their time
   - Ask if they'd like to stay informed
   - Note reason for decline in CRM
   - Respect their decision gracefully

6. Follow-up Actions
   - Send thank you emails within 24 hours
   - Schedule follow-up calls for interested donors
   - Update CRM with call outcomes
   - Track conversion metrics`,
};

export function AgentDetail({ agentId: _agentId }: { agentId: string }) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/home/agents');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
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
      {/* Header with Back Button and Status Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status</span>
            <Switch defaultChecked={mockAgent.status === 'active'} />
            {getStatusBadge(mockAgent.status)}
          </div>
        </div>
      </div>

      {/* Agent Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{mockAgent.name}</CardTitle>
              <CardDescription className="mt-2 text-base">
                {mockAgent.description}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Play className="mr-2 h-4 w-4" />
                Test Call
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
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
                    <div className="text-2xl font-bold">
                      {mockAgent.callsHandled}
                    </div>
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
                    <div className="text-2xl font-bold">
                      {mockAgent.conversionRate}%
                    </div>
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
                    <div className="text-2xl font-bold">
                      {mockAgent.activeHours}
                    </div>
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
                      <p className="text-base">{mockAgent.language}</p>
                    </div>
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Tone
                      </label>
                      <p className="text-base">{mockAgent.tone}</p>
                    </div>
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Voice
                      </label>
                      <p className="text-base">{mockAgent.voiceName}</p>
                    </div>
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Last Edited
                      </label>
                      <p className="text-base">
                        {formatDate(mockAgent.lastEdited)}
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
                    {mockAgent.campaigns.map((campaign, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <span className="font-medium">{campaign}</span>
                        <Badge variant="outline">Active</Badge>
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
                    <p className="text-sm">{mockAgent.defaultScript}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Play className="mr-2 h-4 w-4" />
                    Test Voice
                  </Button>
                  <Button className="w-full" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Knowledge Base
                  </Button>
                  <Button className="w-full" variant="outline">
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
              <CardContent>
                <Textarea
                  value={mockAgent.organizationInfo}
                  className="min-h-[200px] resize-none"
                  placeholder="Enter organization information..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Donor Context</CardTitle>
                <CardDescription>
                  What the agent should know about specific donor groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={mockAgent.donorContext}
                  className="min-h-[200px] resize-none"
                  placeholder="Enter donor context information..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Expected objections or questions + how to respond
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={mockAgent.faqs}
                  className="min-h-[300px] resize-none"
                  placeholder="Enter FAQs and responses..."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Voice & Tone Tab */}
        <TabsContent value="voice" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Settings
                </CardTitle>
                <CardDescription>
                  Configure the agent&apos;s voice and personality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Voice Selection</label>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {mockAgent.voiceName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tone Preset</label>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {mockAgent.tone}
                  </p>
                </div>
                <Button className="w-full" variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  Preview Voice
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Script Guidance</CardTitle>
                <CardDescription>
                  Agent personality notes and script guidance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter script guidance and personality notes..."
                  className="min-h-[200px] resize-none"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="mt-6">
          <WorkflowBuilder />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 border-t pt-6">
        <Button variant="outline">Cancel</Button>
        <Button>Save Agent Settings</Button>
      </div>
    </div>
  );
}
