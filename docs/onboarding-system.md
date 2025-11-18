# User Onboarding System - Henk Platform

## Executive Summary

This document outlines the implementation of an interactive user onboarding system for the Henk fundraising platform using **Onborda**, a modern product tour library built specifically for Next.js App Router applications.

## Feature Flag Control

The onboarding system is controlled by the `enableUserOnboarding` feature flag:

**Environment Variable:**
```bash
NEXT_PUBLIC_ENABLE_USER_ONBOARDING=true  # Enable (default)
NEXT_PUBLIC_ENABLE_USER_ONBOARDING=false # Disable
```

**Configuration:** `apps/web/config/feature-flags.config.ts`
- Default: `true` (enabled in development)
- Checked in: `OnboardingWelcomeModal` and `OnboardingManager`
- Useful for: Disabling during E2E tests, staging environments, or gradual rollouts

## Why Onborda?

### Perfect Stack Alignment

| Requirement | Onborda | Alternative (Driver.js) |
|------------|---------|------------------------|
| Next.js 15 App Router | ✅ Native support | ⚠️ Works but not optimized |
| Framer Motion | ✅ Already uses it | ❌ No animation library |
| TypeScript | ✅ TypeScript-first | ✅ TypeScript support |
| shadcn/ui compatibility | ✅ Perfect match | ⚠️ Requires custom styling |
| Bundle impact | ~20KB (Framer Motion already in bundle) | ~5KB + custom animations |
| Maintenance | ✅ Active, modern | ✅ Active |

### Key Benefits

- **Zero extra dependencies**: Uses Framer Motion already in your stack
- **Native Next.js 15**: Built for App Router, Server Components friendly
- **TypeScript-first**: Full type safety out of the box
- **shadcn/ui compatible**: Styling matches your design system
- **Modern animations**: Smooth, professional transitions
- **Lightweight**: Only ~20KB, and Framer Motion is already included

## Onboarding Flow Design

