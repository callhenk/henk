import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple test TwiML endpoint - always returns valid TwiML
 * Use this to test if Twilio can reach your server
 */
export async function POST(request: NextRequest) {
  console.log('🔥🔥🔥 TEST TWIML ENDPOINT HIT! 🔥🔥🔥');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);

  // Try to parse form data
  try {
    const formData = await request.formData();
    console.log('Form Data:', Object.fromEntries(formData.entries()));
  } catch (e) {
    console.log('Could not parse form data:', e);
  }

  // Always return valid TwiML that says a message
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Test endpoint working! This is from the test TwiML endpoint.</Say>
    <Pause length="2"/>
    <Say>Hanging up now.</Say>
</Response>`;

  console.log('Returning TwiML:', twiml);

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

export async function GET() {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>GET request test endpoint working!</Say>
</Response>`;

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
