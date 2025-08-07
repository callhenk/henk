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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Phone Call Interface */}
      <div className="animate-in fade-in-0 zoom-in-95 relative w-full max-w-sm duration-300">
        {/* Phone Screen */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900 to-black p-8 shadow-2xl ring-1 ring-white/10">
          {/* Close Button */}
          <button
            onClick={async () => {
              if (isConnected) {
                await stopConversation();
              }
              onClose?.();
            }}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
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

          {/* Status Bar */}
          <div className="mb-8 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">5G</span>
            </div>
            <div className="text-sm font-medium">{getConnectionDuration()}</div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-white"></div>
              <div className="h-2 w-2 rounded-full bg-white"></div>
              <div className="h-2 w-2 rounded-full bg-white"></div>
            </div>
          </div>

          {/* Call Info */}
          <div className="mb-8 text-center text-white">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-800">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                </div>
                {isConnected && (
                  <div className="absolute -right-1 -bottom-1 h-6 w-6 animate-pulse rounded-full bg-green-500 p-1">
                    <div className="h-full w-full rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </div>
            <h2 className="mb-1 text-xl font-semibold">{agentName}</h2>
            <p className="text-sm text-gray-300">
              {isCalling
                ? 'Calling...'
                : isConnected
                  ? 'Connected'
                  : 'Ready to call'}
            </p>
            {isAgentSpeaking && (
              <div className="mt-2 flex items-center justify-center gap-2 text-green-400">
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
                {/* Answer Call Button */}
                <Button
                  onClick={() => {
                    // Handle incoming call answer
                  }}
                  className="h-16 w-16 rounded-full bg-green-500 transition-all duration-200 hover:scale-105 hover:bg-green-600"
                  size="lg"
                >
                  <Phone className="h-6 w-6 text-white" />
                </Button>

                {/* End Call Button */}
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
          <div className="mt-4 text-center text-sm text-gray-400">
            {!isConnected ? <p>Tap to start call</p> : <p>Tap to end call</p>}
          </div>

          {/* Connection Progress */}
          {conversation.status === 'connecting' && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
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
        </div>

        {/* Quick Tips */}
        {!isConnected && (
          <Card className="mt-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                💡 Call Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>• Speak clearly and at a normal pace</p>
                <p>• Allow microphone access when prompted</p>
                <p>• The agent will respond automatically</p>
                <p>• You can end the call anytime</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hidden audio element for calling sound */}
      <audio ref={audioRef} src="/cellphone-ringing-6475.mp3" preload="auto" />
    </div>
  );
}
