'use client';

import { useState } from 'react';

import { Bot, MessageSquare, Send, User } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Input } from '@kit/ui/input';

import { ConversationMessage } from './types';

interface TextChatProps {
  agentId: string;
  agentName: string;
}

export function TextChat({ agentId, agentName }: TextChatProps) {
  // Text conversation state
  const [textMessages, setTextMessages] = useState<ConversationMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const sendTextMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };

    setTextMessages((prev) => [...prev, userMessage]);
    setCurrentMessage('');
    setIsSendingMessage(true);

    try {
      const response = await fetch('/api/agent-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_message',
          agent_id: agentId,
          message: currentMessage,
          user_id: 'test-user',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();

      const agentMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: result.data.response || 'No response received',
        timestamp: new Date(),
      };

      setTextMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Text Conversation
        </CardTitle>
        <CardDescription>
          Test your agent with text-based conversations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="h-96 space-y-4 overflow-y-auto rounded-lg border p-4">
          {textMessages.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <MessageSquare className="mx-auto mb-2 h-8 w-8" />
              <p>Start a conversation with your agent</p>
            </div>
          ) : (
            textMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg p-3 lg:max-w-md ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    {message.type === 'user' ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                    <span className="text-xs opacity-70">
                      {message.type === 'user' ? 'You' : agentName}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <p className="mt-1 text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {isSendingMessage && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-3 w-3" />
                  <span className="text-xs opacity-70">{agentName}</span>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"></div>
                  <div
                    className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendTextMessage();
              }
            }}
            disabled={isSendingMessage}
          />
          <Button
            onClick={sendTextMessage}
            disabled={!currentMessage.trim() || isSendingMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
