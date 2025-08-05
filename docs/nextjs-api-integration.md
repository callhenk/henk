# Next.js API Integration with Edge Functions

This document outlines the complete Next.js API integration with the deployed Supabase Edge Functions for AI voice synthesis and campaign management.

## 🏗 Architecture Overview

The integration follows a **proxy pattern** where Next.js API routes act as a bridge between the frontend and the deployed edge functions:

```
Frontend → Next.js API Routes → Supabase Edge Functions → AI Voice API
```

### **Benefits of This Architecture:**

- **Security**: API keys are stored in Supabase environment variables
- **Performance**: Edge functions provide global distribution
- **Type Safety**: Full TypeScript support in Next.js API routes
- **Error Handling**: Centralized error handling and response formatting
- **Authentication**: Easy integration with existing auth system

## 📡 API Endpoints

### **Voice Management APIs**

#### **1. List Available Voices**

**Endpoint**: `GET /api/voice/voices`

**Description**: Fetches available AI voices from the edge function

**Response**:

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

#### **2. Test Voice Generation**

**Endpoint**: `POST /api/voice/test`

**Request Body**:

```json
{
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "sample_text": "Hello, this is a test message."
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "testId": "test_1234567890",
    "voice_id": "21m00Tcm4TlvDq8ikWAM",
    "sample_text": "Hello, this is a test message.",
    "audio_url": "https://storage.supabase.co/audio/test_1234567890.mp3",
    "duration_seconds": 2.1,
    "file_size_bytes": 17408,
    "voice_name": "Rachel",
    "status": "completed",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "demo_mode": false
}
```

#### **3. Generate Speech**

**Endpoint**: `POST /api/voice/generate`

**Request Body**:

```json
{
  "text": "Hello, this is a fundraising message.",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "audio_url": "https://storage.supabase.co/audio/generated_1234567890.mp3",
    "file_size_bytes": 25600,
    "duration_seconds": 3.2,
    "voice_name": "Rachel"
  },
  "demo_mode": false
}
```

### **Campaign Management APIs**

#### **1. List Campaigns**

**Endpoint**: `GET /api/campaigns`

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `search` (optional): Search by name

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "campaign_123",
      "name": "Spring Fundraising Campaign",
      "status": "active",
      "agent_id": "agent_456",
      "calling_hours": "9 AM - 5 PM",
      "max_attempts": 3,
      "daily_call_cap": 100,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### **2. Get Campaign Details**

**Endpoint**: `GET /api/campaigns/{id}`

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "campaign_123",
    "name": "Spring Fundraising Campaign",
    "description": "Annual spring fundraising drive",
    "status": "active",
    "agent_id": "agent_456",
    "calling_hours": "9 AM - 5 PM",
    "max_attempts": 3,
    "daily_call_cap": 100,
    "script": "Hello, I'm calling about our spring campaign...",
    "retry_logic": "Wait 2 hours between attempts",
    "started_at": "2024-01-15T10:30:00.000Z",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### **3. Create Campaign**

**Endpoint**: `POST /api/campaigns`

**Request Body**:

```json
{
  "name": "New Fundraising Campaign",
  "description": "Campaign description",
  "agent_id": "agent_456",
  "calling_hours": "9 AM - 5 PM",
  "max_attempts": 3,
  "daily_call_cap": 100,
  "script": "Hello, I'm calling about our campaign...",
  "retry_logic": "Wait 2 hours between attempts"
}
```

#### **4. Start Campaign**

**Endpoint**: `POST /api/campaigns/{id}/start`

**Description**: Activates a campaign and triggers the scheduled edge function

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "campaign_123",
    "status": "active",
    "started_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "Campaign started successfully. The system will begin processing calls automatically."
}
```

#### **5. Stop Campaign**

**Endpoint**: `POST /api/campaigns/{id}/stop`

**Description**: Pauses a campaign to stop new call processing

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "campaign_123",
    "status": "paused",
    "stopped_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "Campaign stopped successfully. No new calls will be initiated."
}
```

### **Agent Management APIs**

#### **1. List Agents**

**Endpoint**: `GET /api/agents`

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name

#### **2. Create Agent**

**Endpoint**: `POST /api/agents`

**Request Body**:

```json
{
  "name": "Fundraising Agent",
  "description": "Professional fundraising agent",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75
  },
  "personality": "Warm and professional",
  "script_template": "Hello, I'm calling about our campaign..."
}
```

## 🎣 React Hooks

### **Voice Management Hooks**

