'use client';

import Link from 'next/link';

import { Pause, Play, Save } from 'lucide-react';

import { Tables } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

type AgentRow = Tables<'agents'>['Row'];

interface ReviewProps {
  basics: {
    campaign_name: string;
    fundraising_goal: number;
    start_date?: Date;
    end_date?: Date;
    agent_id: string;
  };
  calling: {
    goal_metric: string;
    disclosure_line: string;
    call_window_start: string;
    call_window_end: string;
    caller_id: string;
  };
  audience: {
    audience_contact_count: number;
    dedupe_by_phone: boolean;
    exclude_dnc: boolean;
  };
  agents: AgentRow[];
  canActivate: boolean;
  isActing: boolean;
  onBack: () => void;
  onEditStep: (step: 1 | 2 | 3) => void;
  onSetStatus: (status: 'active' | 'draft' | 'paused') => void | Promise<void>;
}

export function ReviewStep({
  basics,
  calling,
  audience,
  agents,
  canActivate,
  isActing,
  onBack,
  onEditStep,
  onSetStatus,
}: ReviewProps) {
  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-base">Review & Launch</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 rounded-xl bg-white/40 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:bg-zinc-900/40 dark:ring-white/10">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">Basics</div>
              <Button
                variant="link"
                size="sm"
                onClick={() => onEditStep(1)}
                className="px-0 text-sm"
              >
                Edit
              </Button>
            </div>
            <div className="text-sm">Name: {basics.campaign_name || '-'}</div>
            <div className="text-sm">
              Dates: {basics.start_date?.toLocaleDateString() || '-'} →{' '}
              {basics.end_date?.toLocaleDateString() || '—'}
            </div>
            <div className="text-sm">Goal: {basics.fundraising_goal}</div>
            <div className="text-sm">
              Agent: {agents.find((a) => a.id === basics.agent_id)?.name || '-'}
            </div>
          </div>
          <div className="rounded-md p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">Calling & Voice</div>
              <Button
                variant="link"
                size="sm"
                onClick={() => onEditStep(2)}
                className="px-0 text-sm"
              >
                Edit
              </Button>
            </div>
            <div className="text-sm">Goal metric: {calling.goal_metric}</div>
            <div className="text-sm">Disclosure: {calling.disclosure_line}</div>
            <div className="text-sm">
              Call window: {calling.call_window_start} –{' '}
              {calling.call_window_end}
            </div>
            <div className="text-sm">Caller ID: {calling.caller_id || '-'}</div>
            {basics.agent_id && (
              <div className="text-sm">
                Agent page:{' '}
                <Link
                  className="underline"
                  target="_blank"
                  href={`/home/agents/${basics.agent_id}`}
                >
                  Open
                </Link>
              </div>
            )}
          </div>
          <div className="rounded-md p-4 md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">Audience</div>
              <Button
                variant="link"
                size="sm"
                onClick={() => onEditStep(3)}
                className="px-0 text-sm"
              >
                Edit
              </Button>
            </div>
            <div className="text-sm">
              Contacts: {audience.audience_contact_count}
            </div>
            <div className="text-sm">
              Dedupe: {audience.dedupe_by_phone ? 'On' : 'Off'}
            </div>
            <div className="text-sm">
              Exclude DNC: {audience.exclude_dnc ? 'On' : 'Off'}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void onSetStatus('draft')}>
              <Save className="mr-2 h-4 w-4" /> Save as draft
            </Button>
            <Button
              disabled={!canActivate || isActing}
              onClick={() => void onSetStatus('active')}
              className="min-w-36"
            >
              <Play className="mr-2 h-4 w-4" /> Activate campaign
            </Button>
            <Button
              variant="outline"
              onClick={() => void onSetStatus('paused')}
              disabled={isActing}
            >
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReviewStep;
