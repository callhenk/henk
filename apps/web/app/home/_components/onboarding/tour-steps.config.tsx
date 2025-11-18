'use client';

import { Bot, LayoutDashboard, Megaphone, Plug, Users } from 'lucide-react';
import type { Step } from 'onborda';

// Tour type structure for Onborda
interface Tour {
  tour: string;
  steps: Step[];
}

export const onboardingTours: Tour[] = [
  {
    tour: 'onboarding',
    steps: [
      {
        icon: <LayoutDashboard className="h-5 w-5" />,
        title: 'Welcome to Your Fundraising Command Center',
        content:
          'Track campaigns, monitor AI agent performance, and manage donor relationships all in one place.',
        selector: 'a[href="/home"]',
        side: 'right',
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 8,
        nextRoute: '/home',
        prevRoute: '/home',
      },
      {
        icon: <Bot className="h-5 w-5" />,
        title: 'Create Your First AI Agent',
        content:
          'AI voice agents powered by ElevenLabs make fundraising calls for you. Click below to create one now.',
        selector: 'a[href="/home/agents"]',
        side: 'right',
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 8,
        nextRoute: '/home/agents',
        prevRoute: '/home',
      },
      {
        icon: <Users className="h-5 w-5" />,
        title: 'Import Your Leads',
        content:
          'Upload a CSV, sync from Salesforce, or add contacts manually. Your lead data is the foundation of successful campaigns.',
        selector: 'a[href="/home/leads"]',
        side: 'right',
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 8,
        nextRoute: '/home/leads',
        prevRoute: '/home/agents',
      },
      {
        icon: <Plug className="h-5 w-5" />,
        title: 'Supercharge with Integrations',
        content:
          'Connect Salesforce, HubSpot, or other CRMs to sync donor data automatically and keep everything up to date.',
        selector: 'a[href="/home/integrations"]',
        side: 'right',
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 8,
        nextRoute: '/home/integrations',
        prevRoute: '/home/leads',
      },
      {
        icon: <Megaphone className="h-5 w-5" />,
        title: 'Launch Your First Campaign',
        content:
          'Combine agents, donors, and workflows to start making calls. This is where the magic happens!',
        selector: 'a[href="/home/campaigns"]',
        side: 'right',
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 8,
        nextRoute: '/home/campaigns',
        prevRoute: '/home/integrations',
      },
    ],
  },
];
