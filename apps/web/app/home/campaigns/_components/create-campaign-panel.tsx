'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Import our Supabase hooks
import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import { useCreateCampaign } from '@kit/supabase/hooks/campaigns/use-campaign-mutations';
import { useUser } from '@kit/supabase/hooks/use-user';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@kit/ui/sheet';
import { Spinner } from '@kit/ui/spinner';
import { Textarea } from '@kit/ui/textarea';

import { DatePicker } from '~/components/shared';

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  agent_id: z.string().min(1, 'Please select an agent'),
  start_date: z.date({
    required_error: 'Start date is required',
  }),
  end_date: z.date().optional(),
  target_amount: z.string().min(1, 'Fundraising goal is required'),
  script: z.string().min(50, 'Script must be at least 50 characters'),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CreateCampaignPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampaignPanel({
  open,
  onOpenChange,
}: CreateCampaignPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Get current user
  const { data: user } = useUser();

  // Fetch data
  const { data: agents = [] } = useAgents();

  // Mutations
  const createCampaignMutation = useCreateCampaign();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      agent_id: '',
      start_date: undefined,
      end_date: undefined,
      target_amount: '',
      script: '',
    },
  });

  // Handle agent selection and load default script
  useEffect(() => {
    const selectedAgentId = form.watch('agent_id');

    if (selectedAgentId && agents.length > 0) {
      const selectedAgent = agents.find(
        (agent) => agent.id === selectedAgentId,
      );

      if (selectedAgent && selectedAgent.donor_context) {
        // Load the agent's default script (donor_context) into the script field
        form.setValue('script', selectedAgent.donor_context);
      } else {
        // Clear script if agent has no default script
        form.setValue('script', '');
      }
    } else {
      // Clear script if no agent is selected
      form.setValue('script', '');
    }
  }, [form.watch('agent_id'), agents, form]);

  const onSubmit = async (data: CampaignFormData) => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdCampaign = await createCampaignMutation.mutateAsync({
        name: data.name,
        description: data.description,
        agent_id: data.agent_id,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date?.toISOString() || null,
        script: data.script,
        status: 'draft',
        calling_hours: '9:00-17:00',
        max_attempts: 3,
        daily_call_cap: 100,
        retry_logic: 'standard',
      });

      // Close the panel after successful creation
      onOpenChange(false);

      // Redirect to created campaign
      if (createdCampaign?.id) {
        router.push(`/home/campaigns/${createdCampaign.id}`);
      }

      // Reset the form
      form.reset();
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="m-2 flex h-dvh w-full max-w-full flex-col overflow-hidden rounded-2xl border border-white/30 !bg-white/95 !p-0 sm:m-4 sm:h-screen sm:w-[480px] sm:rounded-2xl sm:border-white/30 md:w-[640px] lg:m-6 lg:w-[720px] dark:border-white/10 dark:!bg-neutral-900/85 [&>button]:hidden"
      >
        <SheetHeader className="sticky top-0 z-10 border-b border-white/30 bg-white/95 px-4 py-4 dark:border-white/10 dark:bg-neutral-900/85">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold">
                Create Campaign
              </SheetTitle>
              <SheetDescription className="text-muted-foreground text-sm">
                Set up a new fundraising campaign with your AI agent
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Campaign Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">
                    Campaign Information
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Summer Fundraiser 2024"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Choose a memorable name that reflects your
                        campaign&apos;s purpose
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the purpose and goals of this campaign..."
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Explain what this campaign is for and what you hope to
                        achieve
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select start date"
                          />
                        </FormControl>
                        <FormDescription>
                          When should your campaign begin?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select end date"
                          />
                        </FormControl>
                        <FormDescription>
                          Set an end date to automatically pause the campaign
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="target_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fundraising Goal</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $10,000" {...field} />
                      </FormControl>
                      <FormDescription>
                        Set a target amount to track your campaign&apos;s
                        progress
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Agent Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold">AI Agent Selection</h3>
                </div>

                <FormField
                  control={form.control}
                  name="agent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Agent</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);

                          // Load the selected agent's default script
                          if (value && agents.length > 0) {
                            const selectedAgent = agents.find(
                              (agent) => agent.id === value,
                            );
                            if (selectedAgent && selectedAgent.donor_context) {
                              form.setValue(
                                'script',
                                selectedAgent.donor_context,
                              );
                            } else {
                              // Clear script if agent has no default script
                              form.setValue('script', '');
                            }
                          } else {
                            // Clear script if no agent is selected
                            form.setValue('script', '');
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an AI agent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {agent.name}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                  {agent.speaking_tone || 'Default tone'}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Preview each agent&apos;s voice and style to find the
                        perfect match. The agent&apos;s default script will be
                        loaded automatically.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Buttons */}
              <div className="sticky bottom-0 z-10 -mx-4 flex gap-3 border-t border-white/30 bg-white/95 px-4 py-4 dark:border-white/10 dark:bg-neutral-900/85">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 flex-1"
                >
                  {isSubmitting ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    'Create Campaign'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-400/40 dark:text-red-400 dark:hover:bg-red-400/10"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
