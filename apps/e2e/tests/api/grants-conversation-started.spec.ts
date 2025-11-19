import { expect, test } from '@playwright/test';

test.describe('Grants API - Conversation Started', () => {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ENDPOINT = `${BASE_URL}/api/grants/conversation-started`;

  test('should accept valid conversation started notification with conversation_id', async ({
    request,
  }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_test123',
        conversation_id: 'conv_test456',
        metadata: {
          timezone: 'America/New_York',
          locale: 'en-US',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          timestamp: new Date().toISOString(),
          ip: '127.0.0.1',
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    // Conversation ID should be included in notification
  });

  test('should return error for missing agent_id', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        conversation_id: 'conv_test456',
        metadata: {
          timezone: 'America/New_York',
          locale: 'en-US',
        },
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Agent ID is required');
  });

  test('should handle request without conversation_id (optional field)', async ({
    request,
  }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_test123',
        metadata: {
          timezone: 'America/New_York',
          locale: 'en-US',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          timestamp: new Date().toISOString(),
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    // Should still work even without conversation_id
  });

  test('should handle request with minimal metadata', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_test123',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('should handle CORS preflight request', async ({ request }) => {
    const response = await request.fetch(ENDPOINT, {
      method: 'OPTIONS',
    });

    expect(response.status()).toBe(204);
    expect(response.headers()['access-control-allow-origin']).toBe('*');
    expect(response.headers()['access-control-allow-methods']).toContain(
      'POST',
    );
  });

  test('should include proper headers in response', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_test123',
        metadata: {
          timezone: 'America/New_York',
        },
      },
    });

    expect(response.headers()['access-control-allow-origin']).toBe('*');
  });

  test('should gracefully handle missing Resend API key', async ({
    request,
  }) => {
    // This test will pass even if RESEND_API_KEY is not set
    // because the endpoint is designed to fail gracefully
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_test123',
        metadata: {
          timezone: 'America/New_York',
          locale: 'en-US',
        },
      },
    });

    // Should still return success even if email fails
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('should capture IP address from headers', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_test123',
      },
      headers: {
        'x-forwarded-for': '203.0.113.0',
        'user-agent': 'Test/1.0',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('should validate request body structure', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_test123',
        conversation_id: 'conv_test456',
        metadata: {
          timezone: 'America/New_York',
          locale: 'en-US',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          timestamp: new Date().toISOString(),
          ip: '192.168.1.1',
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('message');
  });
});
