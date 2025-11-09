import { NextRequest, NextResponse } from 'next/server';

import { Resend } from 'resend';

import featuresFlagConfig from '~/config/feature-flags.config';
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

interface SendDemoInterestRequest {
  email: string;
  name?: string;
  agentName: string;
  useCase: string | null;
  contextPrompt: string;
  metadata?: {
    timezone?: string;
    locale?: string;
    userAgent?: string;
    timestamp?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check if self-onboard demo is enabled
    if (!featuresFlagConfig.enableSelfOnboardDemo) {
      return NextResponse.json(
        { error: 'This feature is currently disabled' },
        { status: 403, headers: corsHeaders },
      );
    }

    // Parse request body
    const body = (await request.json()) as SendDemoInterestRequest;
    const { email, name, agentName, useCase, contextPrompt, metadata } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Check for Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      logger.error('Resend API key not configured', {
        component: 'PublicDemoInterest',
        action: 'sendEmail',
      });
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503, headers: corsHeaders },
      );
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Build browser/location info section
    let metadataHtml = '';
    if (metadata) {
      metadataHtml = `
        <h3>Location & Browser Info</h3>
        <ul>
          ${metadata.timezone ? `<li><strong>Timezone:</strong> ${metadata.timezone}</li>` : ''}
          ${metadata.locale ? `<li><strong>Locale:</strong> ${metadata.locale}</li>` : ''}
          ${metadata.timestamp ? `<li><strong>Timestamp:</strong> ${new Date(metadata.timestamp).toLocaleString()}</li>` : ''}
          ${metadata.userAgent ? `<li><strong>User Agent:</strong> ${metadata.userAgent}</li>` : ''}
        </ul>
      `;
    }

    // Send email to jerome@callhenk.com
    const { error } = await resend.emails.send({
      from: 'Henk Demo <demo@callhenk.com>',
      to: 'jerome+demo-request@callhenk.com',
      replyTo: email.trim(),
      subject: `New Demo Interest${name ? ` from ${name}` : ''}: ${agentName}`,
      html: `
        <h2>New Self-Onboard Demo Interest</h2>
        ${name ? `<p><strong>Name:</strong> ${name}</p>` : ''}
        <p><strong>Email:</strong> ${email.trim()}</p>
        <p><strong>Agent Name:</strong> ${agentName}</p>
        <p><strong>Use Case:</strong> ${useCase || 'Not specified'}</p>

        <h3>Context Prompt Used:</h3>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">${contextPrompt}</pre>

        ${metadataHtml}

        <hr style="margin: 20px 0;" />
        <p style="color: #666; font-size: 14px;">This lead was generated from the self-onboard demo at ${request.nextUrl.origin}/self-onboard-demo</p>
      `,
    });

    if (error) {
      logger.error(
        'Failed to send demo interest email',
        new Error(error.message),
        {
          component: 'PublicDemoInterest',
          action: 'sendEmail',
          email: email.trim(),
        },
      );

      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500, headers: corsHeaders },
      );
    }

    logger.info('Demo interest email sent successfully', {
      component: 'PublicDemoInterest',
      action: 'sendEmail',
      email: email.trim(),
      agentName,
      useCase,
    });

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { headers: corsHeaders },
    );
  } catch (error) {
    logger.error(
      'Error processing demo interest',
      error instanceof Error ? error : new Error(String(error)),
      {
        component: 'PublicDemoInterest',
        action: 'POST',
      },
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders },
    );
  }
}
