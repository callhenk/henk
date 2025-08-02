'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Import our Supabase hooks
import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import {
  useCreateCampaign,
  useUpdateCampaign,
} from '@kit/supabase/hooks/campaigns/use-campaign-mutations';
import { useCampaign } from '@kit/supabase/hooks/campaigns/use-campaigns';
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
import { Textarea } from '@kit/ui/textarea';

import {
  FormSection,
  formContainerStyles,
  formFieldStyles,
} from '~/components/form-styles';
import { DatePicker, PageHeader } from '~/components/shared';

// Helper functions to convert enum values to user-friendly labels
const getSpeakingToneLabel = (
  speakingTone: string | null | undefined,
): string => {
  if (!speakingTone) return 'Default tone';
  const speakingTones = [
    { value: 'warm-friendly', label: 'Warm and friendly' },
    { value: 'professional-confident', label: 'Professional and confident' },
    { value: 'compassionate-caring', label: 'Compassionate and caring' },
    { value: 'enthusiastic-energetic', label: 'Enthusiastic and energetic' },
    { value: 'calm-reassuring', label: 'Calm and reassuring' },
  ];
  const toneOption = speakingTones.find((tone) => tone.value === speakingTone);
  return toneOption?.label || speakingTone;
};

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

interface CampaignFormProps {
  mode: 'create' | 'edit';
  campaignId?: string;
  initialData?: Partial<CampaignFormData>;
}

