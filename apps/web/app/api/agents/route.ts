import { NextResponse } from 'next/server';

import { withAuth } from '~/lib/api/with-auth';
import { getSupabaseServerClient } from '~/lib/supabase/server';

export const GET = withAuth(async (request, context) => {
  const supabase = getSupabaseServerClient();

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search');

  // Build query with business filter
  let query = supabase
    .from('agents')
    .select('*', { count: 'exact' })
    .eq('business_id', context.business_id);

  // Apply filters
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data: agents, error, count } = await query;

  if (error) {
    console.error('GET /api/agents error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agents',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: agents,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
});

export const POST = withAuth(async (request, context) => {
  const supabase = getSupabaseServerClient();

  // Check user has permission to create agents (not just viewer)
  if (context.role === 'viewer') {
    return NextResponse.json(
      {
        success: false,
        error: 'Insufficient permissions to create agents',
      },
      { status: 403 },
    );
  }

  // Parse and create agent
  const body = await request.json();

  // Prepare voice settings with ElevenLabs integration
  const voiceSettings = body.voice_settings || {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true,
    // ElevenLabs integration settings
    elevenlabs_enabled: true,
    enable_voice_testing: true,
    fallback_to_simulation: true,
  };

  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      name: body.name,
      description: body.description,
      voice_id: body.voice_id,
      voice_type: body.voice_type || 'ai_generated',
      speaking_tone: body.speaking_tone || 'professional',
      voice_settings: voiceSettings,
      personality: body.personality,
      script_template: body.script_template,
      status: 'active',
      business_id: context.business_id,
      created_by: context.user.id,
      // Additional ElevenLabs fields
      organization_info: body.organization_info,
      donor_context: body.donor_context,
      faqs: body.faqs ? JSON.parse(body.faqs) : null,
    })
    .select()
    .single();

  if (error) {
    console.error('POST /api/agents error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create agent',
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: agent,
    },
    { status: 201 },
  );
});
