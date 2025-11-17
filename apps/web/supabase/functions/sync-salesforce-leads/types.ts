// TypeScript type definitions for Salesforce lead sync function
import type { Database } from '../../../database.types.ts';

// Extract database types
export type LeadRow = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];
export type IntegrationRow =
  Database['public']['Tables']['integrations']['Row'];
export type LeadListRow = Database['public']['Tables']['lead_lists']['Row'];
export type LeadListMemberRow =
  Database['public']['Tables']['lead_list_members']['Row'];
export type SyncLogRow = Database['public']['Tables']['sync_logs']['Row'];
export type Json =
  Database['public']['Tables']['leads']['Row']['source_metadata'];

// Salesforce Contact from SOQL query
// Note: Fields like Description, OwnerId, DoNotCall, HasOptedOutOfEmail, LeadSource
// may require FLS permissions and are excluded from queries
export interface SalesforceContact {
  Id: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Phone?: string;
  MobilePhone?: string;
  MailingStreet?: string;
  MailingCity?: string;
  MailingState?: string;
  MailingPostalCode?: string;
  MailingCountry?: string;
  Title?: string;
  Department?: string;
  Account?: {
    Name?: string;
  };
  SystemModstamp?: string;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

// Salesforce Lead from SOQL query
// Note: Fields like Description, LeadSource, OwnerId, DoNotCall, HasOptedOutOfEmail, Status
// may require FLS permissions and are excluded from queries
export interface SalesforceLead {
  Id: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Phone?: string;
  MobilePhone?: string;
  Street?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Country?: string;
  Company?: string;
  Title?: string;
  Rating?: string;
  IsConverted?: boolean;
  SystemModstamp?: string;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

// Salesforce API response for SOQL query
export interface SalesforceQueryResponse {
  totalSize: number;
  done: boolean;
  nextRecordsUrl?: string;
  records: (SalesforceContact | SalesforceLead)[];
}

// Integration record with typed credentials and config
export interface Integration extends IntegrationRow {
  credentials: {
    clientId?: string;
    clientSecret?: string;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
  };
  config: {
    env?: string;
    instanceUrl: string;
    apiVersion: string;
    syncEnabled?: boolean;
    syncInterval?: number;
  };
}

// Sync result for a single integration
export interface SyncResult {
  integration_id: string;
  business_id: string;
  status: 'success' | 'partial' | 'failed';
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  duration_ms: number;
  metadata?: {
    contacts_synced: number;
    leads_synced: number;
  };
  error?: string;
}

// OAuth token refresh response
export interface TokenRefreshResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  instance_url?: string;
  id?: string;
  issued_at?: string;
  signature?: string;
}

// Credentials after token refresh
export interface RefreshedCredentials {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
}

// Log entry for structured logging
export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  integration_id?: string;
  business_id?: string;
  duration_ms?: number;
  metadata?: Record<string, unknown>;
}
