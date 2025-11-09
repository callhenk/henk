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
  agentName: string;
  useCase: string | null;
  contextPrompt: string;
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
    const { email, agentName, useCase, contextPrompt } = body;

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

    // Send email to jerome@callhenk.com
    const { error } = await resend.emails.send({
      from: 'Henk Demo <demo@callhenk.com>',
      to: 'jerome@callhenk.com',
      replyTo: email.trim(),
      subject: `New Demo Interest: ${agentName}`,
      html: `
        <h2>New Self-Onboard Demo Interest</h2>
        <p><strong>Client Email:</strong> ${email.trim()}</p>
        <p><strong>Agent Name:</strong> ${agentName}</p>
        <p><strong>Use Case:</strong> ${useCase || 'Not specified'}</p>

        <h3>Context Prompt Used:</h3>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">${contextPrompt}</pre>

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
