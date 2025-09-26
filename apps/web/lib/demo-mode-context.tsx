'use client';

import React, { createContext, useContext, useState } from 'react';

export interface MockAgent {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'inactive' | 'agent_paused';
  created_at: string;
  updated_at: string;
}

export interface MockCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface MockConversation {
  id: string;
  agent_id: string;
  campaign_id: string;
  lead_id: string;
  status: 'completed' | 'in_progress' | 'failed';
  outcome: 'donated' | 'callback requested' | 'no_answer' | 'not_interested';
  duration_seconds: number;
  created_at: string;
  updated_at: string;
}

interface DemoModeContextType {
  isDemoMode: boolean;
  isCallHenkDomain: boolean;
  mockAgents: MockAgent[];
  mockCampaigns: MockCampaign[];
  mockConversations: MockConversation[];
}

const DemoModeContext = createContext<DemoModeContextType | null>(null);

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}

function generateMockData() {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mockAgents: MockAgent[] = [
    {
      id: 'agent-1',
      name: 'Sarah Mitchell',
      status: 'active',
      created_at: new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'agent-2',
      name: 'Michael Rodriguez',
      status: 'active',
      created_at: new Date(
        now.getTime() - 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'agent-3',
      name: 'Emma Thompson',
      status: 'paused',
      created_at: new Date(
        now.getTime() - 21 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'agent-4',
      name: 'David Chen',
      status: 'active',
      created_at: new Date(
        now.getTime() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'agent-5',
      name: 'Lisa Johnson',
      status: 'inactive',
      created_at: new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const mockCampaigns: MockCampaign[] = [
    {
      id: 'campaign-1',
      name: 'Annual Giving Campaign 2024',
      status: 'active',
      created_at: new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'campaign-2',
      name: 'Emergency Relief Fund',
      status: 'active',
      created_at: new Date(
        now.getTime() - 15 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'campaign-3',
      name: 'Education Support Initiative',
      status: 'paused',
      created_at: new Date(
        now.getTime() - 45 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 5 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: 'campaign-4',
      name: 'Healthcare Access Program',
      status: 'active',
      created_at: new Date(
        now.getTime() - 20 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Generate conversations across multiple days with realistic patterns
  const mockConversations: MockConversation[] = [];

  // Generate conversations for the last 7 days
  for (let day = 0; day < 7; day++) {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() - day);

    // More calls during business hours
    const callsForDay = day === 0 ? 24 : Math.floor(Math.random() * 15) + 8; // Today has 24 calls

    for (let call = 0; call < callsForDay; call++) {
      // Generate realistic business hours (9 AM - 6 PM)
      const hour = Math.floor(Math.random() * 9) + 9;
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);

      const callTime = new Date(dayDate);
      callTime.setHours(hour, minute, second);

      const outcomes = [
        'donated',
        'callback requested',
        'no_answer',
        'not_interested',
      ] as const;

      // Higher success rate for demo
      const outcome: MockConversation['outcome'] =
        Math.random() < 0.35
          ? 'donated'
          : outcomes[Math.floor(Math.random() * outcomes.length)]!;
      const status: 'completed' | 'in_progress' | 'failed' =
        outcome === 'donated' || outcome === 'callback requested'
          ? 'completed'
          : Math.random() < 0.8
            ? 'completed'
            : 'failed';

      const selectedAgent =
        mockAgents[Math.floor(Math.random() * mockAgents.length)];
      const selectedCampaign =
        mockCampaigns[Math.floor(Math.random() * mockCampaigns.length)];

      if (selectedAgent && selectedCampaign) {
        mockConversations.push({
          id: `conv-${day}-${call}`,
          agent_id: selectedAgent.id,
          campaign_id: selectedCampaign.id,
          lead_id: `lead-${Math.random().toString(36).substr(2, 9)}`,
          status,
          outcome,
          duration_seconds: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
          created_at: callTime.toISOString(),
          updated_at: callTime.toISOString(),
        });
      }
    }
  }

  // Sort conversations by created_at descending (most recent first)
  mockConversations.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return { mockAgents, mockCampaigns, mockConversations };
}

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    // Check localStorage first for persisted demo mode
    if (typeof window !== 'undefined') {
      return localStorage.getItem('demo-mode-active') === 'true';
    }
    return false;
  });
  const [isCallHenkDomain, setIsCallHenkDomain] = useState(false);
  const [mockData] = useState(generateMockData());

  // Check URL parameters and domain
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isCallHenk =
        hostname === 'callhenk.com' ||
        hostname === 'www.callhenk.com' ||
        hostname === 'localhost' || // Allow localhost for development
        hostname === '127.0.0.1';
      setIsCallHenkDomain(isCallHenk);

      const checkDemoMode = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const demoParam = urlParams.get('demo');

        if (isCallHenk && demoParam === 'true') {
          // Activate demo mode and persist it
          setIsDemoMode(true);
          localStorage.setItem('demo-mode-active', 'true');
        } else if (demoParam === 'false') {
          // Explicitly deactivate demo mode
          setIsDemoMode(false);
          localStorage.removeItem('demo-mode-active');
        }
        // If no demo parameter, keep current state (don't change)
      };

      // Check on initial load
      checkDemoMode();

      // Listen for navigation changes (for client-side routing)
      const handleLocationChange = () => {
        checkDemoMode();
      };

      // Listen for popstate events (back/forward navigation)
      window.addEventListener('popstate', handleLocationChange);

      return () => {
        window.removeEventListener('popstate', handleLocationChange);
      };
    }
  }, []);

  const contextValue: DemoModeContextType = {
    isDemoMode,
    isCallHenkDomain,
    mockAgents: mockData.mockAgents,
    mockCampaigns: mockData.mockCampaigns,
    mockConversations: mockData.mockConversations,
  };

  return (
    <DemoModeContext.Provider value={contextValue}>
      {children}
    </DemoModeContext.Provider>
  );
}
