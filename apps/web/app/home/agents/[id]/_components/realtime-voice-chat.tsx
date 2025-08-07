'use client';

import { useState } from 'react';

import { useConversation } from '@elevenlabs/react';
import {
  AlertCircle,
  Clock,
  Phone,
  PhoneOff,
  Volume2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@kit/ui/alert';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Progress } from '@kit/ui/progress';

interface RealtimeVoiceChatProps {
  agentId: string;
  agentName: string;
  voiceId: string;
  elevenlabsAgentId: string;
}

export function RealtimeVoiceChat({
  agentId,
  agentName,
  voiceId: _voiceId,
  elevenlabsAgentId,
}: RealtimeVoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);

  // Initialize ElevenLabs React SDK
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setIsConnected(true);
      setConnectionTime(new Date());
      toast.success('Connected to AI agent!', {
        description: 'You can now start speaking with your agent.',
      });
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setIsConnected(false);
      setConnectionTime(null);
      setIsAgentSpeaking(false);
    },
    onMessage: (message: unknown) => {
      // Handle incoming messages from the agent
      let messageText = '';
      if (typeof message === 'string') {
        messageText = message;
      } else if (
        message &&
        typeof message === 'object' &&
        'message' in message
      ) {
        messageText = String((message as { message: unknown }).message);
      }

      if (messageText.trim()) {
        setIsAgentSpeaking(true);
        // Simulate agent speaking duration
        setTimeout(() => setIsAgentSpeaking(false), 3000);
      }
    },
    onError: (error) => {
      console.error('ElevenLabs connection error:', error);
      toast.error(
        'Connection error: ' +
          (typeof error === 'string' ? error : String(error)),
      );
    },
  });

  // Start real-time conversation
  const startConversation = async () => {
    try {
      console.log('Starting conversation with:', {
        agentId,
        agentName,
        elevenlabsAgentId,
      });

      if (!elevenlabsAgentId || elevenlabsAgentId === 'default') {
        throw new Error('Valid ElevenLabs agent ID is required');
      }

      // Request microphone access first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation session
      await conversation.startSession({
        agentId: elevenlabsAgentId,
        connectionType: 'webrtc',
        userId: 'user-' + Date.now(),
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  // Stop conversation
  const stopConversation = async () => {
    try {
      await conversation.endSession();
      toast.success('Conversation ended');
    } catch (error) {
      console.error('Error stopping conversation:', error);
      toast.error('Failed to stop conversation');
    }
  };

  // Get connection duration
  const getConnectionDuration = () => {
    if (!connectionTime) return '0:00';
    const now = new Date();
    const diff = Math.floor((now.getTime() - connectionTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="border-muted-foreground/20 hover:border-primary/50 border-2 border-dashed transition-colors">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="relative">
              <Phone className="text-primary h-6 w-6" />
              {isConnected && (
                <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-green-500" />
              )}
            </div>
            <div>
              <div className="text-lg font-semibold">Real-time Voice Chat</div>
              <div className="text-muted-foreground text-sm">
                {isConnected ? `Connected to ${agentName}` : 'Ready to connect'}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Indicators */}
          <div className="flex flex-wrap items-center gap-4">
            <Badge
              variant={isConnected ? 'default' : 'secondary'}
              className="flex items-center gap-2"
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Disconnected
                </>
              )}
            </Badge>

            {isConnected && connectionTime && (
              <Badge variant="outline" className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {getConnectionDuration()}
              </Badge>
            )}

            {isAgentSpeaking && (
              <Badge
                variant="default"
                className="flex animate-pulse items-center gap-2"
              >
                <Volume2 className="h-3 w-3" />
                Agent Speaking
              </Badge>
            )}
          </div>

          {/* Connection Progress */}
          {conversation.status === 'connecting' && (
            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                Connecting to agent...
              </div>
              <Progress value={33} className="h-1" />
            </div>
          )}

          {/* Error Alert */}
          {conversation.status === 'disconnected' && isConnected && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connection lost. Please try reconnecting.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isConnected ? (
              <Button
                onClick={startConversation}
                disabled={conversation.status === 'connecting'}
                className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 flex items-center gap-2 bg-gradient-to-r"
                size="lg"
              >
                {conversation.status === 'connecting' ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    Start Conversation
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={stopConversation}
                variant="destructive"
                className="flex items-center gap-2"
                size="lg"
              >
                <PhoneOff className="h-4 w-4" />
                End Conversation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      {!isConnected && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              💡 Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p>• Speak clearly and at a normal pace</p>
              <p>• Allow microphone access when prompted</p>
              <p>• The agent will respond automatically</p>
              <p>• You can end the conversation anytime</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
