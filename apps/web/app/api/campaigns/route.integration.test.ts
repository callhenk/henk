import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createTestContext,
  cleanupTestUser,
  cleanupTestBusiness,
  createCampaign,
  createAgent,
  createTestClient,
} from '@/lib/test';
import { GET, POST } from './route';

describe('Campaigns API Integration Tests', () => {
  let testContext: Awaited<ReturnType<typeof createTestContext>>;
  let supabase: ReturnType<typeof createTestClient>;
  let authHeader: string;

  beforeAll(async () => {
    // Create test context (user, business, team membership)
    testContext = await createTestContext({
      email: `campaigns-test-${Date.now()}@henk.dev`,
      businessName: 'Campaigns Test Business',
      role: 'owner',
    });

    supabase = createTestClient();

    // Sign in to get auth token
    const { data: session } = await supabase.auth.signInWithPassword({
      email: testContext.user.email!,
      password: 'TestPassword123!',
    });

    authHeader = `Bearer ${session.session?.access_token}`;
  });

  afterAll(async () => {
    // Cleanup
    await cleanupTestBusiness(testContext.business.id);
    await cleanupTestUser(testContext.user.id);
  });

  beforeEach(async () => {
    // Clean up campaigns before each test
    await supabase
      .from('campaigns')
      .delete()
      .eq('business_id', testContext.business.id);
  });

  describe('GET /api/campaigns', () => {
    it('returns empty array when no campaigns exist', async () => {
      const request = new Request('http://localhost:3000/api/campaigns', {
        headers: {
          Authorization: authHeader,
          Cookie: `sb-access-token=${authHeader.replace('Bearer ', '')}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });

    it('returns campaigns for authenticated user', async () => {
      // Create test campaigns
      await createCampaign(testContext.business.id, {
        name: 'Test Campaign 1',
        status: 'draft',
      });
      await createCampaign(testContext.business.id, {
        name: 'Test Campaign 2',
        status: 'active',
      });

      const request = new Request('http://localhost:3000/api/campaigns', {
        headers: {
          Authorization: authHeader,
          Cookie: `sb-access-token=${authHeader.replace('Bearer ', '')}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.pagination.total).toBe(2);
    });

    it('filters campaigns by status', async () => {
      // Create campaigns with different statuses
      await createCampaign(testContext.business.id, {
        name: 'Draft Campaign',
        status: 'draft',
      });
      await createCampaign(testContext.business.id, {
        name: 'Active Campaign',
        status: 'active',
      });

      const request = new Request(
        'http://localhost:3000/api/campaigns?status=active',
        {
          headers: {
            Authorization: authHeader,
            Cookie: `sb-access-token=${authHeader.replace('Bearer ', '')}`,
          },
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].status).toBe('active');
    });

    it('searches campaigns by name', async () => {
      // Create campaigns
      await createCampaign(testContext.business.id, {
        name: 'Annual Fundraiser',
      });
      await createCampaign(testContext.business.id, {
        name: 'Spring Gala',
      });

      const request = new Request(
        'http://localhost:3000/api/campaigns?search=fundraiser',
        {
          headers: {
            Authorization: authHeader,
            Cookie: `sb-access-token=${authHeader.replace('Bearer ', '')}`,
          },
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toContain('Fundraiser');
    });

    it('paginates campaigns correctly', async () => {
      // Create 5 campaigns
      for (let i = 1; i <= 5; i++) {
        await createCampaign(testContext.business.id, {
          name: `Campaign ${i}`,
        });
      }

      // Get first page (limit 2)
      const request1 = new Request(
        'http://localhost:3000/api/campaigns?page=1&limit=2',
        {
          headers: {
            Authorization: authHeader,
            Cookie: `sb-access-token=${authHeader.replace('Bearer ', '')}`,
          },
        }
      );

      const response1 = await GET(request1);
      const data1 = await response1.json();

      expect(data1.data).toHaveLength(2);
      expect(data1.pagination.page).toBe(1);
      expect(data1.pagination.total).toBe(5);
      expect(data1.pagination.totalPages).toBe(3);

      // Get second page
      const request2 = new Request(
        'http://localhost:3000/api/campaigns?page=2&limit=2',
        {
          headers: {
            Authorization: authHeader,
            Cookie: `sb-access-token=${authHeader.replace('Bearer ', '')}`,
          },
        }
      );

      const response2 = await GET(request2);
      const data2 = await response2.json();

      expect(data2.data).toHaveLength(2);
      expect(data2.pagination.page).toBe(2);
    });

    it('returns 401 for unauthenticated requests', async () => {
      const request = new Request('http://localhost:3000/api/campaigns');

      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('only returns campaigns from user business', async () => {
      // Create campaign in user's business
      await createCampaign(testContext.business.id, {
        name: 'My Campaign',
      });

      // Create another business and campaign
      const otherContext = await createTestContext({
        email: `other-${Date.now()}@henk.dev`,
        businessName: 'Other Business',
      });

      await createCampaign(otherContext.business.id, {
        name: 'Other Campaign',
      });

      const request = new Request('http://localhost:3000/api/campaigns', {
        headers: {
          Authorization: authHeader,
          Cookie: `sb-access-token=${authHeader.replace('Bearer ', '')}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('My Campaign');

      // Cleanup
      await cleanupTestBusiness(otherContext.business.id);
      await cleanupTestUser(otherContext.user.id);
    });
  });

  describe('POST /api/campaigns', () => {
    it('creates a new campaign', async () => {
      // Create an agent first
      const agent = await createAgent(testContext.business.id);

      const campaignData = {
        name: 'New Campaign',
        description: 'Test campaign description',
        agent_id: agent.id,
        status: 'draft',
      };

      const request = new Request('http://localhost:3000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
          Cookie: `sb-access-token=${authHeader.replace('Bearer ', '')}`,
        },
        body: JSON.stringify(campaignData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('New Campaign');
      expect(data.data.description).toBe('Test campaign description');
      expect(data.data.status).toBe('draft');
      expect(data.data.business_id).toBe(testContext.business.id);

      // Verify in database
      const { data: dbCampaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', data.data.id)
        .single();

      expect(dbCampaign).toBeTruthy();
      expect(dbCampaign?.name).toBe('New Campaign');
    });

    it('creates campaign with all optional fields', async () => {
      const agent = await createAgent(testContext.business.id);

      const campaignData = {
        name: 'Complete Campaign',
        description: 'Full campaign with all fields',
        agent_id: agent.id,
        max_attempts: 3,
        daily_call_cap: 100,
        script: 'Test script',
        budget: '5000',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        goal_metric: 'donations',
        call_window_start: '09:00',
        call_window_end: '17:00',
        dedupe_by_phone: true,
        exclude_dnc: true,
      };

      const request = new Request('http://localhost:3000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
          Cookie: `sb-access-token=${authHeader.replace('Bearer ', '')}`,
        },
        body: JSON.stringify(campaignData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.max_attempts).toBe(3);
      expect(data.data.daily_call_cap).toBe(100);
      expect(data.data.dedupe_by_phone).toBe(true);
    });

    it('returns 401 for unauthenticated requests', async () => {
      const request = new Request('http://localhost:3000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('returns 403 for viewer role', async () => {
      // Create a viewer user
      const viewerContext = await createTestContext({
        email: `viewer-${Date.now()}@henk.dev`,
        businessName: testContext.business.name,
        role: 'viewer',
      });

      // Sign in as viewer
      const { data: viewerSession } = await supabase.auth.signInWithPassword({
        email: viewerContext.user.email!,
        password: 'TestPassword123!',
      });

      const request = new Request('http://localhost:3000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${viewerSession.session?.access_token}`,
          Cookie: `sb-access-token=${viewerSession.session?.access_token}`,
        },
        body: JSON.stringify({ name: 'Test Campaign' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(403);

      // Cleanup
      await cleanupTestUser(viewerContext.user.id);
    });

    it('returns 400 for invalid data', async () => {
      const request = new Request('http://localhost:3000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
          Cookie: `sb-access-token=${authHeader.replace('Bearer ', '')}`,
        },
        body: JSON.stringify({}), // Missing required fields
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
