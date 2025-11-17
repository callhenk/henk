import { NextRequest, NextResponse } from 'next/server';

/**
 * TwiML endpoint for handling outgoing calls
 * This generates the TwiML instructions for Twilio to execute when making calls
 * Twilio sends form-encoded data, not JSON
 */
export async function POST(request: NextRequest) {
  try {
    console.log('========== TwiML Request Start ==========');

    // Get URL search params from the request
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Twilio also sends data in the body as form-encoded
    const formData = await request.formData();

    // Log ALL headers for debugging
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    console.log('Request URL:', url.toString());
    console.log('Request method:', request.method);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Form Data:', Object.fromEntries(formData.entries()));
    console.log('Search Params:', Object.fromEntries(searchParams.entries()));

    // Get the 'To' parameter from either source
    const To = formData.get('To') || searchParams.get('To');
    const CallerId = formData.get('CallerId') || searchParams.get('CallerId');

    console.log('Extracted values:', { To, CallerId });

    // Domain safeguarding for production
    if (process.env.NODE_ENV === 'production') {
      const twilioSignature = request.headers.get('x-twilio-signature');
      if (!twilioSignature) {
        console.error('Missing Twilio signature in production');
        return new NextResponse('Unauthorized', { status: 401 });
      }
      // In production, you should verify the Twilio signature here
      // using the twilio.validateRequest() method
    }

    // Validate the phone number format
    if (!To || typeof To !== 'string') {
      console.error('Missing or invalid To parameter:', To);
      console.log('========== TwiML Request End (Error) ==========');

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

    if (!To.match(/^\+?[1-9]\d{1,14}$/)) {
      console.error('Invalid phone number format:', To);
      console.log('========== TwiML Request End (Error) ==========');

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
    const callerIdToUse = CallerId || process.env.TWILIO_PHONE_NUMBER;
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial callerId="${callerIdToUse}">
        <Number>${To}</Number>
    </Dial>
</Response>`;

    console.log('Generated TwiML successfully for call to:', To);
    console.log('TwiML Response:', twiml);
    console.log('========== TwiML Request End (Success) ==========');

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error generating TwiML:', error);
    console.log('========== TwiML Request End (Exception) ==========');

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
  console.log('========== TwiML GET Request ==========');
  console.log('Request URL:', request.url);

  const url = new URL(request.url);
  const To = url.searchParams.get('To') || '+1234567890';
  const CallerId =
    url.searchParams.get('CallerId') || process.env.TWILIO_PHONE_NUMBER;

  console.log('GET params:', { To, CallerId });
  console.log('========== TwiML GET Request End ==========');

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial callerId="${CallerId}">
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
