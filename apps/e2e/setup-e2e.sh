#!/bin/bash

# E2E Testing Setup Script
# This script automates the setup process for E2E testing

set -e  # Exit on error

echo "🚀 Setting up E2E testing environment..."
echo ""

# Check if we're in the right directory
if [ ! -f "../../package.json" ]; then
    echo "❌ Error: Please run this script from apps/e2e directory"
    exit 1
fi

# Step 1: Check if Supabase is running
echo "1️⃣  Checking Supabase status..."
cd ../web
if ! supabase status > /dev/null 2>&1; then
    echo "   Starting Supabase..."
    supabase start
else
    echo "   ✅ Supabase is already running"
fi

# Get Supabase details
SUPABASE_URL=$(supabase status | grep "API URL" | awk '{print $3}')
INBUCKET_URL=$(supabase status | grep "Inbucket URL" | awk '{print $3}')

echo "   Supabase API: $SUPABASE_URL"
echo "   Inbucket: $INBUCKET_URL"
echo ""

# Step 2: Check .env.local
echo "2️⃣  Checking environment configuration..."
if [ -f ".env.local" ]; then
    LOCAL_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d'=' -f2)
    if [ "$LOCAL_URL" == "$SUPABASE_URL" ]; then
        echo "   ✅ .env.local is correctly configured"
    else
        echo "   ⚠️  .env.local exists but URL doesn't match"
        echo "   Expected: $SUPABASE_URL"
        echo "   Found: $LOCAL_URL"
    fi
else
    echo "   ✅ .env.local already created by Claude"
fi
echo ""

# Step 3: Check if test user exists
echo "3️⃣  Checking for test user..."
TEST_EMAIL="cyrus@callhenk.com"

# Query the database for the user
USER_EXISTS=$(psql "$SUPABASE_URL/postgres?user=postgres&password=postgres" -t -c "SELECT EXISTS(SELECT 1 FROM auth.users WHERE email='$TEST_EMAIL');" 2>/dev/null || echo "f")

if [ "$USER_EXISTS" == " t" ]; then
    echo "   ✅ Test user exists: $TEST_EMAIL"
else
    echo "   ⚠️  Test user NOT found: $TEST_EMAIL"
    echo ""
    echo "   📝 To create the test user, choose one option:"
    echo ""
    echo "   Option A: Through the UI (Recommended)"
    echo "   1. Start dev server: pnpm dev"
    echo "   2. Go to http://localhost:3000/auth/sign-up"
    echo "   3. Sign up with: $TEST_EMAIL / Test123?"
    echo "   4. Confirm email in Inbucket: $INBUCKET_URL"
    echo ""
    echo "   Option B: Through Supabase Studio"
    echo "   1. Open Studio: http://localhost:54323"
    echo "   2. Go to Authentication → Users → Add User"
    echo "   3. Email: $TEST_EMAIL, Password: Test123?, Auto Confirm: ✅"
    echo "   4. Run: supabase db reset"
    echo ""
fi

# Step 4: Summary
echo ""
echo "📊 Setup Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Supabase:     $SUPABASE_URL"
echo "Inbucket:     $INBUCKET_URL"
echo "Studio:       http://localhost:54323"
echo "Test Email:   $TEST_EMAIL"
echo "Password:     Test123?"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$USER_EXISTS" == " t" ]; then
    echo "✅ Ready to run tests!"
    echo ""
    echo "Run tests:"
    echo "  pnpm test:pages      # Page-based tests"
    echo "  pnpm test:smoke      # Smoke test"
    echo "  pnpm test:e2e        # All E2E tests"
else
    echo "⚠️  Please create the test user first (see instructions above)"
fi

echo ""
echo "📚 For detailed setup instructions, see:"
echo "   apps/e2e/E2E_SETUP.md"
echo ""
