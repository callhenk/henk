'use client';

import { useRef, useState } from 'react';

import { useConversation } from '@elevenlabs/react';
import { AlertCircle, Bot, Check, Phone, PhoneOff, Volume2, X } from 'lucide-react';
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
}

export function RealtimeVoiceChat({
  agentId,
  agentName,
  elevenlabsAgentId,
  onClose,
  inline = false,
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

  const cardContent = (
    <Card className={inline ? 'border-2' : 'relative w-full max-w-md border'}>
      {/* Header */}
      {!inline && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
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
      )}

        <CardContent className={inline ? 'space-y-6 p-6 sm:p-8' : 'space-y-6'}>
          {/* Call Info */}
          <div className="text-center">
            {/* Agent Avatar/Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className={`flex items-center justify-center rounded-full border-4 transition-all duration-300 ${
                  isConnected
                    ? 'h-24 w-24 border-green-200 bg-green-100 dark:border-green-800 dark:bg-green-900/30'
                    : 'h-24 w-24 border-blue-200 bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30'
                }`}>
                  <Bot className={`transition-all duration-300 ${
                    isConnected
                      ? 'h-12 w-12 text-green-600 dark:text-green-400'
                      : 'h-12 w-12 text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
                {isConnected && (
                  <div className="absolute -right-2 -bottom-2 animate-pulse">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-lg dark:border-gray-900">
                      <div className="h-3 w-3 rounded-full bg-white"></div>
                    </div>
                  </div>
                )}
                {isCalling && (
                  <div className="absolute inset-0 -m-2 animate-ping rounded-full bg-blue-400 opacity-75"></div>
                )}
              </div>
            </div>

            {/* Agent Name */}
            <h3 className="mb-2 text-xl font-bold">{agentName}</h3>

            {/* Status */}
            <div className="flex items-center justify-center gap-2">
              {isConnected && (
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              )}
              <p className={`text-sm font-medium ${
                isConnected ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              }`}>
                {isCalling
                  ? 'Connecting...'
                  : isConnected
                    ? `Connected • ${getConnectionDuration()}`
                    : 'Ready to talk'}
              </p>
            </div>

            {/* Agent Speaking Indicator */}
            {isAgentSpeaking && (
              <div className="mt-4 flex items-center justify-center gap-3 rounded-full bg-green-100 px-4 py-2 dark:bg-green-900/30">
                <Volume2 className="h-5 w-5 animate-pulse text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {agentName.split(' ')[0]} is speaking...
                </span>
              </div>
            )}

            {/* Connecting Indicator */}
            {isCalling && (
              <div className="mt-4 flex items-center justify-center gap-3 rounded-full bg-blue-100 px-4 py-2 dark:bg-blue-900/30">
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0.1s' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0.2s' }} />
                <span className="ml-2 text-sm font-medium text-blue-700 dark:text-blue-300">
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
                  className="group h-20 w-20 rounded-full bg-green-600 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-green-700 hover:shadow-xl dark:bg-green-600 dark:hover:bg-green-700"
                >
                  {conversation.status === 'connecting' ? (
                    <Spinner className="h-8 w-8 text-white" />
                  ) : (
                    <Phone className="h-8 w-8 text-white transition-transform group-hover:rotate-12" />
                  )}
                </Button>
                <p className="text-center text-sm font-medium text-muted-foreground">
                  Tap to start conversation
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Button
                  onClick={stopConversation}
                  size="lg"
                  className="group h-20 w-20 rounded-full bg-red-600 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-red-700 hover:shadow-xl dark:bg-red-600 dark:hover:bg-red-700"
                >
                  <PhoneOff className="h-8 w-8 text-white transition-transform group-hover:rotate-12" />
                </Button>
                <p className="text-center text-sm font-medium text-muted-foreground">
                  Tap to end call
                </p>
              </div>
            )}
          </div>

          {/* Connection Progress */}
          {conversation.status === 'connecting' && (
            <div className="space-y-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                Establishing secure connection...
              </div>
              <Progress value={33} className="h-2" />
            </div>
          )}

          {/* Error Alert */}
          {conversation.status === 'disconnected' && isConnected && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Connection lost. Please try calling again.
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Tips */}
          {!isConnected && !isCalling && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                  <span className="text-xs">💡</span>
                </div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Tips for a Great Conversation
                </h4>
              </div>
              <div className="space-y-2.5 text-sm text-blue-800 dark:text-blue-200">
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <p>Speak clearly at a natural pace</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <p>Allow microphone access when prompted</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <p>The agent responds in real-time</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <p>End the call anytime you want</p>
                </div>
              </div>
            </div>
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
