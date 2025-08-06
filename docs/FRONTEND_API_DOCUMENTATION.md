# Frontend API Documentation

## 🎯 Overview

Complete guide for frontend developers to integrate with Supabase Edge Functions for ElevenLabs integration.

## 📋 Base Configuration

```javascript
// utils/api.js
const EDGE_FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + "/functions/v1";

export async function callEdgeFunction(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
```

## 🎙️ Voice Functions

### Get Available Voices

```javascript
// GET /elevenlabs-voices
export async function getVoices() {
  return callEdgeFunction(`${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-voices`);
}
```

### Generate Speech

```javascript
// POST /elevenlabs-generate
export async function generateSpeech(text, voiceId, options = {}) {
  return callEdgeFunction(`${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-generate`, {
    method: "POST",
    body: JSON.stringify({
      text,
      voice_id: voiceId,
      model_id: options.modelId || "eleven_monolingual_v1",
      voice_settings: options.voiceSettings || {},
    }),
  });
}
```

### Test Voice

```javascript
// POST /elevenlabs-test-voice
export async function testVoice(
  voiceId,
  sampleText = "Hello, this is a test."
) {
  return callEdgeFunction(`${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-test-voice`, {
    method: "POST",
    body: JSON.stringify({
      voice_id: voiceId,
      text: sampleText,
    }),
  });
}
```

## 📚 Knowledge Base Functions

### Create from Text

```javascript
// POST /elevenlabs-knowledge-base/text
export async function createKnowledgeBaseFromText(
  name,
  text,
  description = ""
) {
  return callEdgeFunction(
    `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base/text`,
    {
      method: "POST",
      body: JSON.stringify({ name, text, description }),
    }
  );
}
```

### Create from URL

```javascript
// POST /elevenlabs-knowledge-base/url
export async function createKnowledgeBaseFromUrl(url, name = null) {
  return callEdgeFunction(
    `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base/url`,
    {
      method: "POST",
      body: JSON.stringify({ url, name }),
    }
  );
}
```

### Add Text to Knowledge Base

```javascript
// POST /elevenlabs-knowledge-base/{id}/text
export async function addTextToKnowledgeBase(knowledgeBaseId, text) {
  return callEdgeFunction(
    `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base/${knowledgeBaseId}/text`,
    {
      method: "POST",
      body: JSON.stringify({ text }),
    }
  );
}
```

### List Knowledge Bases

```javascript
// GET /elevenlabs-knowledge-base
export async function listKnowledgeBases() {
  return callEdgeFunction(
    `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base`
  );
}
```

### Delete Knowledge Base

```javascript
// DELETE /elevenlabs-knowledge-base/{id}
export async function deleteKnowledgeBase(knowledgeBaseId) {
  return callEdgeFunction(
    `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-knowledge-base/${knowledgeBaseId}`,
    {
      method: "DELETE",
    }
  );
}
```

## 🤖 Agent Functions

### Train Agent

```javascript
// POST /agent-trainer
export async function trainAgent(agentId, organizationId, options = {}) {
  return callEdgeFunction(`${EDGE_FUNCTIONS_BASE_URL}/agent-trainer`, {
    method: "POST",
    body: JSON.stringify({
      agent_id: agentId,
      organization_id: organizationId,
      action: "train_agent",
      ...options,
    }),
  });
}
```

### Start Conversation

```javascript
// POST /agent-conversation
export async function startConversation(
  agentId,
  userId,
  organizationId,
  initialMessage = null
) {
  return callEdgeFunction(`${EDGE_FUNCTIONS_BASE_URL}/agent-conversation`, {
    method: "POST",
    body: JSON.stringify({
      action: "start_conversation",
      agent_id: agentId,
      user_id: userId,
      organization_id: organizationId,
      initial_message: initialMessage,
    }),
  });
}
```

### Send Message

```javascript
// POST /agent-conversation
export async function sendMessage(conversationId, message, userId) {
  return callEdgeFunction(`${EDGE_FUNCTIONS_BASE_URL}/agent-conversation`, {
    method: "POST",
    body: JSON.stringify({
      action: "send_message",
      conversation_id: conversationId,
      message,
      user_id: userId,
    }),
  });
}
```

## 🎯 React Hooks

### Use Voices Hook

```javascript
import { useState, useEffect } from "react";

export function useVoices() {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getVoices()
      .then((data) => setVoices(data.voices || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { voices, loading, error };
}
```

### Use Speech Generation Hook

```javascript
export function useSpeechGeneration() {
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const generate = async (text, voiceId, options = {}) => {
    setGenerating(true);
    try {
      const result = await generateSpeech(text, voiceId, options);
      setAudioUrl(result.audio_url);
      return result;
    } finally {
      setGenerating(false);
    }
  };

  return { generate, generating, audioUrl };
}
```

## 📱 React Components

### Voice Selector Component

```javascript
import React from "react";
import { useVoices } from "../utils/voices";

export default function VoiceSelector({ onVoiceSelect, selectedVoiceId }) {
  const { voices, loading, error } = useVoices();

  if (loading) return <div>Loading voices...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <select
      value={selectedVoiceId || ""}
      onChange={(e) => onVoiceSelect(e.target.value)}
      className="w-full p-2 border rounded-md"
    >
      <option value="">Choose a voice</option>
      {voices.map((voice) => (
        <option key={voice.voice_id} value={voice.voice_id}>
          {voice.name} - {voice.description}
        </option>
      ))}
    </select>
  );
}
```

### Speech Generator Component

```javascript
import React, { useState } from "react";
import { useSpeechGeneration } from "../utils/speech";
import VoiceSelector from "./VoiceSelector";

export default function SpeechGenerator() {
  const [text, setText] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const { generate, generating, audioUrl } = useSpeechGeneration();

  const handleGenerate = async () => {
    if (!text || !selectedVoiceId) return;
    await generate(text, selectedVoiceId);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Speech Generator</h2>

      <VoiceSelector
        onVoiceSelect={setSelectedVoiceId}
        selectedVoiceId={selectedVoiceId}
      />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 border rounded-md mt-4"
        rows={4}
        placeholder="Enter text to convert to speech..."
      />

      <button
        onClick={handleGenerate}
        disabled={generating || !text || !selectedVoiceId}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mt-4"
      >
        {generating ? "Generating..." : "Generate Speech"}
      </button>

      {audioUrl && (
        <audio controls className="w-full mt-4">
          <source src={audioUrl} type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
}
```

## 🚀 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📚 Available Endpoints Summary

| Function                      | Endpoint                               | Method | Description               |
| ----------------------------- | -------------------------------------- | ------ | ------------------------- |
| `getVoices`                   | `/elevenlabs-voices`                   | GET    | Get available voices      |
| `generateSpeech`              | `/elevenlabs-generate`                 | POST   | Generate speech from text |
| `testVoice`                   | `/elevenlabs-test-voice`               | POST   | Test a specific voice     |
| `createKnowledgeBaseFromText` | `/elevenlabs-knowledge-base/text`      | POST   | Create KB from text       |
| `createKnowledgeBaseFromUrl`  | `/elevenlabs-knowledge-base/url`       | POST   | Create KB from URL        |
| `addTextToKnowledgeBase`      | `/elevenlabs-knowledge-base/{id}/text` | POST   | Add text to KB            |
| `listKnowledgeBases`          | `/elevenlabs-knowledge-base`           | GET    | List all KBs              |
| `deleteKnowledgeBase`         | `/elevenlabs-knowledge-base/{id}`      | DELETE | Delete KB                 |
| `trainAgent`                  | `/agent-trainer`                       | POST   | Train agent with data     |
| `startConversation`           | `/agent-conversation`                  | POST   | Start agent conversation  |
| `sendMessage`                 | `/agent-conversation`                  | POST   | Send message to agent     |

## 🎯 Usage Example

```javascript
// pages/index.js
import React from "react";
import SpeechGenerator from "../components/SpeechGenerator";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          ElevenLabs Integration Demo
        </h1>

        <div className="max-w-md mx-auto">
          <SpeechGenerator />
        </div>
      </div>
    </div>
  );
}
```

This documentation provides everything needed to integrate with your Supabase Edge Functions! 🎯