### User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEW USER FIRST LOGIN                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Welcome Modal: "Welcome to Henk! Take a 2-minute tour?"        │
│  [Start Tour]  [Skip - I'll explore on my own]                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
            [Start Tour]            [Skip]
                    ↓                   ↓
        ┌───────────────────┐    Store preference
        │  Interactive Tour  │    Show "Restart Tour"
        │   (5 core steps)   │    in help menu
        └───────────────────┘
                    ↓
        ┌───────────────────────────────────────┐
        │ Step 1: Dashboard Overview            │
        │ "This is your command center"         │
        └───────────────────────────────────────┘
                    ↓
        ┌───────────────────────────────────────┐
        │ Step 2: Create AI Agent               │
        │ "Create your first voice agent"       │
        │ [Interactive: Click "Create Agent"]   │
        └───────────────────────────────────────┘
                    ↓
        ┌───────────────────────────────────────┐
        │ Step 3: Import Donors                 │
        │ "Add contacts to call"                │
        │ [Interactive: Click "Import Donors"]  │
        └───────────────────────────────────────┘
                    ↓
        ┌───────────────────────────────────────┐
        │ Step 4: Connect Integrations          │
        │ "Sync with Salesforce or HubSpot"     │
        │ [Interactive: View Integrations]      │
        └───────────────────────────────────────┘
                    ↓
        ┌───────────────────────────────────────┐
        │ Step 5: Launch Campaign               │
        │ "Put it all together"                 │
        │ [Interactive: Click "Create Campaign"]│
        └───────────────────────────────────────┘
                    ↓
        ┌───────────────────────────────────────┐
        │ Completion Modal                      │
        │ "🎉 You're all set! Ready to start?"  │
        │ [Go to Dashboard]                     │
        └───────────────────────────────────────┘
```

### Detailed Tour Steps

#### Step 1: Dashboard Overview
- **Target**: Main dashboard area
- **Title**: "Welcome to Your Fundraising Command Center"
- **Description**: "Track campaigns, monitor AI agent performance, and manage donor relationships all in one place."
- **Action**: None (informational)
- **Duration**: Auto-advance after 3 seconds or manual next

#### Step 2: AI Agents
- **Target**: `[data-tour="agents-nav"]` (Agents sidebar item)
- **Title**: "Create Your First AI Agent"
- **Description**: "AI voice agents make fundraising calls for you. Let's create one now."
- **Action**: Interactive - User must click to proceed
- **Highlight**: Agents navigation item with pulsing animation
- **Next**: Navigates to `/home/agents`

#### Step 3: Donors/Contacts
- **Target**: `[data-tour="donors-import"]` (Import button on donors page)
- **Title**: "Import Your Donors"
- **Description**: "Upload a CSV, sync from Salesforce, or add contacts manually."
- **Action**: Interactive - Shows import modal preview
- **Highlight**: Import button with tooltip
- **Next**: Returns to dashboard or proceeds

#### Step 4: Integrations
- **Target**: `[data-tour="integrations-nav"]`
- **Title**: "Supercharge with Integrations"
- **Description**: "Connect Salesforce, HubSpot, or other CRMs to sync donor data automatically."
- **Action**: Interactive - View integrations page
- **Highlight**: Integrations sidebar item
- **Next**: Navigates to `/home/integrations`

#### Step 5: Campaigns
- **Target**: `[data-tour="create-campaign"]`
- **Title**: "Launch Your First Campaign"
- **Description**: "Combine agents, donors, and workflows to start making calls."
- **Action**: Interactive - Opens campaign creation flow
- **Highlight**: Create Campaign button
- **Completion**: Shows success modal

### Progress Indicators

```
Step 1/5: Dashboard    [████░░░░░░░░░░░░░░░░] 20%
Step 2/5: Agents       [████████░░░░░░░░░░░░] 40%
Step 3/5: Donors       [████████████░░░░░░░░] 60%
Step 4/5: Integrations [████████████████░░░░] 80%
Step 5/5: Campaigns    [████████████████████] 100%
```

## Technical Implementation

### Installation

```bash
pnpm add onborda
```

### Directory Structure

```
apps/web/
├── app/
│   └── home/
│       └── _components/
│           └── onboarding/
│               ├── onboarding-provider.tsx      # Context provider
│               ├── onboarding-welcome-modal.tsx # Welcome modal
│               ├── onboarding-completion.tsx    # Success modal
│               └── tour-steps.config.tsx        # Tour step definitions
├── lib/
│   └── hooks/
│       └── use-onboarding.ts                    # Custom hook
└── components/
    └── onboarding/
        └── onboarding-trigger.tsx               # Restart tour button
```

### Core Implementation

#### 1. Database Schema

Add to Supabase migrations:

```sql
-- Add onboarding tracking to user profiles
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_skipped BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_current_step INTEGER DEFAULT 0;

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_team_members_onboarding
ON team_members(onboarding_completed, onboarding_skipped);
```

#### 2. Tour Steps Configuration

**File**: `apps/web/app/home/_components/onboarding/tour-steps.config.tsx`

```typescript
'use client';

import type { Step } from 'onborda';
import {
  LayoutDashboard,
  Bot,
  Users,
  Plug,
  Megaphone
} from 'lucide-react';

export const tourSteps: Step[] = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: 'Welcome to Your Fundraising Command Center',
    content: 'Track campaigns, monitor AI agent performance, and manage donor relationships all in one place.',
    selector: '[data-tour="dashboard"]',
    side: 'top',
    showControls: true,
    pointerPadding: 10,
    pointerRadius: 8,
    nextRoute: '/home',
    prevRoute: '/home',
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: 'Create Your First AI Agent',
    content: 'AI voice agents powered by ElevenLabs make fundraising calls for you. Click below to create one now.',
    selector: '[data-tour="agents-nav"]',
    side: 'right',
    showControls: true,
    pointerPadding: 10,
    pointerRadius: 8,
    nextRoute: '/home/agents',
    prevRoute: '/home',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Import Your Donors',
    content: 'Upload a CSV, sync from Salesforce, or add contacts manually. Your donor data is the foundation of successful campaigns.',
    selector: '[data-tour="donors-nav"]',
    side: 'right',
    showControls: true,
    pointerPadding: 10,
    pointerRadius: 8,
    nextRoute: '/home/donors',
    prevRoute: '/home/agents',
  },
  {
    icon: <Plug className="h-5 w-5" />,
    title: 'Supercharge with Integrations',
    content: 'Connect Salesforce, HubSpot, or other CRMs to sync donor data automatically and keep everything up to date.',
    selector: '[data-tour="integrations-nav"]',
    side: 'right',
    showControls: true,
    pointerPadding: 10,
    pointerRadius: 8,
    nextRoute: '/home/integrations',
    prevRoute: '/home/donors',
  },
  {
    icon: <Megaphone className="h-5 w-5" />,
    title: 'Launch Your First Campaign',
    content: 'Combine agents, donors, and workflows to start making calls. This is where the magic happens!',
    selector: '[data-tour="campaigns-nav"]',
    side: 'right',
    showControls: true,
    pointerPadding: 10,
    pointerRadius: 8,
    nextRoute: '/home/campaigns',
    prevRoute: '/home/integrations',
  },
];
```

#### 3. Custom Hook for State Management

**File**: `apps/web/lib/hooks/use-onboarding.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  isCompleted: boolean;
  isSkipped: boolean;
  showWelcome: boolean;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isActive: false,
    currentStep: 0,
    isCompleted: false,
    isSkipped: false,
    showWelcome: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Load onboarding state from database
  useEffect(() => {
    async function loadOnboardingState() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: teamMember } = await supabase
        .from('team_members')
        .select('onboarding_completed, onboarding_skipped, onboarding_current_step')
        .eq('user_id', user.id)
        .single();

      if (teamMember) {
        setState({
          isActive: false,
          currentStep: teamMember.onboarding_current_step || 0,
          isCompleted: teamMember.onboarding_completed || false,
          isSkipped: teamMember.onboarding_skipped || false,
          showWelcome: !teamMember.onboarding_completed && !teamMember.onboarding_skipped,
        });
      }

      setIsLoading(false);
    }

    loadOnboardingState();
  }, [supabase]);

  // Start the tour
  const startTour = useCallback(async () => {
    setState(prev => ({ ...prev, isActive: true, showWelcome: false }));
    router.push('/home');
  }, [router]);

  // Skip the tour
  const skipTour = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('team_members')
      .update({ onboarding_skipped: true })
      .eq('user_id', user.id);

    setState(prev => ({
      ...prev,
      isSkipped: true,
      showWelcome: false,
      isActive: false
    }));
  }, [supabase]);

  // Complete the tour
  const completeTour = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('team_members')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    setState(prev => ({
      ...prev,
      isCompleted: true,
      isActive: false
    }));
  }, [supabase]);

  // Update current step
  const updateStep = useCallback(async (step: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('team_members')
      .update({ onboarding_current_step: step })
      .eq('user_id', user.id);

    setState(prev => ({ ...prev, currentStep: step }));
  }, [supabase]);

  // Restart tour
  const restartTour = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('team_members')
      .update({
        onboarding_completed: false,
        onboarding_skipped: false,
        onboarding_current_step: 0,
      })
      .eq('user_id', user.id);

    setState({
      isActive: true,
      currentStep: 0,
      isCompleted: false,
      isSkipped: false,
      showWelcome: false,
    });

    router.push('/home');
  }, [supabase, router]);

  return {
    ...state,
    isLoading,
    startTour,
    skipTour,
    completeTour,
    updateStep,
    restartTour,
  };
}
```

#### 4. Welcome Modal Component

**File**: `apps/web/app/home/_components/onboarding/onboarding-welcome-modal.tsx`

```typescript
'use client';

