import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

import type { BusinessContext } from './auth-helpers';
import { requireAuthWithBusiness } from './auth-helpers';
import { ApiError } from './errors';

/**
 * API route handler with authentication context
 */
export type AuthenticatedHandler = (
  request: NextRequest,
  context: BusinessContext,
) => Promise<NextResponse> | NextResponse;

/**
 * Higher-order function that wraps API routes with authentication
 * Automatically handles:
 * - User authentication
 * - Business context retrieval
 * - Error handling and response formatting
 *
 * @example
 * ```typescript
 * export const GET = withAuth(async (request, context) => {
 *   // context.user - authenticated user
 *   // context.business_id - user's business ID
 *   // context.role - user's role in the business
 *
 *   const { data, error } = await supabase
 *     .from('agents')
 *     .select('*')
 *     .eq('business_id', context.business_id);
 *
 *   return NextResponse.json({ success: true, data });
 * });
 * ```
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest) => {
    try {
      const supabase = getSupabaseServerClient();

      // Authenticate and get business context
      const context = await requireAuthWithBusiness(supabase);

      // Call the actual handler with context
      return await handler(request, context);
    } catch (error) {
      // Handle ApiError instances
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: error.code,
          },
          { status: error.statusCode },
        );
      }

      // Handle unexpected errors
      const requestId = request.headers.get('x-correlation-id');
      console.error('API Error:', {
        path: request.nextUrl.pathname,
        method: request.method,
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          requestId,
        },
        { status: 500 },
      );
    }
  };
}
