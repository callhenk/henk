'use client';

import { useRef, useState } from 'react';

import { useConversation } from '@elevenlabs/react';
import { AlertCircle, Phone, PhoneOff, Volume2, Wifi, X } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Progress } from '@kit/ui/progress';
import { Spinner } from '@kit/ui/spinner';

interface RealtimeVoiceChatProps {
  agentId: string;
  agentName: string;
  elevenlabsAgentId: string;
  onClose?: () => void;
}

export function RealtimeVoiceChat({
  agentId,
  agentName,
  elevenlabsAgentId,
  onClose,
}: RealtimeVoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize ElevenLabs React SDK
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setIsConnected(true);
      setIsCalling(false);
      setConnectionTime(new Date());
      // Stop calling sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      toast.success('Connected to AI agent!', {
        description: 'You can now start speaking with your agent.',
      });
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setIsConnected(false);
      setIsCalling(false);
      setConnectionTime(null);
      setIsAgentSpeaking(false);
      // Stop calling sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
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

      setIsCalling(true);
      // Start calling sound
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.play().catch(console.error);
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
      setIsCalling(false);
      // Stop calling sound on error
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  // Stop conversation
  const stopConversation = async () => {
    try {
      await conversation.endSession();
      setIsCalling(false);
      // Stop calling sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      toast.success('Call ended');
    } catch (error) {
      console.error('Error stopping conversation:', error);
      toast.error('Failed to end call');
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
    <div className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      <Card className="border-border/50 bg-card/80 relative w-full max-w-md border shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <CardHeader className="bg-card/60 border-border/50 flex flex-row items-center justify-between space-y-0 border-b pb-4 backdrop-blur-sm">
          <div className="space-y-1">
            <CardTitle className="text-lg">Voice Call</CardTitle>
            <p className="text-muted-foreground text-sm">{agentName}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (isConnected) {
                await stopConversation();
              }
              onClose?.();
            }}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Bar */}
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span>5G</span>
            </div>
            <div className="font-medium">{getConnectionDuration()}</div>
            <div className="flex items-center gap-1">
              <div className="bg-muted-foreground/50 h-2 w-2 rounded-full" />
              <div className="bg-muted-foreground/50 h-2 w-2 rounded-full" />
              <div className="bg-muted-foreground/50 h-2 w-2 rounded-full" />
            </div>
          </div>

          {/* Call Info */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="bg-primary flex h-20 w-20 items-center justify-center rounded-full">
                  <Phone className="text-primary-foreground h-8 w-8" />
                </div>
                {isConnected && (
                  <div className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-green-500 p-1">
                    <div className="h-full w-full rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              {isCalling
                ? 'Calling...'
                : isConnected
                  ? 'Connected'
                  : 'Ready to call'}
            </p>
            {isCalling && (
              <div className="mt-2 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                <span className="text-sm">Connecting to agent...</span>
              </div>
            )}
            {isAgentSpeaking && (
              <div className="mt-2 flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <Volume2 className="h-4 w-4 animate-pulse" />
                <span className="text-sm">Agent speaking</span>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex justify-center space-x-4">
            {!isConnected ? (
              <Button
                onClick={startConversation}
                disabled={conversation.status === 'connecting'}
                size="lg"
                className="bg-primary hover:bg-primary/90 h-16 w-16 rounded-full"
              >
                {conversation.status === 'connecting' ? (
                  <Spinner className="text-primary-foreground h-6 w-6" />
                ) : (
                  <Phone className="text-primary-foreground h-6 w-6" />
                )}
              </Button>
            ) : (
              <div className="flex space-x-4">
                <Button
                  onClick={() => {
                    // Mute/unmute functionality could be added here
                    toast.info('Call controls coming soon');
                  }}
                  size="lg"
                  className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700"
                >
                  <Phone className="h-6 w-6 text-white" />
                </Button>
                <Button
                  onClick={stopConversation}
                  size="lg"
                  variant="destructive"
                  className="h-16 w-16 rounded-full"
                >
                  <PhoneOff className="text-destructive-foreground h-6 w-6" />
                </Button>
              </div>
            )}
          </div>

          {/* Call Status */}
          <div className="text-muted-foreground text-center text-sm">
            {!isConnected ? (
              <p>Tap the phone button to start your call</p>
            ) : (
              <p>Tap the red button to end the call</p>
            )}
          </div>

          {/* Connection Progress */}
          {conversation.status === 'connecting' && (
            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
                <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
                Connecting...
              </div>
              <Progress value={33} className="h-1" />
            </div>
          )}

          {/* Error Alert */}
          {conversation.status === 'disconnected' && isConnected && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Call disconnected. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Tips */}
          {!isConnected && (
            <Card className="border-border/50 bg-muted/30 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  💡 Call Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-muted-foreground space-y-2 text-sm">
                  <p>• Speak clearly and at a normal pace</p>
                  <p>• Allow microphone access when prompted</p>
                  <p>• The agent will respond automatically</p>
                  <p>• You can end the call anytime</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Hidden audio element for calling sound */}
      <audio ref={audioRef} src="/cellphone-ringing-6475.mp3" preload="auto" />
    </div>
  );
}
