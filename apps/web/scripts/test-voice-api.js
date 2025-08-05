#!/usr/bin/env node

/**
 * Test script for AI voice API integration
 * Run with: node scripts/test-voice-api.js
 */

const BASE_URL = 'http://localhost:3000';

async function testVoiceAPI() {
  console.log('🧪 Testing AI Voice API Integration...\n');

  try {
    // Test 1: Get available voices
    console.log('1. Testing GET /api/voice/voices...');
    const voicesResponse = await fetch(`${BASE_URL}/api/voice/voices`);
    const voicesData = await voicesResponse.json();

    if (voicesData.success) {
      console.log('✅ Voices API working');
      console.log(`   Found ${voicesData.data?.length || 0} voices`);
      if (voicesData.data?.length > 0) {
        console.log(`   First voice: ${voicesData.data[0].name}`);
      }
    } else {
      console.log('❌ Voices API failed:', voicesData.error);
    }

    // Test 2: Test voice generation (if we have voices)
    if (voicesData.success && voicesData.data?.length > 0) {
      const firstVoice = voicesData.data[0];
      console.log('\n2. Testing POST /api/voice/test...');

      const testResponse = await fetch(`${BASE_URL}/api/voice/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voice_id: firstVoice.voice_id,
          sample_text: 'Hello, this is a test of the AI voice integration.',
        }),
      });

      const testData = await testResponse.json();

      if (testData.success) {
        console.log('✅ Voice test API working');
        console.log(`   Generated audio: ${testData.data.audio_url}`);
        console.log(`   Duration: ${testData.data.duration_seconds}s`);
      } else {
        console.log('❌ Voice test API failed:', testData.error);
      }
    }

    // Test 3: Test campaign API
    console.log('\n3. Testing GET /api/campaigns...');
    const campaignsResponse = await fetch(`${BASE_URL}/api/campaigns`);
    const campaignsData = await campaignsResponse.json();

    if (campaignsData.success) {
      console.log('✅ Campaigns API working');
      console.log(`   Found ${campaignsData.data?.length || 0} campaigns`);
    } else {
      console.log('❌ Campaigns API failed:', campaignsData.error);
    }

    // Test 4: Test agents API
    console.log('\n4. Testing GET /api/agents...');
    const agentsResponse = await fetch(`${BASE_URL}/api/agents`);
    const agentsData = await agentsResponse.json();

    if (agentsData.success) {
      console.log('✅ Agents API working');
      console.log(`   Found ${agentsData.data?.length || 0} agents`);
    } else {
      console.log('❌ Agents API failed:', agentsData.error);
    }

    console.log('\n🎉 AI Voice API integration test completed!');
  } catch (error) {
    console.error(
      '❌ Test failed with error:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    console.log('\n💡 Make sure your development server is running:');
    console.log('   npm run dev');
  }
}

// Run the test
testVoiceAPI();
