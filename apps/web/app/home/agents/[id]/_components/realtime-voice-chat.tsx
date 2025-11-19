'use client';

import { useRef, useState } from 'react';

import { useConversation } from '@elevenlabs/react';
import { AlertCircle, Bot, Phone, PhoneOff, Volume2, X } from 'lucide-react';
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
  inline?: boolean;
  // Optional demo notification data
  demoUserEmail?: string;
  demoUserName?: string;
  demoUseCase?: string;
}

export function RealtimeVoiceChat({
  agentId,
  agentName,
  elevenlabsAgentId,
  onClose,
  inline = false,
  demoUserEmail,
  demoUserName,
  demoUseCase,
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

      // Send demo notification if this is a demo conversation
      if (demoUserEmail) {
        const conversationId = conversation.getId();
        fetch('/api/demo/conversation-started', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agent_id: elevenlabsAgentId,
            agent_name: agentName,
            conversation_id: conversationId,
            email: demoUserEmail,
            name: demoUserName,
            use_case: demoUseCase,
            metadata: {
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              locale: navigator.language,
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString(),
            },
          }),
        }).catch((err) => {
          console.error('Failed to send demo notification:', err);
        });
      }
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

  const cardContent = (
    <Card className={inline ? 'border-2' : 'relative w-full max-w-md border'}>
      {/* Header */}
      {!inline && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg text-gray-900 dark:text-gray-50">
              Voice Call
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {agentName}
            </p>
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
      )}

      <CardContent className={inline ? 'space-y-6 p-6 sm:p-8' : 'space-y-6'}>
        {/* Call Info */}
        <div className="text-center">
          {/* Agent Avatar/Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div
                className={`flex items-center justify-center rounded-full border-4 transition-all duration-300 ${
                  isConnected
                    ? 'bg-primary/10 border-primary h-24 w-24'
                    : 'h-24 w-24 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <Bot
                  className={`transition-all duration-300 ${
                    isConnected
                      ? 'text-primary h-12 w-12'
                      : 'h-12 w-12 text-gray-400 dark:text-gray-500'
                  }`}
                />
              </div>
              {isConnected && (
                <div className="absolute -right-2 -bottom-2 animate-pulse">
                  <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-lg dark:border-gray-900">
                    <div className="h-3 w-3 rounded-full bg-white"></div>
                  </div>
                </div>
              )}
              {isCalling && (
                <div className="bg-primary absolute inset-0 -m-2 animate-ping rounded-full opacity-75"></div>
              )}
            </div>
          </div>

          {/* Agent Name */}
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-50">
            {agentName}
          </h3>

          {/* Status */}
          <div className="flex items-center justify-center gap-2">
            {isConnected && (
              <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
            )}
            <p
              className={`text-sm font-medium ${
                isConnected
                  ? 'text-primary'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {isCalling
                ? 'Connecting...'
                : isConnected
                  ? `Connected • ${getConnectionDuration()}`
                  : 'Ready to talk'}
            </p>
          </div>

          {/* Agent Speaking Indicator */}
          {isAgentSpeaking && (
            <div className="mt-4 flex items-center justify-center gap-3 rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-800">
              <Volume2 className="text-primary h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {agentName.split(' ')[0]} is speaking...
              </span>
            </div>
          )}

          {/* Connecting Indicator */}
          {isCalling && (
            <div className="mt-4 flex items-center justify-center gap-3 rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-800">
              <div className="bg-primary h-2 w-2 animate-bounce rounded-full" />
              <div
                className="bg-primary h-2 w-2 animate-bounce rounded-full"
                style={{ animationDelay: '0.1s' }}
              />
              <div
                className="bg-primary h-2 w-2 animate-bounce rounded-full"
                style={{ animationDelay: '0.2s' }}
              />
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-50">
                Setting up your call...
              </span>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex justify-center">
          {!isConnected ? (
            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={startConversation}
                disabled={conversation.status === 'connecting'}
                size="lg"
                className="bg-primary hover:bg-primary/90 group h-20 w-20 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
              >
                {conversation.status === 'connecting' ? (
                  <Spinner className="h-8 w-8 text-white" />
                ) : (
                  <Phone className="h-8 w-8 text-white transition-transform group-hover:rotate-12" />
                )}
              </Button>
              <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                Tap to start conversation
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={stopConversation}
                size="lg"
                variant="outline"
                className="hover:border-destructive hover:bg-destructive/10 group h-20 w-20 rounded-full border-2 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
              >
                <PhoneOff className="h-8 w-8 transition-transform group-hover:rotate-12" />
              </Button>
              <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                Tap to end call
              </p>
            </div>
          )}
        </div>

        {/* Connection Progress */}
        {conversation.status === 'connecting' && (
          <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-50">
              <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
              Establishing secure connection...
            </div>
            <Progress value={33} className="h-2" />
          </div>
        )}

        {/* Error Alert */}
        {conversation.status === 'disconnected' && isConnected && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Connection lost. Please try calling again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {inline ? (
        cardContent
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          {cardContent}
        </div>
      )}

      {/* Hidden audio element for calling sound */}
      <audio ref={audioRef} src="/cellphone-ringing-6475.mp3" preload="auto" />
    </>
  );
}
