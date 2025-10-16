import { NextRequest, NextResponse } from 'next/server';

import { createDemoToken } from '~/lib/demo-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, allowedAgentIds, demoName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const token = createDemoToken({
      email,
      password,
      allowedAgentIds:
        allowedAgentIds && allowedAgentIds.length > 0
          ? allowedAgentIds
          : undefined,
      demoName: demoName || undefined,
    });
    const demoUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/demo?token=${token}`;

    return NextResponse.json({
      success: true,
      token,
      url: demoUrl,
      demoName: demoName || null,
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate token' },
      { status: 500 },
    );
  }
}