```typescript
import {
  useGenerateSpeechMutation,
  useVoiceTestMutation,
  useVoices,
} from '@henk/supabase/hooks';

// Fetch available voices
const { data: voices, isLoading, error } = useVoices();

// Test voice generation
const voiceTestMutation = useVoiceTestMutation();
const result = await voiceTestMutation.mutateAsync({
  voice_id: '21m00Tcm4TlvDq8ikWAM',
  sample_text: 'Hello, this is a test.',
});

// Generate speech
const generateSpeechMutation = useGenerateSpeechMutation();
const audioData = await generateSpeechMutation.mutateAsync({
  text: 'Hello, this is a fundraising message.',
  voice_id: '21m00Tcm4TlvDq8ikWAM',
  voice_settings: {
    stability: 0.5,
    similarity_boost: 0.75,
  },
});
```

### **Campaign Management Hooks**

```typescript
import { useAgent, useAgents } from '@henk/supabase/hooks';

// Fetch agents
const { data: agents, isLoading } = useAgents();

// Fetch single agent
const { data: agent } = useAgent('agent_id');
```

## 🎨 Example Components

### **Voice Testing Component**

```tsx
import { VoiceTestComponent } from '~/app/home/agents/_components/voice-test-component';

// Usage in your page
<VoiceTestComponent />;
```

**Features**:

- Voice selection dropdown
- Text input for testing
- Audio playback
- Error handling and loading states
- Toast notifications

### **Campaign Controls Component**

```tsx
import { CampaignControls } from '~/app/home/campaigns/_components/campaign-controls';

// Usage in your campaign detail page
<CampaignControls
  campaignId="campaign_123"
  campaignStatus="active"
  onStatusChange={(newStatus) => {
    // Handle status change
  }}
/>;
```

**Features**:

- Start/Stop campaign buttons
- Status display with color coding
- Loading states
- Error handling with toast notifications

## 🔧 Environment Configuration

### **Required Environment Variables**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI Voice Configuration
VOICE_SYNTHESIS_API_KEY=your_voice_synthesis_api_key_here
```

### **Edge Function Base URL**

The API routes automatically construct the edge function base URL:

```typescript
const EDGE_FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1';
```

## 🔒 Security & Error Handling

### **Authentication**

All API routes use the Supabase service role key for edge function calls:

```typescript
headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
}
```

### **Error Response Format**

All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

### **Common Error Scenarios**

- **401 Unauthorized**: Invalid or missing API keys
- **400 Bad Request**: Missing required fields or invalid data
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side processing error

## 🚀 Deployment Checklist

### **Pre-Deployment**

- [ ] Set all required environment variables
- [ ] Verify edge functions are deployed and accessible
- [ ] Test API routes locally
- [ ] Verify database schema matches API expectations

### **Post-Deployment**

- [ ] Test voice generation functionality
- [ ] Test campaign start/stop operations
- [ ] Verify error handling works correctly
- [ ] Monitor edge function logs for any issues

## 📊 Monitoring & Debugging

### **API Route Logs**

Check Next.js API route logs for debugging:

```bash
# Development logs
npm run dev

# Production logs (if using Vercel)
vercel logs
```

### **Edge Function Logs**

Check edge function logs for external API issues:

```bash
supabase functions logs voice-synthesis-voices
supabase functions logs voice-synthesis-generate
supabase functions logs campaign-processor
```

### **Common Issues & Solutions**

#### **1. Edge Function Connection Issues**

**Symptoms**: 500 errors from API routes
**Solution**: Verify edge function URLs and authentication

#### **2. Voice Generation Failures**

**Symptoms**: Voice test/generation returns errors
**Solution**: Check AI voice API key and quota

#### **3. Campaign Status Issues**

**Symptoms**: Campaigns not starting/stopping
**Solution**: Verify database permissions and schema

## 🎯 Integration Benefits

### **✅ Simplified Development**

- **Type Safety**: Full TypeScript support
- **Error Handling**: Centralized error management
- **Testing**: Easy to test individual components
- **Debugging**: Clear error messages and logging

### **✅ Production Ready**

- **Security**: API keys properly secured
- **Performance**: Edge function distribution
- **Reliability**: Built-in error handling and retries
- **Scalability**: Automatic scaling with demand

### **✅ User Experience**

- **Real-time Feedback**: Loading states and toast notifications
- **Error Recovery**: Graceful error handling
- **Intuitive Controls**: Clear start/stop buttons
- **Audio Playback**: Built-in audio testing

This integration provides a complete, production-ready solution for voice synthesis and campaign management with excellent developer and user experience.
