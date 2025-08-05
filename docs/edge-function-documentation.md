# 🎯 Henk Edge Functions - AI Voice Integration

This repository contains Supabase Edge Functions for integrating AI voice synthesis and conversational AI into the Henk fundraising platform. The functions enable AI-powered voice agents for outbound calling campaigns.

## 🚀 **Production Deployment Status**

✅ **All functions deployed to production**  
✅ **Scheduled functions configured**  
✅ **Environment variables set**  
✅ **Ready for frontend integration**

**Production Base URL**: `https://plvxicajcpnnsxosmntd.supabase.co/functions/v1/`

## 📁 Project Structure

```
edge-functions/
├── supabase/functions/
│   ├── voice-synthesis-voices/     # List available voices
│   ├── voice-synthesis-generate/   # Generate speech from text
│   ├── voice-synthesis-test-voice/ # Test voice with sample text
│   ├── campaign-processor/          # Process outbound calling campaigns
│   ├── conversation-processor/      # Process completed conversations
│   └── shared/
│       ├── voice-synthesis-client.ts # AI Voice API client
│       └── storage.ts              # Supabase Storage client
├── deploy.sh                       # Production deployment script
├── test-local.sh                   # Local testing script
├── setup-editor.sh                 # VS Code setup script
├── README.md                       # This documentation
├── PRODUCTION_CHECKLIST.md         # Deployment checklist
└── .gitignore                      # Security patterns
```

## 🎯 **Frontend Integration Guide**

### **Authentication**

All functions require authentication using your Supabase anon key:

```javascript
const SUPABASE_URL = 'https://plvxicajcpnnsxosmntd.supabase.co';
const SUPABASE_ANON_KEY = 'your_anon_key_here';
```

### **Base Configuration**

```javascript
// Frontend configuration
const EDGE_FUNCTIONS_BASE_URL =
  'https://plvxicajcpnnsxosmntd.supabase.co/functions/v1';

// Headers for all requests
const headers = {
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};
```

## 📡 **API Endpoints & Frontend Usage**

### **Voice Management**

#### **1. List Available Voices**

**Endpoint**: `GET /functions/v1/voice-synthesis-voices`

**Frontend Usage**:

```javascript
async function getVoices() {
  try {
    const response = await fetch(
      `${EDGE_FUNCTIONS_BASE_URL}/voice-synthesis-voices`,
      {
        method: 'GET',
        headers,
      },
    );

    const result = await response.json();

    if (result.success) {
      return result.data; // Array of voice objects
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
}

// Usage example
const voices = await getVoices();
console.log('Available voices:', voices);
```

**Response Structure**:

```json
{
  "success": true,
  "data": [
    {
      "voice_id": "21m00Tcm4TlvDq8ikWAM",
      "name": "Rachel",
      "category": "premade",
      "description": "Professional female voice"
    }
  ],
  "count": 1,
  "demo_mode": false
}
```

#### **2. Generate Speech from Text**

**Endpoint**: `POST /functions/v1/voice-synthesis-generate`

**Frontend Usage**:

```javascript
async function generateSpeech(text, voiceId, settings = {}) {
  try {
    const response = await fetch(
      `${EDGE_FUNCTIONS_BASE_URL}/voice-synthesis-generate`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            ...settings,
          },
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      return result.data; // Audio URL and metadata
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

// Usage example
const audioData = await generateSpeech(
  'Hello, this is a test message for our fundraising campaign.',
  '21m00Tcm4TlvDq8ikWAM',
);

console.log('Audio URL:', audioData.audio_url);
console.log('Duration:', audioData.duration_seconds);
```

**Request Structure**:

```json
{
  "text": "Hello, this is a test message.",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75
  }
}
```

**Response Structure**:

```json
{
  "success": true,
  "data": {
    "audio_url": "https://storage.supabase.co/audio/generated_1234567890.mp3",
    "file_size_bytes": 17408,
    "duration_seconds": 2.1,
    "voice_name": "Rachel"
  },
  "demo_mode": false
}
```

