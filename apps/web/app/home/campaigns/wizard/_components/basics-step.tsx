'use client';

import Link from 'next/link';

import { UseFormReturn } from 'react-hook-form';

import { Tables } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Separator } from '@kit/ui/separator';

import { DatePicker } from '~/components/shared';

type AgentRow = Tables<'agents'>['Row'];

export interface BasicsFormValues {
  campaign_name: string;
  fundraising_goal?: number;
  start_date?: Date;
  end_date?: Date;
  agent_id: string;
}

export function BasicsStep({
  form,
  agents,
  onBlurBasics,
  onNext,
}: {
  form: UseFormReturn<BasicsFormValues>;
  agents: AgentRow[];
  onBlurBasics: () => void;
  onNext: () => void | Promise<void>;
}) {
  return (
    <div className="space-y-5">
      <div className="px-0 pt-0 text-base font-medium">Basics</div>
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="campaign_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onBlur={onBlurBasics}
                    placeholder="e.g., Spring Appeal"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fundraising_goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fundraising goal (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={
                      field.value === undefined || field.value === null
                        ? ''
                        : field.value
                    }
                    onChange={(e) => {
                      const raw = e.target.value ?? '';
                      if (raw === '') {
                        field.onChange(undefined);
                        return;
                      }
                      const next = Number(raw);
                      field.onChange(isNaN(next) ? undefined : next);
                    }}
                    onBlur={onBlurBasics}
                    inputMode="decimal"
                    pattern="^[0-9]+(\.[0-9]{0,2})?$"
                    placeholder="e.g., 5000"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onValueChange={(d?: Date) => {
                        field.onChange(d);
                        onBlurBasics();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End date (optional)</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onValueChange={(d?: Date) => {
                        field.onChange(d);
                        onBlurBasics();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="agent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      onBlurBasics();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <p className="text-muted-foreground mt-1 text-xs">
                  Agent determines voice & script. You can adjust from the Agent
                  page.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <Separator />
      <div className="mt-4 flex justify-between">
        <Button variant="ghost" asChild>
          <Link href="/home/campaigns">Cancel</Link>
        </Button>
        <div className="flex gap-2">
          <Button onClick={() => void onNext()} className="min-w-36">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BasicsStep;
