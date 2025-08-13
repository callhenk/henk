-- Add conversation_id column to conversations for storing external (e.g., ElevenLabs) conversation identifiers
-- Safe to run multiple times due to IF NOT EXISTS guards

BEGIN;

-- 1) Add the column if it doesn't exist
ALTER TABLE IF EXISTS public.conversations
  ADD COLUMN IF NOT EXISTS conversation_id text;

-- 2) Backfill: if you previously used the primary key `id` to store the external id, copy it
UPDATE public.conversations
SET conversation_id = id
WHERE conversation_id IS NULL;

-- 3) Create a partial unique index to enforce uniqueness on non-null external ids
CREATE UNIQUE INDEX IF NOT EXISTS conversations_conversation_id_key
  ON public.conversations (conversation_id)
  WHERE conversation_id IS NOT NULL;

COMMIT;


