# ElevenLabs Voice Integration Guide

## 🎯 Overview

This guide explains how to integrate the ElevenLabs React SDK with the agent testing voice component for real-time voice conversations.

## 🚀 Installation

First, install the ElevenLabs React SDK:

```bash
npm install @elevenlabs/react
# or
yarn add @elevenlabs/react
# or
pnpm add @elevenlabs/react
```

## 📋 Integration Steps

### 1. Update Voice Testing Component

Replace the current voice testing component with the ElevenLabs SDK integration:

```typescript
// apps/web/app/home/agents/[id]/_components/testing/voice-testing.tsx
'use client';

import { useEffect, useState } from 'react';

import { useConversation } from '@elevenlabs/react';
import { Mic, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

// apps/web/app/home/agents/[id]/_components/testing/voice-testing.tsx

// apps/web/app/home/agents/[id]/_components/testing/voice-testing.tsx

// ... rest of imports

export function VoiceTesting({ agentId, agentName }: VoiceTestingProps) {
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);

  // Initialize ElevenLabs conversation
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs agent');
      setIsVoiceConnected(true);
      setVoiceError(null);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs agent');
      setIsVoiceConnected(false);
    },
    onMessage: (message) => {
      console.log('Received message:', message);
      if (message.type === 'agent_response') {
        setIsAgentSpeaking(true);
        // Stop speaking after response duration
        setTimeout(() => setIsAgentSpeaking(false), 3000);
      }
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      setVoiceError(error.message);
    },
  });

  const startVoiceConversation = async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with ElevenLabs
      const conversationId = await conversation.startSession({
        agentId: agentId,
        connectionType: 'webrtc', // or 'websocket'
        user_id: 'test-user',
      });

      setIsRecording(true);
      toast.success('Voice conversation started');
    } catch (error) {
      console.error('Voice conversation error:', error);
      toast.error('Failed to start voice conversation');
    }
  };

  const stopVoiceConversation = async () => {
    try {
      await conversation.endSession();
      setIsRecording(false);
      setIsAgentSpeaking(false);
      toast.success('Voice conversation ended');
    } catch (error) {
      console.error('Error stopping voice conversation:', error);
    }
  };

  const setVolumeLevel = async (newVolume: number) => {
    try {
      await conversation.setVolume({ volume: newVolume });
      setVolume(newVolume);
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  };

  // ... rest of component
}
```

### 2. Update API Endpoint

Enhance the agent conversation API to support ElevenLabs integration:

```typescript
// apps/web/app/api/agent-conversation/route.ts

async function handleStartConversation(
  supabase: any,
  agent: any,
  userId: string,
  conversationType: string,
) {
  try {
    // Create conversation record
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        campaign_id: null,
        agent_id: agent.id,
        lead_id: null,
        status: 'initiated',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (conversationError) {
      throw new Error(
        `Failed to create conversation: ${conversationError.message}`,
      );
    }

    // Get ElevenLabs signed URL for voice conversations
    let signedUrl = null;
    if (conversationType === 'voice') {
      const elevenLabsResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          },
        },
      );

      if (elevenLabsResponse.ok) {
        const data = await elevenLabsResponse.json();
        signedUrl = data.signed_url;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        conversation_id: conversation.id,
        agent: {
          id: agent.id,
          name: agent.name,
          voice_id: agent.voice_id,
          voice_settings: agent.voice_settings,
        },
        conversation_type: conversationType,
        signed_url: signedUrl,
      },
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start conversation',
      },
      { status: 500 },
    );
  }
}
```

### 3. Environment Variables

Add the required environment variables:

```bash
# .env.local
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### 4. Package.json Dependencies

Update your package.json:

```json
{
  "dependencies": {
    "@elevenlabs/react": "^1.0.0"
    // ... other dependencies
  }
}
```

## 🎯 Key Features

### **Real-time Voice Conversations**

- Direct voice communication with agents
- Real-time audio streaming
- Voice quality optimization

### **Agent Voice Customization**

- Use agent's configured voice settings
- Dynamic voice switching
- Voice quality metrics

### **Conversation Management**

- Session tracking
- Conversation history
- Error handling and recovery

### **Performance Monitoring**

- Response time tracking
- Voice quality indicators
- Connection status monitoring

## 🔧 Configuration Options

### **Connection Types**

```typescript
// WebRTC (recommended for real-time)
connectionType: 'webrtc';

// WebSocket (alternative)
connectionType: 'websocket';
```

### **Voice Settings**

```typescript
// Agent voice configuration
voice_settings: {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true
}
```

### **Error Handling**

```typescript
onError: (error) => {
  console.error('Conversation error:', error);
  // Handle different error types
  if (error.code === 'MICROPHONE_ACCESS_DENIED') {
    // Handle microphone permission issues
  } else if (error.code === 'NETWORK_ERROR') {
    // Handle network connectivity issues
  }
};
```

## 🚀 Usage Example

```typescript
// Complete voice testing with ElevenLabs
<VoiceTesting
  agentId="agent-123"
  agentName="Sarah"
/>

// The component will automatically:
// 1. Initialize ElevenLabs SDK
// 2. Request microphone permissions
// 3. Start voice conversation
// 4. Handle real-time audio streaming
// 5. Manage conversation lifecycle
```

## 📊 Benefits

### **Enhanced User Experience**

- Real-time voice conversations
- Natural speech interaction
- Professional voice quality

### **Better Testing**

- Authentic conversation testing
- Voice quality validation
- Performance benchmarking

### **Scalability**

- Cloud-based voice processing
- Automatic scaling
- Global voice availability

## 🔒 Security Considerations

### **API Key Management**

- Store API keys securely
- Use environment variables
- Implement key rotation

### **User Privacy**

- Secure audio transmission
- Data encryption
- Privacy compliance

### **Access Control**

- User authentication
- Session management
- Permission validation

## 🎯 Next Steps

1. **Install ElevenLabs SDK**: `npm install @elevenlabs/react`
2. **Update Voice Component**: Replace with SDK integration
3. **Configure Environment**: Add API keys
4. **Test Integration**: Verify voice conversations work
5. **Monitor Performance**: Track voice quality and response times

This integration will provide users with authentic voice testing capabilities for their agents! 🎯
