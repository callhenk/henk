'use client';

import Link from 'next/link';

import { Loader2, Plus } from 'lucide-react';

import { Tables } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import { Separator } from '@kit/ui/separator';

type AgentRow = Tables<'agents'>['Row'];

interface ReviewProps {
  basics: {
    campaign_name: string;
    fundraising_goal?: number;
    start_date?: Date;
    end_date?: Date;
    agent_id: string;
  };
  calling: {
    goal_metric: string;
    call_window_start: string;
    call_window_end: string;
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
  onCreate: () => void | Promise<void>;
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
  onCreate,
}: ReviewProps) {
  return (
    <div className="space-y-5">
      <div className="px-0 pt-0 text-base font-medium">Review & Launch</div>

      <div className="rounded-md">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-medium">Basics</div>
          <Button variant="link" size="sm" onClick={() => onEditStep(1)}>
            Edit
          </Button>
        </div>
        <div className="text-sm">Name: {basics.campaign_name || '-'}</div>
        <div className="text-sm">
          Dates: {basics.start_date?.toLocaleDateString() || '-'} →{' '}
          {basics.end_date?.toLocaleDateString() || '—'}
        </div>
        <div className="text-sm">
          Goal:{' '}
          {typeof basics.fundraising_goal === 'number'
            ? `$${basics.fundraising_goal.toLocaleString()}`
            : '—'}
        </div>
        <div className="text-sm">
          Agent: {agents.find((a) => a.id === basics.agent_id)?.name || '-'}
        </div>
      </div>

      <Separator />
      <div className="rounded-md">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-medium">Calling & Voice</div>
          <Button variant="link" size="sm" onClick={() => onEditStep(2)}>
            Edit
          </Button>
        </div>
        <div className="text-sm">
          Goal metric:{' '}
          {calling.goal_metric
            .replace('_', ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())}
        </div>

        <div className="text-sm">
          Call window: {calling.call_window_start} – {calling.call_window_end}{' '}
          (UTC)
        </div>

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

      <Separator />
      <div className="rounded-md">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-medium">Audience</div>
          <Button variant="link" size="sm" onClick={() => onEditStep(3)}>
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

      {!canActivate && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Missing required fields:</strong>
            <ul className="mt-1 list-inside list-disc space-y-1">
              {!basics.campaign_name && <li>Campaign name is required</li>}
              {!basics.agent_id && <li>Agent must be selected</li>}
            </ul>
          </div>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            disabled={!canActivate || isActing}
            onClick={() => void onCreate()}
            className="min-w-36"
          >
            {isActing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating campaign...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create campaign
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReviewStep;
