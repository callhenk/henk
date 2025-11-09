# Self-Onboard Demo

The self-onboard demo allows anyone to create and test their own AI voice agents directly through a guided wizard interface. **No authentication or sign-up required!**

## Features

- **Public Access**: No authentication needed - anyone can access and use it
- **Guided Agent Creation**: Step-by-step wizard similar to the main agent creation flow
- **Immediate Testing**: Users can talk with their created agent via web browser
- **Rate Limited**: Protected against abuse with IP-based rate limiting
- **Auto-Cleanup**: Demo agents are automatically deleted after 7 days

## Flow

1. **Agent Type Selection**: Choose from predefined agent templates
2. **Use Case Selection**: Select the primary use case for the agent
3. **Details Configuration**: Set agent name and context/goals
4. **Agent Creation**: Agent is created under a dedicated demo business account
5. **Voice Conversation**: Immediately talk with the created agent via browser

## Usage

Simply access the page:

```
http://localhost:3000/self-onboard-demo
```

Or in production:

```
https://your-domain.com/self-onboard-demo
```

## Rate Limiting

To prevent abuse, the following rate limits are in place:
- **5 agents per hour** per IP address
- **20 agents per day** per IP address
- **100 agents per hour** globally (prevents DDoS)

Rate limits are stored in-memory and reset on server restart.

## Components Used

- `AgentTypesStep`: Agent template selection
- `UseCaseStep`: Use case picker
- `DetailsStep`: Name and context inputs
- `RealtimeVoiceChat`: ElevenLabs web-based voice chat

## Backend API

The demo uses a public API endpoint at `/api/public/create-demo-agent` that:
- Does not require authentication
- Creates ElevenLabs agents only (no database persistence)
- Applies IP-based rate limiting
- Returns agent details including ElevenLabs agent ID

## Setup Requirements

### Environment Variables

Required:
- `ELEVENLABS_API_KEY`: ElevenLabs API key for voice agent creation
- `ELEVENLABS_WORKSPACE_ID` (optional): ElevenLabs workspace ID

## Development

To test locally:

1. Start the development server: `pnpm dev`
2. Visit: `http://localhost:3000/self-onboard-demo`
3. Complete the wizard and test the voice conversation

## Security

- **Rate limiting**: IP-based limits prevent abuse
- **No authentication**: Public access, no sensitive data exposed
- **CORS enabled**: API endpoint allows cross-origin requests
- **No persistence**: Agents are created in ElevenLabs only, not saved to database

## Notes

- Each user session creates an ElevenLabs agent
- Agents are NOT persisted to the database (demo only)
- Voice conversations use ElevenLabs WebRTC for real-time communication
- Users can test the agent immediately after creation
