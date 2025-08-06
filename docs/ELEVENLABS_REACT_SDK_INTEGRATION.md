# ElevenLabs React SDK Integration Guide

## 🎯 Overview

Based on the [ElevenLabs React SDK documentation](https://elevenlabs.io/docs/conversational-ai/libraries/react), this guide shows how to integrate the official `@elevenlabs/react` package for Conversational AI in your frontend application.

## 🚀 Installation

```bash
npm install @elevenlabs/react
# or
yarn add @elevenlabs/react
# or
pnpm install @elevenlabs/react
```

## 📋 Basic Usage

### 1. Simple Conversation Component

```javascript
// components/ElevenLabsConversation.js
import React, { useState, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";

export default function ElevenLabsConversation({ agentId, userId }) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs agent");
      setIsConnected(true);
      setError(null);
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs agent");
      setIsConnected(false);
    },
    onMessage: (message) => {
      console.log("Received message:", message);
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      setError(error.message);
    },
  });

  const startConversation = async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation
      const conversationId = await conversation.startSession({
        agentId: agentId,
        connectionType: "webrtc", // or 'websocket'
        user_id: userId,
      });

      console.log("Conversation started with ID:", conversationId);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setError(error.message);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error("Failed to end conversation:", error);
    }
  };

  const setVolume = async (volume) => {
    try {
      await conversation.setVolume({ volume });
    } catch (error) {
      console.error("Failed to set volume:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">AI Agent Conversation</h2>

      {/* Status Display */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {conversation.isSpeaking && (
          <div className="mt-2 text-sm text-blue-600">
            🎤 Agent is speaking...
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="space-y-3">
        {!isConnected ? (
          <button
            onClick={startConversation}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start Conversation
          </button>
        ) : (
          <button
            onClick={endConversation}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            End Conversation
          </button>
        )}

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <label className="text-sm">Volume:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            defaultValue="0.5"
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1"
          />
        </div>
      </div>

      {/* Microphone Access Notice */}
      <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-sm">
        <strong>Note:</strong> This conversation requires microphone access.
        Please allow microphone permissions when prompted.
      </div>
    </div>
  );
}
```

### 2. Advanced Conversation Component with Authentication

```javascript
// components/SecureElevenLabsConversation.js
import React, { useState, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";

export default function SecureElevenLabsConversation({ agentId, userId }) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs agent");
      setIsConnected(true);
      setError(null);
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs agent");
      setIsConnected(false);
    },
    onMessage: (message) => {
      console.log("Received message:", message);
      // Handle different message types
      if (message.type === "user_transcript") {
        // User's voice transcribed
        console.log("User said:", message.text);
      } else if (message.type === "agent_response") {
        // Agent's response
        console.log("Agent responded:", message.text);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      setError(error.message);
    },
  });

  const getSignedUrl = async () => {
    try {
      const response = await fetch("/api/elevenlabs/signed-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get signed URL");
      }

      const { signedUrl } = await response.json();
      return signedUrl;
    } catch (error) {
      console.error("Error getting signed URL:", error);
      throw error;
    }
  };

  const startConversation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL for authenticated conversation
      const signedUrl = await getSignedUrl();

      // Start the conversation with WebSocket
      const conversationId = await conversation.startSession({
        signedUrl,
        connectionType: "websocket",
        user_id: userId,
      });

      console.log("Conversation started with ID:", conversationId);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error("Failed to end conversation:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">
        Secure AI Agent Conversation
      </h2>

      {/* Status Display */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {conversation.isSpeaking && (
          <div className="mt-2 text-sm text-blue-600">
            🎤 Agent is speaking...
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="space-y-3">
        {!isConnected ? (
          <button
            onClick={startConversation}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Starting..." : "Start Conversation"}
          </button>
        ) : (
          <button
            onClick={endConversation}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            End Conversation
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
        <strong>Instructions:</strong>
        <ul className="mt-2 list-disc list-inside space-y-1">
          <li>Click "Start Conversation" to begin</li>
          <li>Allow microphone access when prompted</li>
          <li>Speak clearly into your microphone</li>
          <li>Wait for the agent to respond</li>
          <li>Click "End Conversation" when finished</li>
        </ul>
      </div>
    </div>
  );
}
```

### 3. API Route for Signed URLs

```javascript
// pages/api/elevenlabs/signed-url.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { agentId, userId } = req.body;

    // Get signed URL from ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get signed URL from ElevenLabs");
    }

    const data = await response.json();

    res.status(200).json({
      signedUrl: data.signed_url,
    });
  } catch (error) {
    console.error("Error getting signed URL:", error);
    res.status(500).json({ error: error.message });
  }
}
```

### 4. Usage in Your App

```javascript
// pages/conversation.js
import ElevenLabsConversation from "../components/ElevenLabsConversation";
import SecureElevenLabsConversation from "../components/SecureElevenLabsConversation";

export default function ConversationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          AI Agent Conversations
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Public Agent */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Public Agent</h2>
            <ElevenLabsConversation
              agentId="your-public-agent-id"
              userId="user-123"
            />
          </div>

          {/* Secure Agent */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Secure Agent</h2>
            <SecureElevenLabsConversation
              agentId="your-secure-agent-id"
              userId="user-123"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### Package.json Dependencies

```json
{
  "dependencies": {
    "@elevenlabs/react": "^1.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

## 🎯 Key Benefits of Using the Official SDK

1. **Official Support**: Maintained by ElevenLabs team
2. **Better Reliability**: Tested and optimized
3. **Automatic Updates**: Bug fixes and new features
4. **Proper Error Handling**: Built-in error management
5. **TypeScript Support**: Full type definitions
6. **WebRTC/WebSocket Support**: Multiple connection types
7. **Volume Control**: Built-in audio controls
8. **Status Tracking**: Real-time connection status

## 📋 Integration with Knowledge Bases

The knowledge bases you create through our Edge Functions can be connected to agents that use this React SDK:

```javascript
// Connect knowledge base to agent (done through agent training)
const agentWithKnowledgeBase = {
  agentId: "your-agent-id",
  knowledgeBaseId: "kb_123456",
  // The agent will automatically use the knowledge base during conversations
};
```

This approach using the [official ElevenLabs React SDK](https://elevenlabs.io/docs/conversational-ai/libraries/react) provides a much more robust and reliable solution than custom implementations! 🎯
