#!/bin/bash
# Set production secrets for Supabase Edge Functions
# Run this script after deploying functions to production

set -e

echo "🔐 Setting up Supabase Edge Function secrets for production..."
echo ""
echo "This will set secrets for the production Supabase project."
echo "Make sure you have:"
echo "  1. Linked your project: supabase link --project-ref YOUR_PROJECT_REF"
echo "  2. Updated .env.local with production values"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

# Load environment variables from .env.local
if [ ! -f "../../.env.local" ]; then
    echo "❌ Error: .env.local not found at apps/web/.env.local"
    exit 1
fi

# Source the env file
set -a
source ../../.env.local
set +a

echo ""
echo "📤 Setting secrets..."

# Required secrets
if [ -n "$ELEVENLABS_API_KEY" ]; then
    echo "✅ Setting ELEVENLABS_API_KEY..."
    supabase secrets set ELEVENLABS_API_KEY="$ELEVENLABS_API_KEY" --project-ref "${SUPABASE_PROJECT_REF:-}"
else
    echo "⚠️  ELEVENLABS_API_KEY not found in .env.local"
fi

# Optional Salesforce credentials (functions will fall back to database credentials if not set)
if [ -n "$SALESFORCE_CLIENT_ID" ]; then
    echo "✅ Setting SALESFORCE_CLIENT_ID..."
    supabase secrets set SALESFORCE_CLIENT_ID="$SALESFORCE_CLIENT_ID" --project-ref "${SUPABASE_PROJECT_REF:-}"
fi

if [ -n "$SALESFORCE_CLIENT_SECRET" ]; then
    echo "✅ Setting SALESFORCE_CLIENT_SECRET..."
    supabase secrets set SALESFORCE_CLIENT_SECRET="$SALESFORCE_CLIENT_SECRET" --project-ref "${SUPABASE_PROJECT_REF:-}"
fi

# Optional configuration
if [ -n "$MAX_RECORDS_PER_SYNC" ]; then
    echo "✅ Setting MAX_RECORDS_PER_SYNC..."
    supabase secrets set MAX_RECORDS_PER_SYNC="$MAX_RECORDS_PER_SYNC" --project-ref "${SUPABASE_PROJECT_REF:-}"
fi

if [ -n "$CONVERSATION_SYNC_LOOKBACK_HOURS" ]; then
    echo "✅ Setting CONVERSATION_SYNC_LOOKBACK_HOURS..."
    supabase secrets set CONVERSATION_SYNC_LOOKBACK_HOURS="$CONVERSATION_SYNC_LOOKBACK_HOURS" --project-ref "${SUPABASE_PROJECT_REF:-}"
fi

if [ -n "$CONVERSATION_SYNC_BATCH_LIMIT" ]; then
    echo "✅ Setting CONVERSATION_SYNC_BATCH_LIMIT..."
    supabase secrets set CONVERSATION_SYNC_BATCH_LIMIT="$CONVERSATION_SYNC_BATCH_LIMIT" --project-ref "${SUPABASE_PROJECT_REF:-}"
fi

if [ -n "$CONVERSATION_SYNC_EVENTS_BATCH_SIZE" ]; then
    echo "✅ Setting CONVERSATION_SYNC_EVENTS_BATCH_SIZE..."
    supabase secrets set CONVERSATION_SYNC_EVENTS_BATCH_SIZE="$CONVERSATION_SYNC_EVENTS_BATCH_SIZE" --project-ref "${SUPABASE_PROJECT_REF:-}"
fi

echo ""
echo "✅ Secrets configured successfully!"
echo ""
echo "📋 To verify secrets, run:"
echo "   supabase secrets list"
echo ""
echo "⚠️  Note: Functions will need to be redeployed to use the new secrets."
echo "   Run: pnpm supabase:functions:deploy:all"
