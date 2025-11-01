# Voice Settings Implementation

## Overview

Implemented comprehensive voice settings controls for AI agents, allowing fine-tuning of voice characteristics based on the ElevenLabs API parameters.

## Features Implemented

### 1. Voice Settings Component (`agent-voice-settings.tsx`)

New component that provides sliders and controls for:

- **Optimize Streaming Latency** (0-4 scale)
  - Optimizes latency at the cost of quality
  - Range: Best Quality (0) to Lowest Latency (4)
  - Maps to internal latency optimization settings

- **Stability** (0-1 scale, default: 0.5)
  - Controls voice consistency vs. emotional range
  - Higher values: More consistent, potentially monotone
  - Lower values: More expressive with broader emotional range
  - Recommended: 0.4 - 0.6

- **Similarity Boost** (0-1 scale, default: 0.75)
  - Controls how closely AI adheres to original voice
  - Higher values: Better clarity and consistency
  - Very high values may lead to artifacts
  - Recommended: 0.7 - 0.8

- **Style Exaggeration** (0-1 scale, default: 0.0)
  - Amplifies the style of the original speaker
  - Higher values may increase latency
  - Recommended: Keep at 0 unless specific stylization needed

- **Speaker Boost** (Boolean toggle, default: true)
  - Enhances similarity to original speaker
  - Requires higher computational load (increased latency)
  - Recommended: Keep enabled unless latency is critical

### 2. Integration with Agent Detail Page

- Added `AgentVoiceSettings` component to the voice tab
- Positioned at the top of the voice configuration section
- Automatically saves settings to database
- Syncs with ElevenLabs conversational AI agents

### 3. Database Integration

- Voice settings stored in `agents.voice_settings` column (JSONB)
- Structure:
  ```typescript
  {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
    optimize_streaming_latency: number;
  }
  ```

### 4. ElevenLabs API Integration

- Updated `handleConfirmVoiceUpdate` to support voice_settings
- Updated `handleVoiceUpdate` to handle both voice_id and voice_settings changes
- Confirmation dialog shows appropriate message based on update type
- Syncs settings with ElevenLabs conversational AI agents via API

## Technical Details

### Components Modified

1. **apps/web/app/home/agents/[id]/_components/agent-voice-settings.tsx** (NEW)
   - Self-contained voice settings component
   - Tooltips explain each setting
   - Real-time updates with confirmation for ElevenLabs agents

2. **apps/web/app/home/agents/[id]/_components/agent-voice.tsx**
   - Added AgentVoiceSettings import and integration
   - Updated interface to include voice_settings
   - Updated type signatures for onSaveField and onVoiceUpdate

3. **apps/web/app/home/agents/[id]/_components/agent-detail-refactored.tsx**
   - Enhanced handleConfirmVoiceUpdate to support voice_settings
   - Updated handleVoiceUpdate to accept any value type
   - Enhanced confirmation dialog with dynamic messaging
   - Maps voice_settings to ElevenLabs API format

### API Alignment

All parameters align with ElevenLabs Text-to-Speech API:
- https://elevenlabs.io/docs/api-reference/text-to-speech
- https://elevenlabs.io/docs/api-reference/voices/settings

### UI/UX Features

- **Tooltips**: Help icons with detailed explanations for each setting
- **Real-time Feedback**: Current values displayed next to each slider
- **Smart Defaults**: Pre-populated with ElevenLabs recommended values
- **Helpful Tips**: Blue info box with best practices
- **Confirmation Dialog**: For ElevenLabs agents, shows confirmation before syncing

## Usage

### For Regular Agents
Settings save immediately to the database when adjusted.

### For ElevenLabs Conversational AI Agents
1. Adjust settings using the sliders
2. Confirmation dialog appears
3. Click "Update Settings" to confirm
4. Settings sync to both local database and ElevenLabs API

## Default Values

```typescript
{
  stability: 0.5,              // Balanced consistency/emotion
  similarity_boost: 0.75,      // High clarity
  style: 0.0,                  // No style exaggeration
  use_speaker_boost: true,     // Enhanced similarity
  optimize_streaming_latency: 0 // Best quality
}
```

## Future Enhancements

- [ ] Voice settings presets (e.g., "Professional", "Conversational", "Dramatic")
- [ ] A/B testing different settings
- [ ] Voice settings templates per campaign type
- [ ] Real-time voice preview with different settings
- [ ] Analytics on which settings perform best

## Testing

Test the voice settings by:
1. Navigate to an agent detail page
2. Go to the "Voice" tab
3. Adjust the voice settings sliders
4. For ElevenLabs agents, confirm the update
5. Test the agent with voice chat to hear differences

## References

- [ElevenLabs Voice Settings Documentation](https://docs.elevenlabs.io/speech-synthesis/voice-settings)
- [ElevenLabs API Reference](https://elevenlabs.io/docs/api-reference/voices/settings)
- Database schema: `apps/web/supabase/migrations/` (agents table)
