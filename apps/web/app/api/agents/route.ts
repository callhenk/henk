import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const supabase = getSupabaseServerClient();

    let query = supabase.from('agents').select('*', { count: 'exact' });

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
    console.error('GET /api/agents error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agents',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const supabase = getSupabaseServerClient();

    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        name: body.name,
        description: body.description,
        voice_id: body.voice_id,
        voice_type: body.voice_type || 'ai_generated',
        speaking_tone: body.speaking_tone || 'professional',
        voice_settings: body.voice_settings || {
          stability: 0.5,
          similarity_boost: 0.75,
        },
        personality: body.personality,
        script_template: body.script_template,
        status: 'active',
        business_id: body.business_id || 'default-business-id', // You'll need to get this from auth context
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
    console.error('POST /api/agents error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create agent',
      },
      { status: 500 },
    );
  }
}
