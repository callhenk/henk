import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const supabase = getSupabaseServerClient();

    let query = supabase.from('campaigns').select('*', { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: campaigns, error, count } = await query;

    if (error) {
      console.error('GET /api/campaigns error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch campaigns',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: campaigns,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/campaigns error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch campaigns',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const supabase = getSupabaseServerClient();

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        name: body.name,
        description: body.description,
        agent_id: body.agent_id,
        calling_hours: body.calling_hours,
        max_attempts: body.max_attempts,
        daily_call_cap: body.daily_call_cap,
        script: body.script,
        retry_logic: body.retry_logic,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('POST /api/campaigns error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create campaign',
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: campaign,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST /api/campaigns error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create campaign',
      },
      { status: 500 },
    );
  }
}
