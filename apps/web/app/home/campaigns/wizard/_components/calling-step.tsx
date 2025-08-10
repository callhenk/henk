'use client';

import Link from 'next/link';

import { ExternalLink, Save } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Separator } from '@kit/ui/separator';

import { TimePicker } from '~/components/shared';

export interface CallingFormValues {
  goal_metric: 'pledge_rate' | 'average_gift' | 'total_donations';
  call_window_start: string;
  call_window_end: string;
  // TODO: Add back when multiple Twilio numbers are available:
  // caller_id: string;
  // TODO: Add back disclosure_line if needed (currently conflicts with agent's first message):
  // disclosure_line: string;
}

export function CallingStep({
  form,
  _twilioNumbers, // TODO: Re-enable caller ID selection when multiple Twilio numbers are available
  onBlurCalling,
  onSaveDraft,
  onNext,
  onBack,
}: {
  form: UseFormReturn<CallingFormValues>;
  _twilioNumbers: string[]; // TODO: Rename back to twilioNumbers when caller ID field is restored
  onBlurCalling: () => void;
  onSaveDraft: () => void | Promise<void>;
  onNext: () => void | Promise<void>;
  onBack: () => void;
}) {
  // keep component pure; details panel uses agents list externally
  return (
    <div className="space-y-5">
      <div className="px-0 pt-0 text-base font-medium">Calling & Voice</div>
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="goal_metric"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal metric</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      onBlurCalling();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select KPI" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pledge_rate">Pledge rate</SelectItem>
                      <SelectItem value="average_gift">Average gift</SelectItem>
                      <SelectItem value="total_donations">
                        Total donations
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <p className="text-muted-foreground mt-1 text-xs">
                  We optimize summaries for this KPI.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="call_window_start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Call window start</FormLabel>
                  <FormControl>
                    <TimePicker
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        onBlurCalling();
                      }}
                    />
                  </FormControl>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Time in UTC
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="call_window_end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Call window end</FormLabel>
                  <FormControl>
                    <TimePicker
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        onBlurCalling();
                      }}
                    />
                  </FormControl>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Time in UTC
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* TODO: Restore caller ID field when multiple Twilio numbers are available
          <FormField
            control={form.control}
            name="caller_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caller ID</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      onBlurCalling();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a Twilio number" />
                    </SelectTrigger>
                    <SelectContent>
                      {_twilioNumbers.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          */}
        </form>
      </Form>

      <Separator />
      <div className="bg-muted rounded-md px-3 py-3 text-sm">
        <div className="mb-2 font-medium">Voice & Script</div>
        <p className="text-muted-foreground">
          This campaign uses the assigned agent’s current voice & script.
        </p>
        <div className="mt-2 flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/home/agents" target="_blank">
              Go to agent voice & script{' '}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void onSaveDraft()}>
            <Save className="mr-2 h-4 w-4" /> Save as draft
          </Button>
          <Button onClick={() => void onNext()} className="min-w-36">
            Save & continue
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CallingStep;
