/**
 * Mock Salesforce data for testing
 */

export const mockSalesforceContact = {
  Id: '003xx000004TmiOAAS',
  FirstName: 'John',
  LastName: 'Doe',
  Email: 'john.doe@example.com',
  Phone: '+15555551234',
  MobilePhone: '+15555555678',
  Title: 'CEO',
  Department: 'Executive',
  MailingStreet: '123 Main St',
  MailingCity: 'San Francisco',
  MailingState: 'CA',
  MailingPostalCode: '94102',
  MailingCountry: 'USA',
  Account: {
    Name: 'Acme Corp',
  },
  CreatedDate: '2024-01-01T00:00:00.000Z',
  LastModifiedDate: '2024-01-15T00:00:00.000Z',
  SystemModstamp: '2024-01-15T00:00:00.000Z',
};

export const mockSalesforceLead = {
  Id: '00Qxx000000TmiOAAS',
  FirstName: 'Jane',
  LastName: 'Smith',
  Email: 'jane.smith@example.com',
  Phone: '+15555556789',
  Title: 'VP of Marketing',
  Company: 'Marketing Inc',
  Street: '456 Oak Ave',
  City: 'New York',
  State: 'NY',
  PostalCode: '10001',
  Country: 'USA',
  Status: 'Open - Not Contacted',
  Rating: 'Hot',
  CreatedDate: '2024-01-01T00:00:00.000Z',
  LastModifiedDate: '2024-01-15T00:00:00.000Z',
  SystemModstamp: '2024-01-15T00:00:00.000Z',
};

export const mockSalesforceQueryResponse = {
  totalSize: 2,
  done: true,
  records: [mockSalesforceContact, mockSalesforceLead],
};

export const mockElevenLabsAgent = {
  agent_id: 'test-agent-123',
  name: 'Test Fundraising Agent',
  voice_id: 'test-voice-456',
  prompt: 'You are a friendly fundraising agent...',
};

export const mockElevenLabsConversation = {
  conversation_id: 'conv-123',
  status: 'completed',
  agent_id: 'test-agent-123',
  metadata: {
    donor_name: 'John Doe',
    campaign_name: 'Annual Fundraiser',
  },
};

export const mockElevenLabsMessages = [
  {
    message_id: 'msg-1',
    role: 'agent',
    message: 'Hello! This is the fundraising team calling.',
    created_at: '2024-01-15T10:00:00.000Z',
  },
  {
    message_id: 'msg-2',
    role: 'user',
    message: "Hi, yes I'm interested in contributing.",
    created_at: '2024-01-15T10:00:15.000Z',
  },
  {
    message_id: 'msg-3',
    role: 'agent',
    message: 'Wonderful! Would you like to pledge $100 for our cause?',
    created_at: '2024-01-15T10:00:30.000Z',
  },
  {
    message_id: 'msg-4',
    role: 'user',
    message: 'Yes, I will pledge $100.',
    created_at: '2024-01-15T10:00:45.000Z',
  },
];

export const mockWebhookPayload = {
  conversation_id: 'conv-123',
  status: 'completed',
  transcript: 'Full conversation transcript...',
  duration_seconds: 120,
  outcome: 'pledged',
  metadata: {
    campaign_id: 'camp-456',
    lead_id: 'lead-789',
  },
};
