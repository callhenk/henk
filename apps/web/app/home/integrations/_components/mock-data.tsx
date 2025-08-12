import React from 'react';

import type { LucideIcon, LucideProps } from 'lucide-react';
import {
  BarChart3,
  Brain,
  Cloud,
  Database,
  Mail,
  Phone,
  Puzzle,
  ShieldCheck,
} from 'lucide-react';

import type { ProviderSchema, UiIntegration } from './types';

const oauthOnly: ProviderSchema = {
  supportsOAuth: true,
  credentials: [],
  config: [
    {
      key: 'env',
      label: 'Environment',
      type: 'select',
      options: [
        { value: 'live', label: 'Live' },
        { value: 'test', label: 'Test' },
      ],
      helpText: 'Choose where to run this integration',
    },
    {
      key: 'webhook_url',
      label: 'Webhook URL',
      type: 'url',
      placeholder: 'https://example.com/webhooks/provider',
      helpText: 'Copy this to your provider dashboard',
    },
  ],
};

const apiKeyBase = (
  extraCreds: ProviderSchema['credentials'] = [],
): ProviderSchema => ({
  supportsApiKey: true,
  credentials: [
    {
      key: 'api_key',
      label: 'API Key',
      type: 'password',
      required: true,
      secret: true,
      helpText: 'Your provider API key',
    },
    ...extraCreds,
  ],
  config: [
    {
      key: 'env',
      label: 'Environment',
      type: 'select',
      options: [
        { value: 'live', label: 'Live' },
        { value: 'test', label: 'Test' },
      ],
    },
  ],
});

export const SEED_INTEGRATIONS = (businessId: string): UiIntegration[] => [
  {
    id: 'twilio',
    business_id: businessId,
    name: 'Twilio',
    description:
      'Programmable voice and telephony for outbound and inbound calls.',
    type: 'telephony',
    status: 'disconnected',
    config: null,
    credentials: null,
    last_sync_at: null,
    icon: Phone,
    schema: apiKeyBase([
      {
        key: 'account_sid',
        label: 'Account SID',
        type: 'text',
        required: true,
        helpText: 'Twilio Account SID',
      },
      {
        key: 'auth_token',
        label: 'Auth Token',
        type: 'password',
        required: true,
        secret: true,
      },
      {
        key: 'default_caller_id',
        label: 'Default Caller ID',
        type: 'tel',
        placeholder: '+15551234567',
      },
    ]),
  },
  {
    id: 'elevenlabs',
    business_id: businessId,
    name: 'ElevenLabs',
    description:
      'State-of-the-art text-to-speech voices for realistic calling.',
    type: 'tts',
    status: 'connected',
    config: { env: 'live' },
    credentials: { api_key: '••••••••90' },
    last_sync_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    icon: VoiceIcon,
    schema: apiKeyBase(),
  },
  {
    id: 'openai',
    business_id: businessId,
    name: 'OpenAI',
    description:
      'Language models for summaries, classification, and lead scoring.',
    type: 'nlp',
    status: 'needs_attention',
    config: { env: 'test' },
    credentials: { api_key: '••••••••71' },
    last_sync_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    icon: Brain,
    schema: apiKeyBase(),
  },
  {
    id: 'hubspot',
    business_id: businessId,
    name: 'HubSpot',
    description: 'CRM to centralize and sync your donor and lead records.',
    type: 'crm',
    status: 'disconnected',
    config: null,
    credentials: null,
    last_sync_at: null,
    icon: Database,
    schema: { ...oauthOnly, supportsOAuth: true, popular: true },
  },
  {
    id: 'sendgrid',
    business_id: businessId,
    name: 'SendGrid',
    description:
      'Transactional email and notifications for follow-up and receipts.',
    type: 'email',
    status: 'connected',
    config: { env: 'live', region: 'us-east-1' },
    credentials: { api_key: '••••••••12' },
    last_sync_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    icon: Mail,
    schema: apiKeyBase(),
  },
  {
    id: 'ga',
    business_id: businessId,
    name: 'Google Analytics',
    description:
      'Website conversion tracking and attribution across campaigns.',
    type: 'analytics',
    status: 'disconnected',
    config: null,
    credentials: null,
    last_sync_at: null,
    icon: BarChart3,
    schema: oauthOnly,
  },
  {
    id: 'turnstile',
    business_id: businessId,
    name: 'Cloudflare Turnstile',
    description: 'Captcha to protect your forms without hurting conversions.',
    type: 'captcha',
    status: 'connected',
    config: { env: 'live' },
    credentials: { site_key: '••••••••ab', secret_key: '••••••••cd' },
    last_sync_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    icon: ShieldCheck,
    schema: apiKeyBase([
      {
        key: 'site_key',
        label: 'Site Key',
        type: 'text',
        required: true,
        secret: false,
      },
      {
        key: 'secret_key',
        label: 'Secret Key',
        type: 'password',
        required: true,
        secret: true,
      },
    ]),
  },
  {
    id: 's3',
    business_id: businessId,
    name: 'Amazon S3',
    description: 'Object storage for large media and call recordings.',
    type: 'storage',
    status: 'deprecated',
    config: null,
    credentials: null,
    last_sync_at: null,
    icon: Cloud,
    schema: apiKeyBase([
      {
        key: 'access_key_id',
        label: 'Access Key ID',
        type: 'text',
        required: true,
      },
      {
        key: 'secret_access_key',
        label: 'Secret Access Key',
        type: 'password',
        required: true,
        secret: true,
      },
      {
        key: 'region',
        label: 'Region',
        type: 'select',
        options: [
          { value: 'us-east-1', label: 'US East (N. Virginia)' },
          { value: 'us-west-2', label: 'US West (Oregon)' },
          { value: 'eu-west-1', label: 'EU (Ireland)' },
        ],
      },
    ]),
  },
  {
    id: 'other',
    business_id: businessId,
    name: 'Custom Provider',
    description: 'Use a generic connector for custom flows.',
    type: 'other',
    status: 'disconnected',
    config: null,
    credentials: null,
    last_sync_at: null,
    icon: Puzzle,
    schema: apiKeyBase(),
  },
];

const VoiceIcon: LucideIcon = React.forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <svg ref={ref} viewBox="0 0 24 24" width="1em" height="1em" {...props}>
      <path
        fill="currentColor"
        d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3zm-7 9a7 7 0 0 0 14 0h2a9 9 0 0 1-18 0h2z"
      />
    </svg>
  ),
);
VoiceIcon.displayName = 'VoiceIcon';
