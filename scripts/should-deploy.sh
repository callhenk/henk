#!/bin/bash

# Exit on error
set -e

echo "🚀 Checking if deployment should proceed..."

# Get the current branch name from Vercel environment variable or git
BRANCH="${VERCEL_GIT_COMMIT_REF:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")}"

echo "Current branch: $BRANCH"

# Always deploy on main branch
if [[ "$BRANCH" == "main" ]]; then
  echo "✅ Deploying: main branch"
  exit 1  # Exit 1 tells Vercel to proceed with deployment
fi

# Check for DEPLOY_PR environment variable to force deployment on specific PRs
# Set this in Vercel project settings or PR environment to enable preview deployments
if [[ "$DEPLOY_PR" == "true" ]]; then
  echo "✅ Deploying: DEPLOY_PR=true set"
  exit 1
fi

# Check for deploy label in PR title (e.g., "[deploy]" or "[preview]")
COMMIT_MESSAGE=$(git log -1 --pretty=%B 2>/dev/null || echo "")
if [[ "$COMMIT_MESSAGE" == *"[deploy]"* ]] || [[ "$COMMIT_MESSAGE" == *"[preview]"* ]]; then
  echo "✅ Deploying: [deploy] or [preview] tag found in commit message"
  exit 1
fi

# Skip deployment for all other cases
echo "⏭️  Skipping deployment: not on main branch and no deploy condition met"
echo "💡 To deploy this PR, either:"
echo "   - Set DEPLOY_PR=true in Vercel environment variables, or"
echo "   - Add [deploy] or [preview] to your commit message"
exit 0  # Exit 0 tells Vercel to skip deployment
