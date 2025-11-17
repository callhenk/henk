import { NextRequest, NextResponse } from 'next/server';

import crypto from 'crypto';

import { withAuth } from '~/lib/api/with-auth';

// Twilio AccessToken generation for Voice SDK
// This endpoint is protected and only accessible to authenticated users from callhenk.com

interface TwilioConfig {
  accountSid: string;
  apiKeySid: string;
  apiKeySecret: string;
  appSid: string;
  pushCredentialSid?: string;
  callerId: string;
}

interface AuthContext {
  user: { id: string; email?: string };
  business_id: string;
}

/**
 * Generate a Twilio Access Token for the Voice SDK
 * This token allows the client to make and receive calls
 */
export const POST = withAuth(
  async (request: NextRequest, context: AuthContext) => {
    try {
      // Check if user has permission (must be @callhenk.com email)
      // This check is done in the API level to ensure security
      // The page-level check handles the UI access
      const userEmail = context.user.email;
      if (!userEmail || !userEmail.endsWith('@callhenk.com')) {
        return NextResponse.json(
          {
            error:
              'Unauthorized. This service is only available to callhenk.com users.',
          },
          { status: 403 },
        );
      }

      // Get Twilio configuration from environment variables
      const twilioConfig: TwilioConfig = {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        apiKeySid: process.env.TWILIO_API_KEY_SID || '',
        apiKeySecret: process.env.TWILIO_API_KEY_SECRET || '',
        appSid: process.env.TWILIO_TWIML_APP_SID || '',
        pushCredentialSid: process.env.TWILIO_PUSH_CREDENTIAL_SID,
        callerId: process.env.TWILIO_PHONE_NUMBER || '',
      };

      // Validate required configuration
      if (
        !twilioConfig.accountSid ||
        !twilioConfig.apiKeySid ||
        !twilioConfig.apiKeySecret ||
        !twilioConfig.appSid
      ) {
        console.error('Missing Twilio configuration');
        return NextResponse.json(
          { error: 'Twilio service is not configured properly' },
          { status: 500 },
        );
      }

      // Create identity for the user
      const identity = `user_${context.user.id}_${context.business_id}`;

      // Create Voice grant
      const VoiceGrant: Record<string, unknown> = {
        outgoing_application_sid: twilioConfig.appSid,
        incoming: {
          allow: true,
        },
      };

      // Add push credentials if configured (for mobile apps)
      if (twilioConfig.pushCredentialSid) {
        VoiceGrant.push_credential_sid = twilioConfig.pushCredentialSid;
      }

      // Token will be valid for 1 hour (3600 seconds)
      const now = Math.floor(Date.now() / 1000);
      const exp = now + 3600;

      // Create the access token payload
      const payload = {
        jti: `${twilioConfig.apiKeySid}-${now}`,
        iss: twilioConfig.apiKeySid,
        sub: twilioConfig.accountSid,
        nbf: now,
        exp: exp,
        grants: {
          identity: identity,
          voice: VoiceGrant,
        },
      };

      // Sign the token with custom header
      const header = Buffer.from(
        JSON.stringify({
          alg: 'HS256',
          typ: 'JWT',
          cty: 'twilio-fpa;v=1',
        }),
      ).toString('base64url');

      const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const message = `${header}.${body}`;

      const signature = crypto
        .createHmac('sha256', twilioConfig.apiKeySecret)
        .update(message)
        .digest('base64url');

      const token = `${message}.${signature}`;

      // Return the token and configuration
      return NextResponse.json({
        success: true,
        data: {
          token,
          identity,
          callerId: twilioConfig.callerId,
          expiresAt: new Date(exp * 1000).toISOString(),
        },
      });
    } catch (error) {
      console.error('Error generating Twilio token:', error);
      return NextResponse.json(
        { error: 'Failed to generate voice token' },
        { status: 500 },
      );
    }
  },
);

// OPTIONS handler for CORS preflight
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin':
        process.env.NODE_ENV === 'production' ? 'https://callhenk.com' : '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
