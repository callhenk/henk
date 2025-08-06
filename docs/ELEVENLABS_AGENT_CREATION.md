# ElevenLabs Agent Creation Integration

## 🎯 Overview

This guide explains how to create agents with ElevenLabs voice integration enabled. The system now supports real-time voice conversations and simulated fallbacks.

## 🚀 Quick Start

### 1. Create Agent with ElevenLabs Integration

When creating an agent, you can now include ElevenLabs configuration:

```javascript
// Example agent creation with ElevenLabs integration
const agentData = {
  name: 'Fundraising Agent',
  description: 'AI agent for fundraising calls',
  voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
  voice_type: 'ai_generated',

  // Voice settings with ElevenLabs integration
  voice_settings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true,
    // ElevenLabs integration settings
    elevenlabs_enabled: true,
    enable_voice_testing: true,
    fallback_to_simulation: true,
  },

  // Agent context
  organization_info: 'Red Cross - helping families in need',
  donor_context: 'Focus on $25-$100 donations for emergency relief',
  faqs: JSON.stringify([
    {
      question: 'How can I donate?',
      answer: 'You can donate online, by phone, or by mail.',
    },
    {
      question: 'Where does my donation go?',
      answer: '100% goes directly to helping families in need.',
    },
  ]),
};

// Create the agent
const response = await fetch('/api/agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(agentData),
});
```

### 2. Voice Settings Configuration

The agent creation API now supports these ElevenLabs-specific fields:

| Field                                   | Type    | Default | Description                                |
| --------------------------------------- | ------- | ------- | ------------------------------------------ |
| `voice_settings.stability`              | number  | `0.5`   | Voice consistency (0.0-1.0)                |
| `voice_settings.similarity_boost`       | number  | `0.75`  | Voice similarity to original (0.0-1.0)     |
| `voice_settings.style`                  | number  | `0.0`   | Voice style (0.0-1.0)                      |
| `voice_settings.use_speaker_boost`      | boolean | `true`  | Enhance speaker clarity                    |
| `voice_settings.elevenlabs_enabled`     | boolean | `true`  | Enable ElevenLabs voice integration        |
| `voice_settings.enable_voice_testing`   | boolean | `true`  | Allow voice testing in agent detail page   |
| `voice_settings.fallback_to_simulation` | boolean | `true`  | Use simulation when ElevenLabs unavailable |

### 3. Testing Voice Conversations

Once an agent is created with ElevenLabs integration:

1. **Navigate to Agent Detail Page**
2. **Click on "Testing" Tab**
3. **Click "Connect Microphone"**
4. **Click "Start Voice Test"**
5. **Speak into your microphone**
6. **Listen for the agent's response**

## 🎯 Voice Testing Features

### Real Voice Conversations

- ✅ **Real-time voice conversations** (when ElevenLabs is configured)
- ✅ **Volume control and connection monitoring**
- ✅ **Agent speaking indicators**
- ✅ **Error handling and user feedback**

### Simulated Conversations

- ✅ **Fallback to simulation** when ElevenLabs is unavailable
- ✅ **Realistic agent response indicators**
- ✅ **No external dependencies**

## 🔧 API Integration

### Agent Creation Endpoint

```bash
POST /api/agents
```

**Request Body:**

```json
{
  "name": "Fundraising Agent",
  "description": "AI agent for fundraising calls",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "voice_type": "ai_generated",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true,
    "elevenlabs_enabled": true,
    "enable_voice_testing": true,
    "fallback_to_simulation": true
  },
  "organization_info": "Red Cross - helping families in need",
  "donor_context": "Focus on $25-$100 donations for emergency relief",
  "faqs": "[{\"question\":\"How can I donate?\",\"answer\":\"You can donate online, by phone, or by mail.\"}]"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "agent_123",
    "name": "Fundraising Agent",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.75,
      "style": 0.0,
      "use_speaker_boost": true,
      "elevenlabs_enabled": true,
      "enable_voice_testing": true,
      "fallback_to_simulation": true
    }
  }
}
```

## 🎯 Voice Testing Flow

### 1. Agent Detail Page

- Navigate to `/home/agents/[id]`
- Click on the "Testing" tab
- See ElevenLabs integration status

### 2. Voice Testing Interface

- **Connect Microphone**: Request microphone permissions
- **Start Voice Test**: Begin voice conversation
- **Agent Speaking**: Visual indicators when agent is responding
- **Volume Control**: Adjust audio levels
- **Connection Status**: Monitor ElevenLabs connection

### 3. Conversation Flow

1. **User speaks** → Audio captured via microphone
2. **Agent processes** → Text-to-speech or AI response
3. **Agent responds** → Voice synthesis via ElevenLabs
4. **User hears** → Real-time audio playback

## 🔧 Configuration Options

### Voice Settings

```javascript
const voiceSettings = {
  stability: 0.5, // 0.0 = variable, 1.0 = stable
  similarity_boost: 0.75, // 0.0 = different, 1.0 = similar
  style: 0.0, // Voice style (0.0-1.0)
  use_speaker_boost: true, // Enhance speaker clarity
};
```

### ElevenLabs Integration

```javascript
const elevenLabsConfig = {
  enabled: true, // Enable voice integration
  enable_voice_testing: true, // Allow voice testing
  fallback_to_simulation: true, // Use simulation as fallback
  connection_type: 'webrtc', // Connection method
  volume_control: true, // Enable volume control
  real_time_transcription: true, // Show real-time text
};
```

## 🎯 Status Messages

### ElevenLabs Status

- **"ElevenLabs Voice Enabled"** - Real voice conversations available
- **"Using Simulated Voice"** - Fallback to simulation mode
- **"Voice Testing Available"** - Voice testing is enabled
- **"Connection Established"** - ElevenLabs connection active

### Error Handling

- **"Microphone Access Denied"** - Browser permissions needed
- **"ElevenLabs Connection Failed"** - API key or network issue
- **"Voice Generation Error"** - ElevenLabs service issue
- **"Falling Back to Simulation"** - Using simulated conversations

## 🎯 Next Steps

1. **Create your first agent** with ElevenLabs integration
2. **Test voice functionality** from the agent detail page
3. **Configure voice settings** for optimal performance
4. **Monitor conversation quality** and adjust settings
5. **Scale to production** with proper ElevenLabs setup

This integration provides a complete voice testing solution with real-time conversations and reliable fallbacks! 🎯
