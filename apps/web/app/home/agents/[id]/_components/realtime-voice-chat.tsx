'use client';

import { useState } from 'react';

import { useConversation } from '@elevenlabs/react';
import { Phone, PhoneOff, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@kit/ui/alert';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Label } from '@kit/ui/label';
import { Slider } from '@kit/ui/slider';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Initialize ElevenLabs React SDK
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setIsConnected(true);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setIsConnected(false);
    },
    onMessage: (message) => {
      // Handle incoming messages from the agent
      addMessage('agent', message.message);
    },
    onError: (error) => {
      console.error('ElevenLabs connection error:', error);
      toast.error(
        'Connection error: ' +
          (typeof error === 'string' ? error : error.message),
      );
    },
  });

  // Add message to conversation
  const addMessage = (
    type: 'user' | 'agent',
    content: string,
    isAudio = false,
  ) => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isAudio,
    };
    setMessages((prev) => [...prev, message]);
  };

  // Start real-time conversation
  const startConversation = async () => {
    try {
      console.log('Starting conversation with:', {
        agentId,
        agentName,
        elevenlabsAgentId,
      });

      if (!elevenlabsAgentId) {
        throw new Error('ElevenLabs agent ID is required');
      }

      // Request microphone access first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation session
      const sessionId = await conversation.startSession({
        agentId: elevenlabsAgentId,
        connectionType: 'webrtc', // or 'websocket'
        userId: 'user-' + Date.now(), // optional user ID
      });

      setConversationId(sessionId);
      addMessage('agent', `Hello! I'm ${agentName}, ready to help!`);
      toast.success('Real-time conversation started!');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  // Stop conversation
  const stopConversation = async () => {
    try {
      await conversation.endSession();
      setConversationId(null);
      toast.success('Conversation ended');
    } catch (error) {
      console.error('Error stopping conversation:', error);
      toast.error('Failed to stop conversation');
    }
  };

  // Send text message
  const sendTextMessage = async (message: string) => {
    if (!isConnected) return;

    try {
      addMessage('user', message);
      // The SDK handles sending messages automatically when connected
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Set volume
  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0] || 0.7;
    setVolume(newVolume);
    try {
      await conversation.setVolume({ volume: newVolume });
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
  };

  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Real-time Voice Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            {conversation.status === 'disconnected' && (
              <Alert>
                <AlertDescription>Connection error occurred</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex gap-2">
            {!isConnected ? (
              <Button
                onClick={startConversation}
                disabled={conversation.status === 'connecting'}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                {conversation.status === 'connecting'
                  ? 'Connecting...'
                  : 'Start Conversation'}
              </Button>
            ) : (
              <Button
                onClick={stopConversation}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <PhoneOff className="h-4 w-4" />
                End Conversation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voice Controls */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Voice Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge
                variant={conversation.isSpeaking ? 'default' : 'secondary'}
              >
                {conversation.isSpeaking ? 'Agent Speaking' : 'Agent Listening'}
              </Badge>

              <Button
                onClick={toggleMute}
                variant={isMuted ? 'destructive' : 'outline'}
                className="flex items-center gap-2"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>

              <Button
                onClick={clearConversation}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Volume</Label>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 space-y-4 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                Start a conversation to see messages here
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-3 py-2 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  sendTextMessage('Tell me about your fundraising services')
                }
                variant="outline"
                size="sm"
              >
                Fundraising Services
              </Button>
              <Button
                onClick={() =>
                  sendTextMessage('What are your current campaigns?')
                }
                variant="outline"
                size="sm"
              >
                Current Campaigns
              </Button>
              <Button
                onClick={() => sendTextMessage('How can I make a donation?')}
                variant="outline"
                size="sm"
              >
                Make Donation
              </Button>
              <Button
                onClick={() =>
                  sendTextMessage('What impact does my donation have?')
                }
                variant="outline"
                size="sm"
              >
                Impact
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
