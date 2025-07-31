'use client';

import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Clock,
  Headphones,
  MessageSquare,
  Play,
  TrendingUp,
  User,
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
import { Separator } from '@kit/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

interface Conversation {
  id: string;
  donorName: string;
  phoneNumber: string;
  campaign: string;
  agent: string;
  status: 'completed' | 'in-progress' | 'failed' | 'no-answer';
  outcome:
    | 'donated'
    | 'callback-requested'
    | 'no-interest'
    | 'no-answer'
    | 'busy';
  duration: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  callDate: Date;
  amount?: number;
  transcript?: string;
  aiSummary?: string;
  keyPoints?: string[];
  followUpNotes?: string;
}

// Mock conversation data
const mockConversation: Conversation = {
  id: 'conv_001',
  donorName: 'Sarah Johnson',
  phoneNumber: '+1 (555) 123-4567',
  campaign: 'Summer Fundraiser 2024',
  agent: 'Sarah',
  status: 'completed',
  outcome: 'donated',
  duration: 245,
  sentiment: 'positive',
  callDate: new Date('2024-01-15T10:30:00'),
  amount: 150,
  transcript: `Agent: Hello, this is Sarah calling from the Community Foundation. May I speak with Sarah Johnson?

Donor: This is Sarah Johnson speaking.

Agent: Hi Sarah, thank you for taking my call. I'm calling about our Summer Fundraiser campaign that supports local youth programs. How are you doing today?

Donor: I'm doing well, thank you for asking.

Agent: That's great to hear. I wanted to share some exciting news about the impact your previous donations have made. Last year, we were able to provide summer camps for over 200 children in our community.

Donor: That's wonderful! I had no idea the impact was so significant.

Agent: Yes, it's really making a difference. This year, we're hoping to expand our programs to reach even more children. Would you be interested in supporting this year's campaign?

Donor: Absolutely! I'd love to help. How much would you recommend?

Agent: Any amount makes a difference, but we find that $150 provides a full week of summer camp for one child. Would that work for you?

Donor: That sounds perfect. I'd be happy to donate $150.

Agent: That's fantastic! Thank you so much for your generosity. I'll process that donation for you right now. Is there anything specific about our programs you'd like to know more about?

Donor: I'd love to hear more about the different programs you offer.

Agent: Of course! We have several programs including arts and crafts, sports, and educational activities. Each program is designed to keep children engaged and learning throughout the summer.

Donor: That sounds comprehensive. I'm glad my donation will help support these programs.

Agent: Your support means the world to us and the children we serve. Thank you again for your donation of $150. You'll receive a confirmation email shortly. Have a wonderful day!

Donor: Thank you, you too!`,
  aiSummary:
    'This was a highly successful call with a positive outcome. The donor was engaged and receptive throughout the conversation. The agent effectively used storytelling to demonstrate impact, which resonated well with the donor. The donor made a $150 donation and showed genuine interest in learning more about the programs. The conversation flowed naturally with good rapport building.',
  keyPoints: [
    'Donor was receptive and engaged from the start',
    'Agent effectively used impact storytelling',
    'Donor showed genuine interest in programs',
    'Successful $150 donation secured',
    'Good rapport building throughout call',
  ],
  followUpNotes:
    'Donor expressed interest in learning more about specific programs. Consider sending follow-up materials about arts and crafts programs.',
};

