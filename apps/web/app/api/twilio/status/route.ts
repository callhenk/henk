import { NextRequest, NextResponse } from 'next/server';

/**
 * Status callback endpoint for Twilio Dial action
 * This receives the status of the dial attempt (answered, busy, no-answer, failed, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params = Object.fromEntries(formData.entries());

    // Extract key status information
    const { DialCallStatus } = params;

    // Handle different dial statuses
    let responseMessage = '';

    switch (DialCallStatus) {
      case 'completed':
      case 'answered':
        responseMessage = 'Thanks for your call!';
        break;

      case 'busy':
        responseMessage =
          'The number you called is busy. Please try again later.';
        break;

      case 'no-answer':
        responseMessage = 'Your call was not answered. Please try again later.';
        break;

      case 'failed':
        responseMessage = 'Your call could not be completed. Please try again.';
        break;

      case 'canceled':
        responseMessage = 'Your call was canceled.';
        break;

      default:
        responseMessage = 'Your call has ended.';
    }

    // Return TwiML response
    // You can customize this based on the dial status
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>${responseMessage}</Say>
    <Hangup/>
</Response>`;

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch {
    // Return a simple hangup response on error
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      headers: { 'Content-Type': 'text/xml' },
      status: 200, // Always return 200 to Twilio
    });
  }
}

// GET handler for testing
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const DialCallStatus = url.searchParams.get('DialCallStatus') || 'completed';

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Test status callback: ${DialCallStatus}</Say>
    <Hangup/>
</Response>`;

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

// OPTIONS handler for CORS
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Twilio-Signature',
    },
  });
}
