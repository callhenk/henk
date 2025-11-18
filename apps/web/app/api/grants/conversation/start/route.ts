import { NextRequest, NextResponse } from 'next/server';

import { getCorsHeaders } from '~/lib/cors';

/**
 * Grant Conversation Start Endpoint
 *
 * STATUS: Currently not being used by the frontend (commented out)
 *
 * This endpoint was created to validate agent access before starting conversations,
 * but is currently disabled because it only passes through the agent_id without
 * any actual validation, authentication, or database operations.
 *
 * FUTURE USE CASES:
 * - Log/track grant application conversation starts
 * - Validate agent_id against a whitelist
 * - Implement rate limiting
 * - Add user authentication/authorization
 * - Store conversation metadata in database
 * - Generate analytics/metrics
 *
 * To re-enable: Uncomment the validation logic in henk-main-page/src/components/GrantChat.tsx
 */

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    // Parse request body
    const body = await request.json();
    const { agent_id } = body;

    if (!agent_id) {
      return NextResponse.json(
        { success: false, error: 'agent_id is required' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Simply return the agent_id
    // The ElevenLabs widget will handle creating the conversation
    return NextResponse.json(
      {
        success: true,
        agent_id: agent_id,
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error starting grant conversation:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to start conversation',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