export function CampaignForm({
  mode,
  campaignId,
  initialData,
}: CampaignFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user
  const { data: user } = useUser();

  // Fetch data
  const { data: agents = [] } = useAgents();
  const { data: existingCampaign, isLoading: loadingCampaign } = useCampaign(
    campaignId || '',
  );

  // Mutations
  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();

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
      ...initialData,
    },
  });

  // Update form when existing campaign data is loaded (for edit mode)
  useEffect(() => {
    if (existingCampaign && mode === 'edit') {
      form.reset({
        name: existingCampaign.name,
        description: existingCampaign.description || '',
        agent_id: existingCampaign.agent_id || '',
        start_date: existingCampaign.start_date
          ? new Date(existingCampaign.start_date)
          : undefined,
        end_date: existingCampaign.end_date
          ? new Date(existingCampaign.end_date)
          : undefined,
        target_amount: existingCampaign.target_amount?.toString() || '',
        script: existingCampaign.script || '',
      });
    }
  }, [existingCampaign, mode, form]);

  // Update form when initialData changes (for create mode)
  useEffect(() => {
    if (initialData && mode === 'create') {
      Object.keys(initialData).forEach((key) => {
        const value = initialData[key as keyof CampaignFormData];
        if (value !== undefined) {
          // Convert string dates to Date objects for date fields
          if (key === 'start_date' && typeof value === 'string') {
            form.setValue('start_date', new Date(value));
          } else if (key === 'end_date' && typeof value === 'string') {
            form.setValue('end_date', new Date(value));
          } else {
            form.setValue(key as keyof CampaignFormData, value);
          }
        }
      });
    }
  }, [initialData, mode, form]);

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
      if (mode === 'create') {
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
        router.push(`/home/campaigns/${createdCampaign.id}`);
      } else if (campaignId) {
        await updateCampaignMutation.mutateAsync({
          id: campaignId,
          name: data.name,
          description: data.description,
          agent_id: data.agent_id,
          start_date: data.start_date.toISOString(),
          end_date: data.end_date?.toISOString() || null,
          target_amount: parseFloat(data.target_amount) || 0,
          script: data.script,
        });
        router.push(`/home/campaigns/${campaignId}`);
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (mode === 'edit' && campaignId) {
      router.push(`/home/campaigns/${campaignId}`);
    } else {
      router.push('/home/campaigns');
    }
  };

  // Show loading state while fetching campaign data
  if (mode === 'edit' && loadingCampaign) {
    return (
      <div className={formContainerStyles.container}>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading campaign data...</p>
          </div>
        </div>
      </div>
    );
  }

  const isEditMode = mode === 'edit';
  const pageTitle = isEditMode ? 'Edit Campaign' : 'Create New Campaign';
  const submitButtonText = isSubmitting
    ? isEditMode
      ? 'Updating...'
      : 'Creating...'
    : isEditMode
      ? 'Update Campaign'
      : 'Create Campaign';

  return (
    <div className={formContainerStyles.container}>
      <PageHeader
        title={pageTitle}
        description={
          isEditMode
            ? 'Update your AI voice fundraising campaign settings and configurations'
            : 'Set up a new AI voice fundraising campaign for your organization with detailed configurations'
        }
        onBack={handleBack}
        breadcrumbs={[
          { label: 'Campaigns', href: '/home/campaigns' },
          { label: isEditMode ? 'Edit Campaign' : 'Create Campaign' },
        ]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={formContainerStyles.form}
        >
          {/* Campaign Information */}
          <FormSection
            title="Campaign Information"
            description="Start by defining your fundraising campaign details"
            icon={<MessageSquare className="h-5 w-5" />}
            color="blue"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formFieldStyles.label}>
                    Campaign Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Summer Fundraiser 2024"
                      className={formFieldStyles.input}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a memorable name that reflects your campaign&apos;s
                    purpose
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
                  <FormLabel className={formFieldStyles.label}>
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the purpose and goals of this campaign..."
                      className="min-h-[100px] resize-none text-base"
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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={formFieldStyles.label}>
                      Start Date
                    </FormLabel>
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
                    <FormLabel className={formFieldStyles.label}>
                      End Date (Optional)
                    </FormLabel>
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
                  <FormLabel className={formFieldStyles.label}>
                    Fundraising Goal
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., $10,000"
                      className={formFieldStyles.input}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Set a target amount to track your campaign&apos;s progress
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          {/* Agent Selection */}
          <FormSection
            title="AI Agent Selection"
            description="Choose the perfect AI voice agent for your campaign"
            icon={<Users className="h-5 w-5" />}
            color="purple"
            infoBox={{
              title: 'Available Agents',
              description:
                'Each agent has a unique voice and communication style optimized for fundraising',
              badge: 'AI Voice Agents',
            }}
          >
            <FormField
              control={form.control}
              name="agent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formFieldStyles.label}>
                    Select Agent
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);

                      // Load the selected agent's default script
                      if (value && agents.length > 0) {
                        const selectedAgent = agents.find(
                          (agent) => agent.id === value,
                        );
                        if (selectedAgent && selectedAgent.donor_context) {
                          form.setValue('script', selectedAgent.donor_context);
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
                      <SelectTrigger className={formFieldStyles.select}>
                        <SelectValue placeholder="Choose an AI agent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{agent.name}</span>
                            <span className="text-muted-foreground text-sm">
                              {getSpeakingToneLabel(agent.speaking_tone)}
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
          </FormSection>

          {/* Script Configuration */}
          <FormSection
            title="Call Script"
            description="Create a compelling script for your AI agent"
            icon={<MessageSquare className="h-5 w-5" />}
            color="green"
            infoBox={{
              title: 'Script Writing Tips',
              description:
                "• Start with a warm, personal greeting\n• Clearly state your organization's mission\n• Include specific donation amounts or goals\n• End with a clear call-to-action\n• Keep it conversational and natural",
            }}
          >
            <FormField
              control={form.control}
              name="script"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formFieldStyles.label}>
                    Script Template
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hello, this is [Agent Name] calling on behalf of [Organization]. We're reaching out to discuss our current fundraising campaign..."
                      className={formFieldStyles.textarea}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write a natural, conversational script. Your AI agent will
                    adapt this based on the conversation flow. This script is
                    pre-filled with the selected agent&apos;s default prompt but
                    can be customized for your specific campaign.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          {/* Submit Buttons */}
          <div className={formContainerStyles.buttons}>
            <div className={formContainerStyles.buttonGroup}>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="hover:bg-primary/90 px-8 transition-colors"
              >
                {submitButtonText}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                size="lg"
                className="hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Cancel
              </Button>
            </div>
            {!isEditMode && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Save as Draft
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