import { useOnboarding } from '@/lib/hooks/use-onboarding';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Button } from '@kit/ui/button';
import { Sparkles, X } from 'lucide-react';

export function OnboardingWelcomeModal() {
  const { showWelcome, startTour, skipTour } = useOnboarding();

  return (
    <Dialog open={showWelcome} onOpenChange={(open) => !open && skipTour()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome to Henk!
          </DialogTitle>
          <DialogDescription className="text-center">
            Take a quick 2-minute tour to learn how to create AI agents,
            import donors, and launch your first fundraising campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              1
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Create AI Agents</p>
              <p className="text-xs text-muted-foreground">
                Set up voice agents to make fundraising calls
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border p-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              2
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Import Donors</p>
              <p className="text-xs text-muted-foreground">
                Upload contacts or sync from your CRM
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border p-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              3
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Launch Campaigns</p>
              <p className="text-xs text-muted-foreground">
                Put it all together and start fundraising
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={startTour} size="lg" className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Start Tour
          </Button>
          <Button
            onClick={skipTour}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            Skip - I'll explore on my own
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### 5. Onboarding Provider

**File**: `apps/web/app/home/_components/onboarding/onboarding-provider.tsx`

```typescript
'use client';

import { Onborda, OnbordaProvider } from 'onborda';
import { tourSteps } from './tour-steps.config';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { OnboardingWelcomeModal } from './onboarding-welcome-modal';

export function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { isActive, currentStep, completeTour, updateStep } = useOnboarding();

  return (
    <>
      <OnboardingWelcomeModal />
      <OnbordaProvider>
        <Onborda
          steps={tourSteps}
          showOnborda={isActive}
          onStepChange={(step) => updateStep(step)}
          onFinish={completeTour}
        >
          {children}
        </Onborda>
      </OnbordaProvider>
    </>
  );
}
```

#### 6. Restart Tour Button Component

**File**: `apps/web/components/onboarding/onboarding-trigger.tsx`

```typescript
'use client';

import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { Button } from '@kit/ui/button';
import { GraduationCap } from 'lucide-react';

export function RestartOnboardingButton() {
  const { restartTour, isLoading } = useOnboarding();

  return (
    <Button
      onClick={restartTour}
      variant="ghost"
      size="sm"
      disabled={isLoading}
      className="w-full justify-start"
    >
      <GraduationCap className="mr-2 h-4 w-4" />
      Restart Product Tour
    </Button>
  );
}
```

#### 7. Integration into Layout

**File**: `apps/web/app/home/layout.tsx`

```typescript
import { OnboardingWrapper } from './_components/onboarding/onboarding-provider';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingWrapper>
      {/* Existing layout code */}
      {children}
    </OnboardingWrapper>
  );
}
```

#### 8. Add data-tour Attributes to UI Elements

Update navigation and key UI elements to include tour targets:

**Example**: `apps/web/config/navigation.config.tsx`

```typescript
// Dashboard
{
  label: 'Dashboard',
  path: '/home',
  Icon: <LayoutDashboard className="h-4" />,
  // Add data attribute
  dataAttributes: { 'data-tour': 'dashboard' }
}

// Agents
{
  label: 'Agents',
  path: '/home/agents',
  Icon: <Bot className="h-4" />,
  dataAttributes: { 'data-tour': 'agents-nav' }
}

// Donors
{
  label: 'Donors',
  path: '/home/donors',
  Icon: <Users className="h-4" />,
  dataAttributes: { 'data-tour': 'donors-nav' }
}

// Integrations
{
  label: 'Integrations',
  path: '/home/integrations',
  Icon: <Plug className="h-4" />,
  dataAttributes: { 'data-tour': 'integrations-nav' }
}

// Campaigns
{
  label: 'Campaigns',
  path: '/home/campaigns',
  Icon: <Megaphone className="h-4" />,
  dataAttributes: { 'data-tour': 'campaigns-nav' }
}
```

## Styling Customization

### Onborda Theme Configuration

Create custom styling to match shadcn/ui theme:

**File**: `apps/web/app/globals.css`

```css
/* Onborda custom styling */
[data-onborda-wrapper] {
  @apply rounded-lg border border-border bg-background shadow-lg;
}

[data-onborda-content] {
  @apply text-foreground;
}

[data-onborda-title] {
  @apply text-lg font-semibold text-foreground;
}

[data-onborda-description] {
  @apply text-sm text-muted-foreground;
}

[data-onborda-button] {
  @apply rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90;
}

[data-onborda-button-secondary] {
  @apply rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground;
}

/* Spotlight overlay */
[data-onborda-overlay] {
  @apply bg-black/50 backdrop-blur-sm;
}
```

## User Experience Best Practices

### 1. Timing and Triggers

- **First login**: Show welcome modal immediately after user completes sign-up
- **Subsequent logins**: Never auto-show unless user manually restarts
- **Session persistence**: If user is mid-tour and logs out, resume from last step on next login

### 2. Mobile Responsiveness

```typescript
// Adjust step positioning for mobile
const tourSteps: Step[] = [
  {
    // ...step config
    side: 'top', // Use 'top' or 'bottom' for mobile instead of 'left'/'right'
    // Responsive adjustments
    mobilePosition: 'bottom',
  }
];
```

### 3. Keyboard Navigation

- **ESC**: Close tour
- **Arrow keys**: Navigate between steps
- **Enter**: Proceed to next step
- **Tab**: Focus on controls

### 4. Analytics Tracking

Add event tracking to measure onboarding effectiveness:

```typescript
// In useOnboarding hook
const startTour = useCallback(async () => {
  // Track event
  analytics.track('Onboarding Started', {
    timestamp: new Date().toISOString(),
  });

  setState(prev => ({ ...prev, isActive: true, showWelcome: false }));
  router.push('/home');
}, [router]);

const completeTour = useCallback(async () => {
  // Track completion
  analytics.track('Onboarding Completed', {
    timestamp: new Date().toISOString(),
    duration: /* calculate duration */,
  });

  await supabase
    .from('team_members')
    .update({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  setState(prev => ({
    ...prev,
    isCompleted: true,
    isActive: false
  }));
}, [supabase]);

const skipTour = useCallback(async () => {
  // Track skip
  analytics.track('Onboarding Skipped', {
    step: state.currentStep,
    timestamp: new Date().toISOString(),
  });

  // ... rest of skip logic
}, [supabase, state.currentStep]);
```

## Testing Checklist

### Functional Testing

- [ ] Welcome modal appears on first login
- [ ] Welcome modal does not appear on subsequent logins
- [ ] "Start Tour" button initiates onboarding flow
- [ ] "Skip" button properly dismisses and saves preference
- [ ] All 5 steps display correctly
- [ ] Progress indicator updates accurately
- [ ] Navigation between steps works (Next/Previous)
- [ ] Tour highlights correct UI elements
- [ ] Tour completion saves to database
- [ ] "Restart Tour" option works from user menu
- [ ] Tour state persists across page refreshes
- [ ] Tour state persists across logout/login

### Visual Testing

- [ ] Tooltips positioned correctly (not off-screen)
- [ ] Spotlight overlay dims background appropriately
- [ ] Animations are smooth (Framer Motion)
- [ ] Colors match shadcn/ui theme (light/dark mode)
- [ ] Mobile responsive (tooltips reposition)
- [ ] Icons render correctly in tour steps
- [ ] Progress bar is visible and accurate
- [ ] Typography is readable (font sizes, weights)

### Edge Cases

- [ ] User closes browser mid-tour
- [ ] User navigates away during tour
- [ ] Target element is not visible (scrolled off-screen)
- [ ] Target element doesn't exist (feature disabled)
- [ ] Multiple tabs/windows open
- [ ] Slow network connection
- [ ] User has completed tour but clicks "Restart"

### Accessibility

- [ ] Keyboard navigation works (Tab, Enter, ESC, Arrows)
- [ ] Screen reader announces tour content
- [ ] Focus management is correct
- [ ] Color contrast meets WCAG AA standards
- [ ] Tour can be dismissed easily
- [ ] No animation if user prefers reduced motion

## Performance Optimization

### Code Splitting

```typescript
// Lazy load onboarding components
import dynamic from 'next/dynamic';

const OnboardingWrapper = dynamic(
  () => import('./_components/onboarding/onboarding-provider').then(mod => mod.OnboardingWrapper),
  { ssr: false }
);
```

### Bundle Size Analysis

```bash
# Check bundle impact
pnpm analyze

# Expected additions:
# - onborda: ~20KB (gzipped: ~7KB)
# - No extra deps (Framer Motion already included)
```

## Maintenance and Updates

### Updating Tour Steps

1. Edit `tour-steps.config.tsx`
2. Add/remove/modify steps
3. Update step count in progress calculations
4. Test thoroughly
5. Deploy

### Adding New Features to Tour

1. Add `data-tour="feature-name"` attribute to new UI element
2. Create new step in `tour-steps.config.tsx`
3. Insert at appropriate position in tour flow
4. Update total step count
5. Test navigation and positioning

### Monitoring Metrics

Track these KPIs:

- **Completion rate**: % users who finish tour
- **Skip rate**: % users who skip tour
- **Drop-off points**: Which step do users abandon?
- **Time to complete**: Average duration
- **Restart rate**: % users who restart tour
- **Feature adoption**: % users who use features shown in tour

## Future Enhancements

### Phase 2 Features

1. **Contextual Tours**: Role-specific tours (Admin vs. User)
2. **Feature Announcements**: Highlight new features for existing users
3. **Inline Tooltips**: Just-in-time help for specific features
4. **Video Tutorials**: Embedded video walkthroughs
5. **Checklist**: Persistent onboarding checklist in sidebar
6. **Interactive Demos**: Sandbox mode to try features safely

### Advanced Personalization

```typescript
// Example: Role-based tours
const tourSteps = useMemo(() => {
  if (userRole === 'admin') {
    return adminTourSteps;
  } else if (userRole === 'fundraiser') {
    return fundraiserTourSteps;
  }
  return defaultTourSteps;
}, [userRole]);
```

## Support and Troubleshooting

### Common Issues

**Issue**: Tour doesn't start
- Check: Is `data-tour` attribute present on target elements?
- Check: Is `isActive` state set to `true`?
- Check: Are there console errors?

**Issue**: Tooltip positioned incorrectly
- Solution: Adjust `side` prop or add custom positioning
- Solution: Ensure target element is visible (not `display: none`)

**Issue**: Tour state not persisting
- Check: Database migration applied?
- Check: Supabase connection working?
- Check: RLS policies allow updates?

### Debug Mode

```typescript
// Add to useOnboarding hook for debugging
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Onboarding State:', state);
  }
}, [state]);
```

## Resources

- [Onborda Documentation](https://onborda.dev)
- [Onborda GitHub](https://github.com/uixmat/onborda)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-18 | Initial onboarding system design |

---

**Document Owner**: Engineering Team
**Last Updated**: 2025-11-18
**Status**: Ready for Implementation
