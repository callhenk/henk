import { expect, test } from '@playwright/test';

test.describe('Demo API - Conversation Started', () => {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ENDPOINT = `${BASE_URL}/api/demo/conversation-started`;

  test('should accept valid demo conversation notification with all fields', async ({
    request,
  }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_demo123',
        agent_name: 'Test Demo Agent',
        conversation_id: 'conv_demo456',
        email: 'test@example.com',
        name: 'John Doe',
        use_case: 'fundraising',
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
  });

  test('should return error for missing agent_id', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        email: 'test@example.com',
        conversation_id: 'conv_demo456',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Agent ID is required');
  });

  test('should return error for missing email', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_demo123',
        conversation_id: 'conv_demo456',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Email is required');
  });

  test('should handle request without optional name', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_demo123',
        email: 'test@example.com',
        metadata: {
          timezone: 'America/New_York',
          locale: 'en-US',
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('should handle request without conversation_id', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_demo123',
        email: 'test@example.com',
        name: 'Jane Smith',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('should handle request with minimal data', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_demo123',
        email: 'test@example.com',
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
        agent_id: 'agent_demo123',
        email: 'test@example.com',
      },
    });

    expect(response.headers()['access-control-allow-origin']).toBe('*');
  });

  test('should gracefully handle missing Resend API key', async ({
    request,
  }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_demo123',
        email: 'test@example.com',
        agent_name: 'Test Agent',
        use_case: 'sales',
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
        agent_id: 'agent_demo123',
        email: 'test@example.com',
      },
      headers: {
        'x-forwarded-for': '203.0.113.0',
        'user-agent': 'DemoTest/1.0',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('should validate email and agent details in request', async ({
    request,
  }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_demo123',
        agent_name: 'Fundraising Agent',
        conversation_id: 'conv_demo789',
        email: 'demo@callhenk.com',
        name: 'Demo User',
        use_case: 'fundraising',
        metadata: {
          timezone: 'America/Los_Angeles',
          locale: 'en-US',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          timestamp: new Date().toISOString(),
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('message');
  });

  test('should handle use_case in notification', async ({ request }) => {
    const response = await request.post(ENDPOINT, {
      data: {
        agent_id: 'agent_demo123',
        email: 'test@example.com',
        use_case: 'donor_relations',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