#### **3. Test Voice with Sample Text**

**Endpoint**: `POST /functions/v1/voice-synthesis-test-voice`

**Frontend Usage**:

```javascript
async function testVoice(voiceId, sampleText) {
  try {
    const response = await fetch(
      `${EDGE_FUNCTIONS_BASE_URL}/voice-synthesis-test-voice`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          voice_id: voiceId,
          sample_text: sampleText,
        }),
      },
    );

    const result = await response.json();

    if (result.success) {
      return result.data; // Audio URL and metadata
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error testing voice:', error);
    throw error;
  }
}

// Usage example
const testAudio = await testVoice(
  '21m00Tcm4TlvDq8ikWAM',
  "Hello, I'm calling about our fundraising campaign.",
);

// Play the test audio
const audio = new Audio(testAudio.audio_url);
audio.play();
```

**Request Structure**:

```json
{
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "sample_text": "Hello, I'm calling about our fundraising campaign."
}
```

**Response Structure**:

```json
{
  "success": true,
  "data": {
    "audio_url": "https://storage.supabase.co/audio/test_1234567890.mp3",
    "file_size_bytes": 25600,
    "duration_seconds": 3.2,
    "voice_name": "Rachel"
  },
  "demo_mode": false
}
```

### **Campaign Processing (Scheduled Functions)**

#### **4. Campaign Processor** (Automated)

**Endpoint**: `POST /functions/v1/campaign-processor`

**Schedule**: Every 5 minutes during business hours (9 AM - 5 PM, Mon-Fri)

**Frontend Integration**:

```javascript
// This function runs automatically - no frontend calls needed
// It processes active campaigns and initiates calls

// To check campaign status, query your database:
async function getCampaignStatus(campaignId) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  return { data, error };
}
```

#### **5. Conversation Processor** (Automated)

**Endpoint**: `POST /functions/v1/conversation-processor`

**Schedule**: Every 10 minutes

**Frontend Integration**:

```javascript
// This function runs automatically - no frontend calls needed
// It processes completed conversations and updates results

// To get conversation results, query your database:
async function getConversationResults(callLogId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('call_log_id', callLogId)
    .single();

  return { data, error };
}
```

## 🔧 **Complete Frontend Integration Example**

### **React Hook Example**

```javascript
// hooks/useElevenLabs.js
import { useCallback, useState } from 'react';

const EDGE_FUNCTIONS_BASE_URL =
  'https://plvxicajcpnnsxosmntd.supabase.co/functions/v1';
const SUPABASE_ANON_KEY = 'your_anon_key_here';

export function useElevenLabs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = {
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  const getVoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-voices`,
        {
          method: 'GET',
          headers,
        },
      );

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateSpeech = useCallback(async (text, voiceId, settings = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-generate`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            text,
            voice_id: voiceId,
            voice_settings: settings,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const testVoice = useCallback(async (voiceId, sampleText) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-test-voice`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            voice_id: voiceId,
            sample_text: sampleText,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getVoices,
    generateSpeech,
    testVoice,
    loading,
    error,
  };
}
```

### **React Component Example**

```javascript
// components/VoiceTest.jsx
import React, { useEffect, useState } from 'react';

import { useElevenLabs } from '../hooks/useElevenLabs';

