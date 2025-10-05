import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 2. Get user's business context
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('business_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json(
        { success: false, error: 'No active business membership found' },
        { status: 403 },
      );
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // 4. Build query with business filter
    let query = supabase
      .from('agents')
      .select('*', { count: 'exact' })
      .eq('business_id', teamMember.business_id);

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
  } catch (error) {
    const requestId = request.headers.get('x-correlation-id');
    console.error('API Error:', {
      path: '/api/agents',
      method: 'GET',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agents',
        requestId,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 2. Get user's business context
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('business_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json(
        { success: false, error: 'No active business membership found' },
        { status: 403 },
      );
    }

    // 3. Check user has permission to create agents (not just viewer)
    if (teamMember.role === 'viewer') {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions to create agents',
        },
        { status: 403 },
      );
    }

    // 4. Parse and create agent
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
        business_id: teamMember.business_id,
        created_by: user.id,
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
  } catch (error) {
    const requestId = request.headers.get('x-correlation-id');
    console.error('API Error:', {
      path: '/api/agents',
      method: 'POST',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create agent',
        requestId,
      },
      { status: 500 },
    );
  }
}
