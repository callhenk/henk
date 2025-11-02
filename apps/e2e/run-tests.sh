#!/bin/bash

# E2E Test Runner Script
# This script ensures all prerequisites are met before running tests

set -e  # Exit on error

echo "🚀 E2E Test Runner"
echo "=================="
echo ""

# Check if Supabase is running
echo "1️⃣  Checking Supabase..."
cd ../web
if ! supabase status > /dev/null 2>&1; then
    echo "   Starting Supabase..."
    supabase start
else
    echo "   ✅ Supabase is running"
fi

# Get Supabase URLs
SUPABASE_URL=$(supabase status | grep "API URL" | awk '{print $3}')
INBUCKET_URL=$(supabase status | grep "Inbucket URL" | awk '{print $3}')

echo "   API URL: $SUPABASE_URL"
echo "   Inbucket: $INBUCKET_URL"
echo ""

# Check .env.local
echo "2️⃣  Checking environment..."
if [ -f ".env.local" ]; then
    LOCAL_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d'=' -f2)
    if [ "$LOCAL_URL" == "$SUPABASE_URL" ]; then
        echo "   ✅ .env.local is correctly configured"
    else
        echo "   ⚠️  .env.local URL mismatch!"
        echo "   Expected: $SUPABASE_URL"
        echo "   Found: $LOCAL_URL"
    fi
else
    echo "   ❌ .env.local not found!"
    exit 1
fi
echo ""

# Start dev server in background
echo "3️⃣  Starting dev server..."
echo "   Running: pnpm --filter web dev"

# Kill any existing dev server on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start dev server in background
cd /Users/cyrus/henk/henk
pnpm --filter web dev > /tmp/e2e-dev-server.log 2>&1 &
DEV_SERVER_PID=$!

echo "   Dev server PID: $DEV_SERVER_PID"
echo "   Waiting for server to start..."

# Wait for server to be ready
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "   ✅ Dev server is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ❌ Dev server failed to start"
        kill $DEV_SERVER_PID 2>/dev/null || true
        cat /tmp/e2e-dev-server.log
        exit 1
    fi
    sleep 1
done
echo ""

# Run tests
echo "4️⃣  Running tests..."
cd apps/e2e

# Run the tests
if [ "$1" == "" ]; then
    echo "   Running all tests..."
    pnpm exec playwright test
else
    echo "   Running: $@"
    pnpm exec playwright test "$@"
fi

TEST_EXIT_CODE=$?

# Cleanup
echo ""
echo "5️⃣  Cleaning up..."
echo "   Stopping dev server..."
kill $DEV_SERVER_PID 2>/dev/null || true

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Tests completed successfully!"
else
    echo ""
    echo "❌ Tests failed with exit code: $TEST_EXIT_CODE"
    echo "   Dev server log: /tmp/e2e-dev-server.log"
fi

exit $TEST_EXIT_CODE
