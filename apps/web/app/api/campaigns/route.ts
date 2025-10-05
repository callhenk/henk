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
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // 4. Build query with business filter
    let query = supabase
      .from('campaigns')
      .select('*', { count: 'exact' })
      .eq('business_id', teamMember.business_id);

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
    const requestId = request.headers.get('x-correlation-id');
    console.error('API Error:', {
      path: '/api/campaigns',
      method: 'GET',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch campaigns',
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

    // 3. Check user has permission to create campaigns (not just viewer)
    if (teamMember.role === 'viewer') {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions to create campaigns',
        },
        { status: 403 },
      );
    }

    // 4. Parse and create campaign
    const body = await request.json();

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        name: body.name,
        description: body.description,
        agent_id: body.agent_id,
        max_attempts: body.max_attempts,
        daily_call_cap: body.daily_call_cap,
        script: body.script,
        retry_logic: body.retry_logic,
        budget: body.budget,
        start_date: body.start_date,
        end_date: body.end_date,
        // Wizard fields (optional on create)
        goal_metric: body.goal_metric,
        call_window_start: body.call_window_start,
        call_window_end: body.call_window_end,
        // TODO: Add back when multiple Twilio numbers available: caller_id: body.caller_id,
        // TODO: Add back if needed: disclosure_line: body.disclosure_line,
        audience_list_id: body.audience_list_id,
        dedupe_by_phone: body.dedupe_by_phone,
        exclude_dnc: body.exclude_dnc,
        audience_contact_count: body.audience_contact_count,
        status: 'draft',
        business_id: teamMember.business_id,
        created_by: user.id,
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
    const requestId = request.headers.get('x-correlation-id');
    console.error('API Error:', {
      path: '/api/campaigns',
      method: 'POST',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create campaign',
        requestId,
      },
      { status: 500 },
    );
  }
}
