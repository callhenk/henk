import { NextRequest, NextResponse } from 'next/server';

/**
 * TwiML endpoint for handling outgoing calls
 * This generates the TwiML instructions for Twilio to execute when making calls
 * Twilio sends form-encoded data, not JSON
 */
export async function POST(request: NextRequest) {
  try {
    // Get URL search params from the request
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Twilio also sends data in the body as form-encoded
    const formData = await request.formData();

    // Get the 'To' parameter from either source
    const To = formData.get('To') || searchParams.get('To');
    const CallerId = formData.get('CallerId') || searchParams.get('CallerId');

    // Domain safeguarding for production
    if (process.env.NODE_ENV === 'production') {
      const twilioSignature = request.headers.get('x-twilio-signature');
      if (!twilioSignature) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      // TODO: Verify Twilio signature using twilio.validateRequest()
    }

    // Validate the phone number format
    if (!To || typeof To !== 'string') {
      // Return TwiML error response instead of HTTP error
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Sorry, no phone number was provided. Please try again.</Say>
    <Hangup/>
</Response>`;

      return new NextResponse(errorTwiml, {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // E.164 format: +[country code][number] (max 15 digits total)
    // Must start with + and have 7-15 digits after the +
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    if (!phoneRegex.test(To)) {
      // Return TwiML error response
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Sorry, the phone number format is invalid. Please use international format.</Say>
    <Hangup/>
</Response>`;

      return new NextResponse(errorTwiml, {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Generate TwiML response
    // Use nullish coalescing to handle empty strings properly
    const callerIdToUse =
      (CallerId && typeof CallerId === 'string' && CallerId.trim()) ||
      process.env.TWILIO_PHONE_NUMBER ||
      '';

    // Build status callback URL for call tracking
    const statusCallbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status`;

    // Generate TwiML with proper attributes
    // answerOnBridge="true" delays answering until the dialed party picks up
    // This prevents billing for unanswered calls
    // timeout="30" rings for 30 seconds before giving up
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial
        callerId="${callerIdToUse}"
        answerOnBridge="true"
        timeout="30"
        action="${statusCallbackUrl}"
        method="POST">
        <Number>${To}</Number>
    </Dial>
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch {
    // Return TwiML error response instead of HTTP error
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Sorry, an error occurred. Please try again later.</Say>
    <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      headers: { 'Content-Type': 'text/xml' },
      status: 500,
    });
  }
}

// GET handler for testing
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const To = url.searchParams.get('To') || '+1234567890';
  const CallerId =
    url.searchParams.get('CallerId') || process.env.TWILIO_PHONE_NUMBER;

  const statusCallbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status`;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial
        callerId="${CallerId}"
        answerOnBridge="true"
        timeout="30"
        action="${statusCallbackUrl}"
        method="POST">
        <Number>${To}</Number>
    </Dial>
</Response>`;

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Twilio-Signature',
    },
  });
}
