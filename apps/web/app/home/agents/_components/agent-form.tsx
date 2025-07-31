'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Settings, User, Volume2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Import our Supabase hooks
import {
  useCreateAgent,
  useUpdateAgent,
} from '@kit/supabase/hooks/agents/use-agent-mutations';
import { useAgent } from '@kit/supabase/hooks/agents/use-agents';
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
  pageHeaderStyles,
} from '~/components/form-styles';

const agentSchema = z.object({
  name: z.string().min(1, 'Agent name is required'),
  description: z.string().optional(),
  voice_type: z.string().min(1, 'Voice type is required'),
  voice_id: z.string().min(1, 'Voice ID is required'),
  speaking_tone: z.string().min(1, 'Speaking tone is required'),
  organization_info: z.string().optional(),
  donor_context: z.string().optional(),
  faqs: z.string().optional(),
});

type AgentFormData = z.infer<typeof agentSchema>;

const voiceTypes = [
  { value: 'elevenlabs', label: 'ElevenLabs' },
  { value: 'custom', label: 'Custom Voice' },
];

const speakingTones = [
  { value: 'warm-friendly', label: 'Warm and friendly' },
  { value: 'professional-confident', label: 'Professional and confident' },
  { value: 'compassionate-caring', label: 'Compassionate and caring' },
  { value: 'enthusiastic-energetic', label: 'Enthusiastic and energetic' },
  { value: 'calm-reassuring', label: 'Calm and reassuring' },
];

const voiceOptions = [
  { id: 'voice_sarah_001', name: 'Sarah', provider: 'ElevenLabs' },
  { id: 'voice_mike_002', name: 'Mike', provider: 'ElevenLabs' },
  { id: 'voice_emma_003', name: 'Emma', provider: 'ElevenLabs' },
  { id: 'voice_david_004', name: 'David', provider: 'ElevenLabs' },
  { id: 'voice_lisa_005', name: 'Lisa', provider: 'ElevenLabs' },
];

interface AgentFormProps {
  mode: 'create' | 'edit';
  agentId?: string;
  initialData?: Partial<AgentFormData>;
}