export function VoiceTest() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [testText, setTestText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const { getVoices, testVoice, loading, error } = useElevenLabs();

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const voicesData = await getVoices();
      setVoices(voicesData);
      if (voicesData.length > 0) {
        setSelectedVoice(voicesData[0].voice_id);
      }
    } catch (err) {
      console.error('Failed to load voices:', err);
    }
  };

  const handleTestVoice = async () => {
    if (!selectedVoice || !testText) return;

    try {
      const result = await testVoice(selectedVoice, testText);
      setAudioUrl(result.audio_url);
    } catch (err) {
      console.error('Failed to test voice:', err);
    }
  };

  return (
    <div>
      <h2>Voice Testing</h2>

      {error && <div className="error">{error}</div>}

      <div>
        <label>Select Voice:</label>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
        >
          {voices.map((voice) => (
            <option key={voice.voice_id} value={voice.voice_id}>
              {voice.name} - {voice.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Test Text:</label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Enter text to test the voice..."
        />
      </div>

      <button
        onClick={handleTestVoice}
        disabled={loading || !selectedVoice || !testText}
      >
        {loading ? 'Testing...' : 'Test Voice'}
      </button>

      {audioUrl && (
        <div>
          <h3>Test Result:</h3>
          <audio controls src={audioUrl} />
        </div>
      )}
    </div>
  );
}
```

## 🏗 **Architecture Overview**

### **Scheduled Functions**

- **campaign-processor**: Runs every 5 minutes during business hours
  - Processes active campaigns
  - Initiates outbound calls via ElevenLabs
  - Manages lead queue and retry logic

- **conversation-processor**: Runs every 10 minutes
  - Fetches completed conversation results
  - Updates call logs and lead status
  - Maintains campaign statistics

### **Database Integration**

Functions integrate with the following tables:

- `campaigns`: Campaign configuration and status
- `leads`: Lead information and call status
- `call_logs`: Call attempt tracking
- `conversations`: Detailed conversation records
- `agents`: Agent configuration and voice settings

## 🔒 **Security & Error Handling**

### **Error Response Format**

All functions return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

### **Common Error Scenarios**

```javascript
// Handle different error types
try {
  const result = await generateSpeech(text, voiceId);
  // Success case
} catch (error) {
  if (error.message.includes('API key')) {
    // Handle authentication errors
  } else if (error.message.includes('voice_id')) {
    // Handle invalid voice ID
  } else if (error.message.includes('text')) {
    // Handle invalid text input
  } else {
    // Handle general errors
  }
}
```

### **CORS Configuration**

All functions include CORS headers for web application access:

```javascript
// Functions automatically include these headers:
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}
```

## 📊 **Monitoring & Debugging**

### **Function Logs**

Check function logs for debugging:

```bash
# Check specific function logs
supabase functions logs voice-synthesis-voices
supabase functions logs voice-synthesis-generate
supabase functions logs campaign-processor
supabase functions logs conversation-processor
```

### **Demo Mode**

Functions include a `demo_mode` flag in responses when running without proper API keys:

```json
{
  "success": true,
  "data": [...],
  "demo_mode": true
}
```

## 🚀 **Production Status**

### **Deployed Functions**

| Function                     | Status  | Production URL                                                                     |
| ---------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `voice-synthesis-voices`     | ✅ Live | `https://plvxicajcpnnsxosmntd.supabase.co/functions/v1/voice-synthesis-voices`     |
| `voice-synthesis-generate`   | ✅ Live | `https://plvxicajcpnnsxosmntd.supabase.co/functions/v1/voice-synthesis-generate`   |
| `voice-synthesis-test-voice` | ✅ Live | `https://plvxicajcpnnsxosmntd.supabase.co/functions/v1/voice-synthesis-test-voice` |
| `campaign-processor`         | ✅ Live | `https://plvxicajcpnnsxosmntd.supabase.co/functions/v1/campaign-processor`         |
| `conversation-processor`     | ✅ Live | `https://plvxicajcpnnsxosmntd.supabase.co/functions/v1/conversation-processor`     |

### **Scheduled Functions Status**

- ✅ **campaign-processor**: Scheduled every 5 minutes (9 AM - 5 PM, Mon-Fri)
- ✅ **conversation-processor**: Scheduled every 10 minutes

## 📝 **License**

This project is part of the Henk fundraising platform.

---

**Status**: 🟢 **Production Ready & Deployed**

All functions are implemented, tested, deployed, and documented. Ready for frontend integration.
