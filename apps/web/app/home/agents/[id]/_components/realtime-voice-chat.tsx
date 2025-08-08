'use client';

import { useRef, useState } from 'react';

import { useConversation } from '@elevenlabs/react';
import { AlertCircle, Phone, PhoneOff, Volume2, Wifi } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Progress } from '@kit/ui/progress';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Glass modal container */}
      <div className="animate-in fade-in-0 zoom-in-95 relative w-full max-w-md overflow-hidden rounded-2xl border border-white/30 bg-white/90 shadow-2xl backdrop-blur-xl duration-300 dark:border-white/10 dark:bg-neutral-900/85">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/30 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-neutral-900/70">
          <div>
            <div className="text-muted-foreground text-sm">Voice Call</div>
            <div className="text-base font-semibold">{agentName}</div>
          </div>
          <button
            onClick={async () => {
              if (isConnected) {
                await stopConversation();
              }
              onClose?.();
            }}
            className="rounded-full border border-white/30 bg-white/60 p-2 text-neutral-800 hover:bg-white/80 dark:border-white/10 dark:bg-neutral-800/60 dark:text-white dark:hover:bg-neutral-800/80"
            aria-label="Close"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Status Bar */}
          <div className="mb-6 flex items-center justify-between text-neutral-600 dark:text-neutral-300">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">5G</span>
            </div>
            <div className="text-sm font-medium">{getConnectionDuration()}</div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-neutral-500 dark:bg-white" />
              <div className="h-2 w-2 rounded-full bg-neutral-500 dark:bg-white" />
              <div className="h-2 w-2 rounded-full bg-neutral-500 dark:bg-white" />
            </div>
          </div>

          {/* Call Info */}
          <div className="mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white/70 dark:bg-neutral-800">
                    <Phone className="h-8 w-8 text-neutral-900 dark:text-white" />
                  </div>
                </div>
                {isConnected && (
                  <div className="absolute -right-1 -bottom-1 h-6 w-6 animate-pulse rounded-full bg-green-500 p-1">
                    <div className="h-full w-full rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {isCalling
                ? 'Calling...'
                : isConnected
                  ? 'Connected'
                  : 'Ready to call'}
            </p>
            {isAgentSpeaking && (
              <div className="mt-2 flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <Volume2 className="h-4 w-4 animate-pulse" />
                <span className="text-sm">Agent speaking</span>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex justify-center space-x-8">
            {!isConnected ? (
              <Button
                onClick={startConversation}
                disabled={conversation.status === 'connecting'}
                className="h-16 w-16 rounded-full bg-green-500 transition-all duration-200 hover:scale-105 hover:bg-green-600"
                size="lg"
              >
                {conversation.status === 'connecting' ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Phone className="h-6 w-6 text-white" />
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {}}
                  className="h-16 w-16 rounded-full bg-green-500 transition-all duration-200 hover:scale-105 hover:bg-green-600"
                  size="lg"
                >
                  <Phone className="h-6 w-6 text-white" />
                </Button>
                <Button
                  onClick={stopConversation}
                  className="h-16 w-16 rounded-full bg-red-500 transition-all duration-200 hover:scale-105 hover:bg-red-600"
                  size="lg"
                >
                  <PhoneOff className="h-6 w-6 text-white" />
                </Button>
              </>
            )}
          </div>

          {/* Call Status */}
          <div className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {!isConnected ? <p>Tap to start call</p> : <p>Tap to end call</p>}
          </div>

          {/* Connection Progress */}
          {conversation.status === 'connecting' && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                Connecting...
              </div>
              <Progress value={33} className="h-1" />
            </div>
          )}

          {/* Error Alert */}
          {conversation.status === 'disconnected' && isConnected && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Call disconnected. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Tips */}
          {!isConnected && (
            <Card className="mt-6 border-white/30 bg-white/60 backdrop-blur dark:border-white/10 dark:bg-neutral-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  💡 Call Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
                  <p>• Speak clearly and at a normal pace</p>
                  <p>• Allow microphone access when prompted</p>
                  <p>• The agent will respond automatically</p>
                  <p>• You can end the call anytime</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Hidden audio element for calling sound */}
      <audio ref={audioRef} src="/cellphone-ringing-6475.mp3" preload="auto" />
    </div>
  );
}
