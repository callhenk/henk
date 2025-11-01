# ElevenLabs Integration Setup Guide

## Overview

This guide explains how to set up real ElevenLabs voice conversations for agent testing. Currently, the system uses simulated conversations, but this guide will help you enable real voice conversations.

## Current Status

### ✅ What's Working

- ElevenLabs React SDK installed
- Voice testing UI implemented
- Simulated conversations working
- API endpoints created
- Environment configuration ready

### ⚠️ What Needs Setup

- ElevenLabs agent creation
- Voice ID configuration
- Real conversation integration

## Step-by-Step Setup

### 1. Get ElevenLabs API Key

1. Go to [ElevenLabs Console](https://elevenlabs.io/)
2. Create an account or sign in
3. Navigate to your profile settings
4. Copy your API key
5. Add it to your `.env.local`:

```bash
ELEVENLABS_API_KEY=your_actual_api_key_here
```

### 2. Create ElevenLabs Agent

#### Option A: Using ElevenLabs Console

1. Go to [ElevenLabs Console](https://elevenlabs.io/)
2. Navigate to "Conversational AI" section
3. Click "Create New Agent"
4. Configure your agent:
   - **Name**: Your agent name (e.g., "Fundraising Agent")
   - **Voice**: Select a voice from ElevenLabs library
   - **Personality**: Add your agent's personality and context
   - **Knowledge Base**: Upload relevant documents
   - **Conversation Starters**: Add initial prompts

#### Option B: Using ElevenLabs API

```bash
curl -X POST "https://api.elevenlabs.io/v1/convai/agent" \
  -H "xi-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fundraising Agent",
    "description": "AI agent for fundraising calls",
    "voice_id": "your_voice_id",
    "personality": "Professional and empathetic fundraising agent",
    "conversation_starters": [
      "Hello, I'm calling from [Organization Name]. How are you today?"
    ]
  }'
```

### 3. Update Agent Configuration

Once you have an ElevenLabs agent ID, update your agent in the database:

```sql
UPDATE agents
SET voice_id = 'your_elevenlabs_voice_id',
    voice_settings = '{"elevenlabs_agent_id": "your_agent_id"}'
WHERE id = 'your_agent_id';
```

### 4. Update API Integration

Modify the agent conversation API to use the ElevenLabs agent:

```typescript
// In apps/web/app/api/agent-conversation/route.ts

// Get ElevenLabs agent ID from agent settings
const elevenLabsAgentId = agent.voice_settings?.elevenlabs_agent_id;

if (elevenLabsAgentId) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${elevenLabsAgentId}`,
    {
      method: 'GET',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
    },
  );

  if (response.ok) {
    const data = await response.json();
    signedUrl = data.signed_url;
  }
}
```

### 5. Update Voice Testing Component

Modify the voice testing component to use real ElevenLabs conversations:

```typescript
// In voice-testing.tsx

const startVoiceConversation = async () => {
  try {
    // Get signed URL from our API
    const response = await fetch('/api/agent-conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start_conversation',
        agent_id: agentId,
        conversation_type: 'voice',
      }),
    });

    const result = await response.json();

    if (result.data.signed_url) {
      // Start real ElevenLabs conversation
      const sessionId = await conversation.startSession({
        signedUrl: result.data.signed_url,
        connectionType: 'webrtc',
      });

      setIsRecording(true);
      toast.success('Real voice conversation started');
    } else {
      // Fallback to simulated conversation
      setIsRecording(true);
      toast.success('Voice conversation started (simulated)');
    }
  } catch (error) {
    console.error('Voice conversation error:', error);
    toast.error('Failed to start voice conversation');
  }
};
```

## Testing the Integration

### 1. Test API Connection

```bash
curl http://localhost:3000/api/test-elevenlabs
```

Expected response:

```json
{
  "success": true,
  "message": "ElevenLabs integration working",
  "voices_count": 123
}
```

### 2. Test Voice Conversation

1. Navigate to an agent detail page
2. Click on the "Testing" tab
3. Click "Connect Microphone"
4. Click "Start Voice Test"
5. Speak into your microphone
6. Listen for the agent's response

### 3. Monitor Console

Check the browser console for:

- Connection status
- Error messages
- API responses

## Troubleshooting

### Common Issues

#### 1. "Invalid agent ID" Error

**Cause**: Using database agent ID instead of ElevenLabs agent ID
**Solution**: Create an ElevenLabs agent and use its ID

#### 2. "API key not configured" Error

**Cause**: Missing or invalid API key
**Solution**: Add correct API key to `.env.local`

#### 3. Microphone Access Denied

**Cause**: Browser blocking microphone access
**Solution**: Allow microphone permissions in browser

#### 4. No Voice Response

**Cause**: Agent not properly configured
**Solution**: Check agent voice settings and ElevenLabs agent configuration

### Debug Steps

1. **Check API Key**: Verify `ELEVENLABS_API_KEY` is set correctly
2. **Test API**: Use `/api/test-elevenlabs` to verify connection
3. **Check Agent**: Ensure agent has valid voice_id and voice_settings
4. **Monitor Network**: Check browser network tab for API calls
5. **Check Console**: Look for error messages in browser console

## Advanced Configuration

### Custom Voice Settings

```typescript
// In agent voice settings
{
  "voice_id": "elevenlabs_voice_id",
  "stability": 0.5,
  "similarity_boost": 0.75,
  "elevenlabs_agent_id": "your_agent_id"
}
```

### Conversation Customization

```typescript
// Custom conversation parameters
const sessionConfig = {
  signedUrl: result.data.signed_url,
  connectionType: 'webrtc',
  userId: user.id,
  customSettings: {
    language: 'en',
    accent: 'us',
    speed: 1.0,
  },
};
```

## Performance Optimization

### 1. Voice Caching

- Cache generated audio files
- Use signed URLs for secure access
- Implement audio compression

### 2. Connection Management

- Implement connection pooling
- Add retry logic for failed connections
- Monitor connection health

### 3. Error Handling

- Graceful fallback to simulated conversations
- User-friendly error messages
- Automatic retry mechanisms

## Security Considerations

### 1. API Key Security

- Store API keys in environment variables
- Never expose keys in client-side code
- Use secure key rotation

### 2. User Privacy

- Implement audio data encryption
- Add user consent for voice recording
- Follow GDPR compliance

### 3. Access Control

- Verify user permissions before starting conversations
- Implement rate limiting
- Monitor usage patterns

## Next Steps

1. **Set up ElevenLabs account** and get API key
2. **Create ElevenLabs agents** for your agents
3. **Update agent configurations** with ElevenLabs IDs
4. **Test the integration** with real voice conversations
5. **Monitor performance** and optimize as needed

## Support

If you encounter issues:

1. Check the ElevenLabs documentation
2. Review browser console for errors
3. Test API endpoints individually
4. Verify environment configuration
5. Contact support if needed

---

**Current Status**: ✅ **Ready for Real Integration** - Follow this guide to enable actual voice conversations!
