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

    console.log('TwiML request received:', {
      To,
      CallerId,
      allFormData: Object.fromEntries(formData.entries()),
      searchParams: Object.fromEntries(searchParams.entries()),
    });

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
    if (!To || typeof To !== 'string' || !To.match(/^\+?[1-9]\d{1,14}$/)) {
      console.error('Invalid phone number:', To);
      return new NextResponse('Invalid phone number', { status: 400 });
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

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error generating TwiML:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// GET handler for testing
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const To = url.searchParams.get('To') || '+1234567890';
  const CallerId =
    url.searchParams.get('CallerId') || process.env.TWILIO_PHONE_NUMBER;

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
