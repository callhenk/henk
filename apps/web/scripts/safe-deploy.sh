#!/bin/bash

# Safe Supabase Deploy Script
# This script adds multiple safeguards to prevent accidental production deployments

set -e

echo "⚠️  WARNING: You are about to deploy database changes to PRODUCTION"
echo ""
echo "This will:"
echo "  - Link to the production Supabase project"
echo "  - Push ALL pending migrations to production"
echo "  - Potentially affect live user data"
echo ""

# Check if SUPABASE_PROJECT_REF is set
if [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo "❌ ERROR: SUPABASE_PROJECT_REF environment variable is not set"
  echo "This is a safety measure to prevent accidental deployments."
  echo ""
  echo "To deploy, you must explicitly set the project ref:"
  echo "  export SUPABASE_PROJECT_REF=your-project-ref"
  echo "  pnpm supabase:deploy:safe"
  exit 1
fi

echo "Project Ref: $SUPABASE_PROJECT_REF"
echo ""

# Require explicit confirmation
read -p "Type 'DEPLOY TO PRODUCTION' to continue: " confirmation

if [ "$confirmation" != "DEPLOY TO PRODUCTION" ]; then
  echo ""
  echo "❌ Deployment cancelled. Confirmation text did not match."
  exit 1
fi

echo ""
echo "🔍 Checking for pending migrations..."
migration_count=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ')
echo "Found $migration_count migration files"
echo ""

# Final confirmation
read -p "Are you absolutely sure? Type 'YES' to proceed: " final_confirmation

if [ "$final_confirmation" != "YES" ]; then
  echo ""
  echo "❌ Deployment cancelled."
  exit 1
fi

echo ""
echo "🚀 Starting production deployment..."
echo ""

# Link and push
supabase link --project-ref "$SUPABASE_PROJECT_REF"
supabase db push

echo ""
echo "✅ Deployment completed successfully"
