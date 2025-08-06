'use client';

import { useEffect, useRef, useState } from 'react';

import {
  Bot,
  MessageSquare,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  RotateCcw,
  Send,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@kit/ui/alert';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Label } from '@kit/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Textarea } from '@kit/ui/textarea';

import { RealtimeVoiceChat } from './realtime-voice-chat';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}

interface VoiceSettings {
  isRecording: boolean;
  isPlaying: boolean;
  isConnected: boolean;
  volume: number;
  isMuted: boolean;
}

interface AgentTestingProps {
  agentId: string;
}

export function AgentTesting({ agentId }: AgentTestingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testMode, setTestMode] = useState<'text' | 'voice' | 'realtime'>(
    'text',
  );
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    isRecording: false,
    isPlaying: false,
    isConnected: false,
    volume: 0.7,
    isMuted: false,
  });

  const [agentInfo, setAgentInfo] = useState<{
    name: string;
    voice_id: string;
    status: string;
    elevenlabs_agent_id: string;
  } | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load agent information
  useEffect(() => {
    loadAgentInfo();
  }, [agentId]);

  const loadAgentInfo = async () => {
    try {
      // This would call your Edge Function to get agent details
      const response = await fetch(`/api/agents/${agentId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded agent data:', data);
        setAgentInfo(data.data);
      }
    } catch (error) {
      console.error('Failed to load agent info:', error);
    }
  };

  // Initialize voice conversation
  const startVoiceConversation = async () => {
    try {
      setIsLoading(true);

      // Get user and business context
      const userResponse = await fetch('/api/auth/user');
      const userData = await userResponse.json();

      const businessResponse = await fetch('/api/auth/business');
      const businessData = await businessResponse.json();

      if (!userData.success || !businessData.success) {
        throw new Error('Failed to get user or business context');
      }

      // Call Edge Function to start voice conversation
      const response = await fetch('/api/agent-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agentId,
          account_id: userData.data.id,
          business_id: businessData.data.id,
          conversation_type: 'voice',
          message: "Hello! I'm ready to help you. How can I assist you today?",
        }),
      });

      if (response.ok) {
        const responseData = await response.json();

        if (responseData.success) {
          setConversationId(responseData.data.conversation_id);
          setVoiceSettings((prev) => ({ ...prev, isConnected: true }));

          // Add welcome message
          addMessage(
            'agent',
            responseData.data.message ||
              "Hello! I'm ready to help you. How can I assist you today?",
          );

          toast.success('Voice conversation started!');
        } else {
          throw new Error(
            responseData.error || 'Failed to start voice conversation',
          );
        }
      } else {
        throw new Error('Failed to start voice conversation');
      }
    } catch (error) {
      console.error('Error starting voice conversation:', error);
      toast.error('Failed to start voice conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop voice conversation
  const stopVoiceConversation = async () => {
    try {
      if (conversationId) {
        await fetch('/api/agent-conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'end_conversation',
            conversation_id: conversationId,
          }),
        });
      }

      setConversationId(null);
      setVoiceSettings((prev) => ({
        ...prev,
        isConnected: false,
        isRecording: false,
        isPlaying: false,
      }));

      toast.success('Voice conversation ended');
    } catch (error) {
      console.error('Error stopping voice conversation:', error);
      toast.error('Failed to stop voice conversation');
    }
  };

  // Send text message
  const sendTextMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      // Get user context
      const userResponse = await fetch('/api/auth/user');
      const userData = await userResponse.json();

      if (!userData.success) {
        throw new Error('Failed to get user context');
      }

      const response = await fetch('/api/agent-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agentId,
          account_id: userData.data.id,
          conversation_id: conversationId,
          message: userMessage,
          conversation_type: 'text',
        }),
      });

      if (response.ok) {
        const responseData = await response.json();

        if (responseData.success) {
          addMessage(
            'agent',
            responseData.data.message || responseData.data.response,
          );
        } else {
          throw new Error(responseData.error || 'Failed to send message');
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('agent', 'Sorry, I encountered an error. Please try again.');
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        });
        await sendVoiceMessage(audioBlob);
      };

      mediaRecorder.start();
      setVoiceSettings((prev) => ({ ...prev, isRecording: true }));

      // Add user message indicator
      addMessage('user', '🎤 Recording...', true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && voiceSettings.isRecording) {
      mediaRecorderRef.current.stop();
      setVoiceSettings((prev) => ({ ...prev, isRecording: false }));

      // Stop all tracks
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  // Send voice message
  const sendVoiceMessage = async (audioBlob: Blob) => {
    try {
      // Get user context
      const userResponse = await fetch('/api/auth/user');
      const userData = await userResponse.json();

      if (!userData.success) {
        throw new Error('Failed to get user context');
      }

      const formData = new FormData();

      // Add JSON data
      const jsonData = {
        agent_id: agentId,
        account_id: userData.data.id,
        conversation_id: conversationId,
        conversation_type: 'voice',
      };

      formData.append('data', JSON.stringify(jsonData));
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/agent-conversation', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();

        if (responseData.success) {
          // Remove the "Recording..." message and add the actual response
          setMessages((prev) =>
            prev.filter((msg) => msg.content !== '🎤 Recording...'),
          );
          addMessage(
            'agent',
            responseData.data.message || responseData.data.response,
          );

          // Play agent's audio response if available
          if (responseData.data.audio_url) {
            playAudioResponse(responseData.data.audio_url);
          }
        } else {
          throw new Error(responseData.error || 'Failed to send voice message');
        }
      } else {
        throw new Error('Failed to send voice message');
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast.error('Failed to send voice message');
    }
  };

  // Play audio response
  const playAudioResponse = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.volume = voiceSettings.volume;
      audioRef.current.play();
      setVoiceSettings((prev) => ({ ...prev, isPlaying: true }));
    }
  };

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

  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
    setConversationId(null);
  };

  // Handle key press for text input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Agent Information */}
      {agentInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {agentInfo.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Voice ID</Label>
                <p className="text-muted-foreground">{agentInfo.voice_id}</p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge
                  variant={
                    agentInfo.status === 'active' ? 'default' : 'secondary'
                  }
                >
                  {agentInfo.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testing Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Agent Testing</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearConversation}
                disabled={messages.length === 0}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={testMode}
            onValueChange={(value) =>
              setTestMode(value as 'text' | 'voice' | 'realtime')
            }
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Text Chat
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice Chat
              </TabsTrigger>
              <TabsTrigger value="realtime" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Real-time Voice
              </TabsTrigger>
            </TabsList>

            {/* Text Chat Tab */}
            <TabsContent value="text" className="space-y-4">
              {/* Messages */}
              <div className="h-96 space-y-4 overflow-y-auto rounded-lg border p-4">
                {messages.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Start a conversation with your agent</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          {message.type === 'user' ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Bot className="h-3 w-3" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Bot className="h-3 w-3" />
                        <span className="text-xs opacity-70">
                          Agent is typing...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Input */}
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  rows={2}
                />
                <Button
                  onClick={sendTextMessage}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Voice Chat Tab */}
            <TabsContent value="voice" className="space-y-4">
              {/* Voice Controls */}
              <div className="flex items-center justify-center gap-4">
                {!voiceSettings.isConnected ? (
                  <Button onClick={startVoiceConversation} disabled={isLoading}>
                    <Phone className="mr-2 h-4 w-4" />
                    Start Voice Chat
                  </Button>
                ) : (
                  <div className="flex items-center gap-4">
                    <Button
                      variant={
                        voiceSettings.isRecording ? 'destructive' : 'default'
                      }
                      onClick={
                        voiceSettings.isRecording
                          ? stopRecording
                          : startRecording
                      }
                      disabled={!voiceSettings.isConnected}
                    >
                      {voiceSettings.isRecording ? (
                        <MicOff className="mr-2 h-4 w-4" />
                      ) : (
                        <Mic className="mr-2 h-4 w-4" />
                      )}
                      {voiceSettings.isRecording
                        ? 'Stop Recording'
                        : 'Start Recording'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={stopVoiceConversation}
                      disabled={!voiceSettings.isConnected}
                    >
                      <PhoneOff className="mr-2 h-4 w-4" />
                      End Call
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setVoiceSettings((prev) => ({
                          ...prev,
                          isMuted: !prev.isMuted,
                        }))
                      }
                    >
                      {voiceSettings.isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Voice Status */}
              {voiceSettings.isConnected && (
                <Alert>
                  <AlertDescription className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    Voice conversation active
                  </AlertDescription>
                </Alert>
              )}

              {/* Messages (same as text chat) */}
              <div className="h-96 space-y-4 overflow-y-auto rounded-lg border p-4">
                {messages.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    <Mic className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Start a voice conversation with your agent</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          {message.type === 'user' ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Bot className="h-3 w-3" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Real-time Voice Chat Tab */}
            <TabsContent value="realtime" className="space-y-4">
              {agentInfo ? (
                agentInfo.elevenlabs_agent_id ? (
                  <RealtimeVoiceChat
                    agentId={agentId}
                    agentName={agentInfo.name}
                    voiceId={agentInfo.voice_id}
                    elevenlabsAgentId={agentInfo.elevenlabs_agent_id}
                  />
                ) : (
                  <div className="text-muted-foreground py-8 text-center">
                    <Bot className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>
                      This agent doesn't have ElevenLabs integration configured.
                    </p>
                    <p className="text-sm">
                      Please create the agent with ElevenLabs voice settings.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <Bot className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>Loading agent information...</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Hidden audio element for playing responses */}
      <audio
        ref={audioRef}
        onEnded={() =>
          setVoiceSettings((prev) => ({ ...prev, isPlaying: false }))
        }
      />
    </div>
  );
}
