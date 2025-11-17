import { NextRequest, NextResponse } from 'next/server';

/**
 * TwiML endpoint for handling outgoing calls
 * This generates the TwiML instructions for Twilio to execute when making calls
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { To, CallerId } = body;

    // Domain safeguarding for production
    if (process.env.NODE_ENV === 'production') {
      const twilioSignature = request.headers.get('x-twilio-signature');
      if (!twilioSignature) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      // In production, you should verify the Twilio signature here
      // using the twilio.validateRequest() method
    }

    // Validate the phone number format
    if (!To || !To.match(/^\+?[1-9]\d{1,14}$/)) {
      return new NextResponse('Invalid phone number', { status: 400 });
    }

    // Generate TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial callerId="${CallerId || process.env.TWILIO_PHONE_NUMBER}">
        <Number>${To}</Number>
    </Dial>
</Response>`;

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
