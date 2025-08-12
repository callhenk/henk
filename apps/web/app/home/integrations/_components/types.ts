import type { LucideIcon } from 'lucide-react';

export type IntegrationType =
  | 'telephony'
  | 'tts'
  | 'nlp'
  | 'crm'
  | 'email'
  | 'analytics'
  | 'payments'
  | 'storage'
  | 'captcha'
  | 'other';

export type IntegrationStatus =
  | 'connected'
  | 'disconnected'
  | 'needs_attention'
  | 'error'
  | 'deprecated';

export interface IntegrationBase {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  type: IntegrationType;
  status: IntegrationStatus;
  config: Record<string, unknown> | null;
  credentials: Record<string, unknown> | null;
  last_sync_at: string | null; // ISO
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'url' | 'number' | 'tel' | 'email';
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>; // for select
  secret?: boolean; // for credentials
}

export interface ProviderSchema {
  supportsOAuth?: boolean;
  supportsApiKey?: boolean;
  supportsMultiple?: boolean;
  popular?: boolean;
  credentials: FieldDefinition[]; // for API key mode
  config: FieldDefinition[];
}

export interface UiIntegration extends IntegrationBase {
  icon: LucideIcon;
  schema: ProviderSchema;
  connections?: Array<{
    id: string;
    name?: string;
    status: IntegrationStatus;
    last_sync_at: string | null;
  }>; // for multi-account support
}

export interface IntegrationsFiltersState {
  search: string;
  type: 'all' | IntegrationType;
  status: 'all' | IntegrationStatus;
  sortBy: 'name' | 'last_sync_at' | 'status';
  sortOrder: 'asc' | 'desc';
}

export interface IntegrationsControllerProps {
  businessId: string;
  canEdit?: boolean;
  items?: UiIntegration[]; // optional seed; otherwise we will use defaults
}

export type TestConnectionResult =
  | { success: true; message?: string }
  | { success: false; message: string };

export function maskSecret(value: string): string {
  if (!value) return '';
  const visible = Math.min(2, value.length);
  return `${'•'.repeat(Math.max(0, value.length - visible))}${value.slice(-visible)}`;
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Never';
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export async function mockAsync<T>(fn: () => T, ms: number = 800): Promise<T> {
  await new Promise((r) => setTimeout(r, ms));
  return fn();
}


