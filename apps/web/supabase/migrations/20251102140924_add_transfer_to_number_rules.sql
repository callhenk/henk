-- Add transfer_to_number_rules column to agents table
-- This column stores configuration for transferring calls to phone numbers or SIP URIs
-- Based on ElevenLabs Conversational AI transfer_to_number system tool

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS transfer_to_number_rules JSONB DEFAULT '{"transfers": []}'::jsonb;

-- Add GIN index for better JSONB query performance
CREATE INDEX IF NOT EXISTS idx_agents_transfer_to_number_rules ON agents USING GIN (transfer_to_number_rules);

-- Add comment to describe the column
COMMENT ON COLUMN agents.transfer_to_number_rules IS 'Configuration for transferring calls to phone numbers or SIP URIs. Each transfer rule contains: phone_number (destination), condition (when to transfer), transfer_type (conference or sip_refer), and destination_type (phone_number or sip_uri).';