export function ConversationDetail({
  conversationId,
}: {
  conversationId: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/home/conversations');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'no-answer':
        return <Badge className="bg-gray-100 text-gray-800">No Answer</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'donated':
        return <Badge className="bg-green-100 text-green-800">Donated</Badge>;
      case 'callback-requested':
        return <Badge className="bg-blue-100 text-blue-800">Callback</Badge>;
      case 'no-interest':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">No Interest</Badge>
        );
      case 'no-answer':
        return <Badge className="bg-gray-100 text-gray-800">No Answer</Badge>;
      case 'busy':
        return <Badge className="bg-orange-100 text-orange-800">Busy</Badge>;
      default:
        return <Badge variant="outline">{outcome}</Badge>;
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Badge className="bg-green-100 text-green-800">Positive</Badge>;
      case 'neutral':
        return <Badge className="bg-gray-100 text-gray-800">Neutral</Badge>;
      case 'negative':
        return <Badge className="bg-red-100 text-red-800">Negative</Badge>;
      default:
        return <Badge variant="outline">{sentiment}</Badge>;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
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
          Back to Conversations
        </Button>
      </div>

      {/* Conversation Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Call Duration</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(mockConversation.duration)}
            </div>
            <p className="text-muted-foreground text-xs">4 minutes 5 seconds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Donation Amount
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockConversation.amount}</div>
            <p className="text-muted-foreground text-xs">
              Successfully secured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
            <User className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getSentimentBadge(mockConversation.sentiment)}
            </div>
            <p className="text-muted-foreground text-xs">AI analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Call Status</CardTitle>
            <Headphones className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getStatusBadge(mockConversation.status)}
            </div>
            <p className="text-muted-foreground text-xs">
              {getOutcomeBadge(mockConversation.outcome)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversation Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Call Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Donor Name
                  </label>
                  <p className="text-base">{mockConversation.donorName}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Phone Number
                  </label>
                  <p className="text-base">{mockConversation.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Campaign
                  </label>
                  <p className="text-base">{mockConversation.campaign}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Agent
                  </label>
                  <p className="text-base">{mockConversation.agent}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Call Date
                  </label>
                  <p className="text-base">
                    {formatDate(mockConversation.callDate)}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Call ID
                  </label>
                  <p className="text-base">{mockConversation.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcript and AI Summary */}
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="summary">AI Summary</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Call Transcript</CardTitle>
                  <CardDescription>
                    Full conversation transcript with speaker identification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 space-y-4 overflow-y-auto">
                    {mockConversation.transcript
                      ?.split('\n\n')
                      .map((exchange, index) => (
                        <div key={index} className="space-y-2">
                          <div className="text-muted-foreground text-sm">
                            {exchange}
                          </div>
                          {index <
                            mockConversation.transcript!.split('\n\n').length -
                              1 && <Separator />}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Analysis Summary</CardTitle>
                  <CardDescription>
                    AI-generated analysis of the conversation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="mb-2 font-medium">Summary</h4>
                    <p className="text-muted-foreground text-sm">
                      {mockConversation.aiSummary}
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium">Key Points</h4>
                    <ul className="space-y-1">
                      {mockConversation.keyPoints?.map((point, index) => (
                        <li
                          key={index}
                          className="text-muted-foreground flex items-start gap-2 text-sm"
                        >
                          <span className="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"></span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium">Follow-up Notes</h4>
                    <p className="text-muted-foreground text-sm">
                      {mockConversation.followUpNotes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Call Analytics</CardTitle>
                  <CardDescription>
                    Detailed metrics and insights from the conversation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-medium">Conversation Flow</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Opening</span>
                            <span className="text-green-600">Strong</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Engagement</span>
                            <span className="text-green-600">High</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Objection Handling</span>
                            <span className="text-blue-600">Effective</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Closing</span>
                            <span className="text-green-600">Successful</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-medium">
                          Performance Metrics
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Talk Time</span>
                            <span>
                              {formatDuration(mockConversation.duration)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Donation Secured</span>
                            <span className="text-green-600">Yes</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Follow-up Required</span>
                            <span className="text-blue-600">Yes</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Sentiment Score</span>
                            <span className="text-green-600">9.2/10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Listen to Call
              </Button>
              <Button className="w-full" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Download Transcript
              </Button>
              <Button className="w-full" variant="outline">
                <Headphones className="mr-2 h-4 w-4" />
                Export Summary
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Words Spoken
                </span>
                <span className="text-sm font-medium">247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Turns</span>
                <span className="text-sm font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Pauses</span>
                <span className="text-sm font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Interruptions
                </span>
                <span className="text-sm font-medium">0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