export function AgentForm({ mode, agentId, initialData }: AgentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user
  const { data: user } = useUser();

  // Fetch agent data for edit mode
  const { data: existingAgent, isLoading: loadingAgent } = useAgent(
    agentId || '',
  );

  // Mutations
  const createAgentMutation = useCreateAgent();
  const updateAgentMutation = useUpdateAgent();

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      description: '',
      voice_type: '',
      voice_id: '',
      speaking_tone: '',
      organization_info: '',
      donor_context: '',
      faqs: '',
      ...initialData,
    },
  });

  // Update form when existing agent data is loaded (for edit mode)
  useEffect(() => {
    if (existingAgent && mode === 'edit') {
      // Handle FAQs field - convert JSON to readable format
      let faqsText = '';
      if (existingAgent.faqs) {
        if (typeof existingAgent.faqs === 'string') {
          faqsText = existingAgent.faqs;
        } else {
          // If it's already a JSON object, convert to readable format
          try {
            faqsText = JSON.stringify(existingAgent.faqs, null, 2);
          } catch {
            faqsText = '';
          }
        }
      }

      form.reset({
        name: existingAgent.name,
        description: existingAgent.description || '',
        voice_type: existingAgent.voice_type || '',
        voice_id: existingAgent.voice_id || '',
        speaking_tone: existingAgent.speaking_tone || '',
        organization_info: existingAgent.organization_info || '',
        donor_context: existingAgent.donor_context || '',
        faqs: faqsText,
      });
    }
  }, [existingAgent, mode, form]);

  // Update form when initialData changes (for create mode)
  useEffect(() => {
    if (initialData && mode === 'create') {
      Object.keys(initialData).forEach((key) => {
        const value = initialData[key as keyof AgentFormData];
        if (value !== undefined) {
          form.setValue(key as keyof AgentFormData, value);
        }
      });
    }
  }, [initialData, mode, form]);

  const onSubmit = async (data: AgentFormData) => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      // Handle FAQs field - convert to proper JSON structure
      let faqsData = {};
      if (data.faqs) {
        try {
          // Try to parse as JSON first
          faqsData = JSON.parse(data.faqs);
        } catch {
          // If parsing fails, treat as plain text and create a simple structure
          faqsData = {
            general: data.faqs,
          };
        }
      }

      if (mode === 'create') {
        await createAgentMutation.mutateAsync({
          name: data.name,
          description: data.description || null,
          voice_type: data.voice_type as 'elevenlabs' | 'custom',
          voice_id: data.voice_id,
          speaking_tone: data.speaking_tone,
          organization_info: data.organization_info || null,
          donor_context: data.donor_context || null,
          faqs: faqsData,
          knowledge_base: {},
          workflow_config: {},
          status: 'active',
          account_id: user.id,
        });
        router.push('/home/agents');
      } else if (agentId) {
        await updateAgentMutation.mutateAsync({
          id: agentId,
          name: data.name,
          description: data.description || null,
          voice_type: data.voice_type as 'elevenlabs' | 'custom',
          voice_id: data.voice_id,
          speaking_tone: data.speaking_tone,
          organization_info: data.organization_info || null,
          donor_context: data.donor_context || null,
          faqs: faqsData,
        });
        router.push(`/home/agents/${agentId}`);
      }
    } catch (error) {
      console.error('Error saving agent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (mode === 'edit' && agentId) {
      router.push(`/home/agents/${agentId}`);
    } else {
      router.push('/home/agents');
    }
  };

  // Show loading state while fetching agent data
  if (mode === 'edit' && loadingAgent) {
    return (
      <div className={formContainerStyles.container}>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading agent data...</p>
          </div>
        </div>
      </div>
    );
  }

  const isEditMode = mode === 'edit';
  const pageTitle = isEditMode ? 'Edit Agent' : 'Create New Agent';
  const submitButtonText = isSubmitting
    ? isEditMode
      ? 'Updating...'
      : 'Creating...'
    : isEditMode
      ? 'Update Agent'
      : 'Create Agent';

  return (
    <div className={formContainerStyles.container}>
      {/* Header with Back Button */}
      <div className={pageHeaderStyles.container}>
        <div className={`flex items-center ${pageHeaderStyles.backButton}`}>
          <Button variant="ghost" onClick={handleBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className={pageHeaderStyles.title}>{pageTitle}</h1>
            <p className={pageHeaderStyles.description}>
              {isEditMode
                ? 'Update your AI voice agent settings and preferences'
                : 'Set up a new AI voice agent for your fundraising campaigns'}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={formContainerStyles.form}
        >
          {/* Basic Information */}
          <FormSection
            title="Agent Information"
            description="Start by giving your AI agent a personality and identity"
            icon={<User className="h-5 w-5" />}
            color="blue"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formFieldStyles.label}>
                    Agent Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Sarah, Mike, Emma"
                      className={formFieldStyles.input}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a friendly, memorable name for your AI agent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="voice_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={formFieldStyles.label}>
                      Voice Type
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={formFieldStyles.select}>
                          <SelectValue placeholder="Select voice type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {voiceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The technology powering your AI voice
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="speaking_tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={formFieldStyles.label}>
                      Communication Style
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={formFieldStyles.select}>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {speakingTones.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How your agent should communicate with donors
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Voice Settings */}
          <FormSection
            title="Voice Configuration"
            description="Choose the perfect voice for your AI agent"
            icon={<Volume2 className="h-5 w-5" />}
            color="purple"
            infoBox={{
              title: 'AI Voice Technology',
              description:
                'High-quality, natural-sounding voices optimized for fundraising calls',
              badge: 'AI Voice',
            }}
          >
            <FormField
              control={form.control}
              name="voice_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formFieldStyles.label}>
                    Select Voice
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={formFieldStyles.select}>
                        <SelectValue placeholder="Choose a voice" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {voiceOptions.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{voice.name}</span>
                            <span className="text-muted-foreground text-sm">
                              {voice.provider}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Preview available voices to find the perfect match for your
                    agent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formFieldStyles.label}>
                    Organization Info
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Nonprofit Organization, Charity, Foundation"
                      className={formFieldStyles.input}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Information about your organization that the agent should
                    mention
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          {/* Default Script */}
          <FormSection
            title="Default Script Template"
            description="Create a compelling default script for your fundraising campaigns"
            icon={<Settings className="h-5 w-5" />}
            color="green"
            infoBox={{
              title: 'Script Tips',
              description:
                "• Start with a warm, personal greeting\n• Clearly state your organization's mission\n• Include specific donation amounts or goals\n• End with a clear call-to-action",
            }}
          >
            <FormField
              control={form.control}
              name="donor_context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formFieldStyles.label}>
                    Donor Context
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., a potential donor, a long-time supporter, a new visitor"
                      className={formFieldStyles.textarea}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The context in which the agent is speaking to the donor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="faqs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formFieldStyles.label}>FAQs</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., How can I donate? What are your tax-deductible status? How do I get a receipt?"
                      className={formFieldStyles.textarea}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Common questions and answers that the agent should be
                    prepared to address. You can enter plain text or JSON format
                    for more structured FAQs.
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
