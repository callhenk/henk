import { NextRequest, NextResponse } from 'next/server';

import { Resend } from 'resend';

import { logger } from '~/lib/utils';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders, status: 204 });
}

interface ConversationStartedRequest {
  agent_id: string;
  conversation_id?: string;
  metadata?: {
    timezone?: string;
    locale?: string;
    userAgent?: string;
    timestamp?: string;
    ip?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as ConversationStartedRequest;
    const { agent_id, conversation_id, metadata } = body;

    if (!agent_id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Get IP address from request headers
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'Unknown';

    // Get user agent from request headers
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Check for Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      logger.error('Resend API key not configured', {
        component: 'GrantConversationStarted',
        action: 'sendEmail',
      });
      // Don't fail the request if email can't be sent
      return NextResponse.json(
        {
          success: true,
          message: 'Conversation tracked (email not configured)',
        },
        { headers: corsHeaders },
      );
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Determine recipient email based on environment
    const recipientEmail =
      process.env.NODE_ENV === 'production'
        ? 'jerome+grant@callhenk.com'
        : 'cyrus+grant@callhenk.com';

    // Build metadata HTML
    const timestamp = metadata?.timestamp || new Date().toISOString();
    const metadataHtml = `
      <h3>Connection Details</h3>
      <ul>
        <li><strong>Agent ID:</strong> ${agent_id}</li>
        ${conversation_id ? `<li><strong>Conversation ID:</strong> ${conversation_id}</li>` : ''}
        <li><strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString(
          'en-US',
          {
            dateStyle: 'full',
            timeStyle: 'long',
          },
        )}</li>
      </ul>

      <h3>Location & Browser Info</h3>
      <ul>
        <li><strong>IP Address:</strong> ${metadata?.ip || ip}</li>
        <li><strong>User Agent:</strong> ${metadata?.userAgent || userAgent}</li>
        ${metadata?.timezone ? `<li><strong>Timezone:</strong> ${metadata.timezone}</li>` : ''}
        ${metadata?.locale ? `<li><strong>Locale:</strong> ${metadata.locale}</li>` : ''}
      </ul>

      <h3>Technical Details</h3>
      <ul>
        <li><strong>Referer:</strong> ${request.headers.get('referer') || 'Not available'}</li>
        <li><strong>Origin:</strong> ${request.headers.get('origin') || 'Not available'}</li>
        <li><strong>Accept-Language:</strong> ${request.headers.get('accept-language') || 'Not available'}</li>
      </ul>
    `;

    // Send email notification
    const { error } = await resend.emails.send({
      from: 'Henk Grants <grants@callhenk.com>',
      to: recipientEmail,
      subject: `🎯 New Grant Application Started - ${new Date(timestamp).toLocaleDateString()}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            🎯 New Grant Application Conversation Started
          </h2>

          ${metadataHtml}

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This notification was triggered from the grant application page at ${request.nextUrl.origin}/grants
          </p>
        </div>
      `,
    });

    if (error) {
      logger.error(
        'Failed to send grant conversation notification',
        new Error(error.message),
        {
          component: 'GrantConversationStarted',
          action: 'sendEmail',
          agent_id,
          conversation_id,
        },
      );

      // Don't fail the request if email fails
      return NextResponse.json(
        {
          success: true,
          message: 'Conversation tracked (email failed to send)',
        },
        { headers: corsHeaders },
      );
    }

    logger.info('Grant conversation notification sent successfully', {
      component: 'GrantConversationStarted',
      action: 'sendEmail',
      agent_id,
      conversation_id,
      ip,
    });

    return NextResponse.json(
      { success: true, message: 'Notification sent successfully' },
      { headers: corsHeaders },
    );
  } catch (error) {
    logger.error(
      'Error processing grant conversation notification',
      error instanceof Error ? error : new Error(String(error)),
      {
        component: 'GrantConversationStarted',
        action: 'POST',
      },
    );

    // Don't fail the conversation if notification fails
    return NextResponse.json(
      { success: true, message: 'Conversation tracked (error occurred)' },
      { headers: corsHeaders },
    );
  }
}
