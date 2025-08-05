'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Settings, User, Volume2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Import our Supabase hooks
import {
  useCreateAgent,
  useUpdateAgent,
} from '@kit/supabase/hooks/agents/use-agent-mutations';
import { useAgent } from '@kit/supabase/hooks/agents/use-agents';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useUser } from '@kit/supabase/hooks/use-user';
import { useVoiceTestMutation } from '@kit/supabase/hooks/voices/use-voice-mutations';
import { useVoices } from '@kit/supabase/hooks/voices/use-voices';
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
import { PageHeader } from '~/components/shared';

const agentSchema = z.object({
  name: z.string().min(1, 'Agent name is required'),
  description: z.string().optional(),
  voice_type: z.string().min(1, 'Voice type is required'),
  voice_id: z.string().min(1, 'Voice ID is required'),
  organization_info: z.string().optional(),
  donor_context: z.string().optional(),
  faqs: z.string().optional(),
});

type AgentFormData = z.infer<typeof agentSchema>;

const voiceTypes = [
  { value: 'ai_generated', label: 'AI Generated' },
  { value: 'custom', label: 'Custom Voice' },
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

  // Get available voices from AI voice synthesis service
  const {
    data: voices,
    isLoading: voicesLoading,
    error: voicesError,
  } = useVoices();

  // Voice preview functionality
  const supabase = useSupabase();
  const voiceTestMutation = useVoiceTestMutation();
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);

  // Function to get cached voice sample URL
  const getCachedVoiceSample = async (voiceId: string) => {
    try {
      // Try to get a cached sample from the audio bucket
      const { data: signedUrl, error } = await supabase.storage
        .from('audio')
        .createSignedUrl(`samples/${voiceId}_sample.mp3`, 3600);

      if (signedUrl && !error) {
        return signedUrl.signedUrl;
      }

      // If no cached sample exists, return null (don't log error for missing files)
      return null;
    } catch (error) {
      // If there's an actual error (not just missing file), log it
      console.error('Error getting cached sample:', error);
      return null;
    }
  };

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
          voice_type: data.voice_type as 'ai_generated' | 'custom',
          voice_id: data.voice_id,
          knowledge_base: {},
          status: 'active',
        });
        router.push('/home/agents');
      } else if (agentId) {
        await updateAgentMutation.mutateAsync({
          id: agentId,
          name: data.name,
          description: data.description || null,
          voice_type: data.voice_type as 'ai_generated' | 'custom',
          voice_id: data.voice_id,
          organization_info: data.organization_info || null,
          donor_context: data.donor_context || null,
          faqs: faqsData,
        });
        router.push(`/home/agents/${agentId}`);
      }
    } catch {
      // Handle error silently or show user-friendly message
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
      <PageHeader
        title={pageTitle}
        description={
          isEditMode
            ? 'Update your AI voice agent settings and preferences'
            : 'Set up a new AI voice agent for your fundraising campaigns'
        }
        onBack={handleBack}
        breadcrumbs={[
          { label: 'Agents', href: '/home/agents' },
          { label: isEditMode ? 'Edit Agent' : 'Create Agent' },
        ]}
      />

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
                name="voice_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={formFieldStyles.label}>
                      Select Voice
                    </FormLabel>
                    <div className="flex gap-2">
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
                          {voicesLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading voices...
                            </SelectItem>
                          ) : voicesError ? (
                            <SelectItem value="error" disabled>
                              Error loading voices
                            </SelectItem>
                          ) : voices && voices.length > 0 ? (
                            voices.map((voice) => (
                              <SelectItem
                                key={voice.voice_id}
                                value={voice.voice_id}
                              >
                                <span className="font-medium">
                                  {voice.name}
                                </span>
                                <span className="text-muted-foreground ml-2 text-sm">
                                  • {voice.description}
                                </span>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-voices" disabled>
                              No voices available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {field.value && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              // First try to get a cached sample
                              const cachedUrl = await getCachedVoiceSample(
                                field.value,
                              );

                              if (cachedUrl) {
                                // Play cached sample
                                const audio = new Audio(cachedUrl);
                                setIsPlayingPreview(true);

                                audio.onended = () =>
                                  setIsPlayingPreview(false);
                                audio.onerror = () => {
                                  setIsPlayingPreview(false);
                                  toast.error('Failed to play voice preview.');
                                };

                                await audio.play();
                                toast.success(
                                  'Playing cached voice preview...',
                                );
                                return;
                              }

                              // If no cached sample, generate one
                              toast.info(
                                'Generating voice sample (this may take a moment)...',
                              );

                              const result =
                                await voiceTestMutation.mutateAsync({
                                  voice_id: field.value,
                                  sample_text:
                                    'Hello, this is a voice preview.',
                                });

                              // Extract the file path from the public URL
                              const url = new URL(result.audio_url);
                              const pathMatch = url.pathname.match(
                                /\/storage\/v1\/object\/public\/audio\/(.+)/,
                              );

                              if (pathMatch && pathMatch[1]) {
                                const originalFilePath = pathMatch[1];

                                // Try to cache the file for future use
                                try {
                                  const { data: fileData } =
                                    await supabase.storage
                                      .from('audio')
                                      .download(originalFilePath);

                                  if (fileData) {
                                    const sampleFileName = `samples/${field.value}_sample.mp3`;
                                    await supabase.storage
                                      .from('audio')
                                      .upload(sampleFileName, fileData, {
                                        contentType: 'audio/mpeg',
                                        upsert: true,
                                      });
                                    console.log(
                                      'Voice sample cached successfully',
                                    );
                                  }
                                } catch (cacheError) {
                                  console.error(
                                    'Failed to cache sample:',
                                    cacheError,
                                  );
                                  // Continue anyway - we can still play the original
                                }

                                // Get authenticated URL for the original file
                                const {
                                  data: signedUrl,
                                  error: signedUrlError,
                                } = await supabase.storage
                                  .from('audio')
                                  .createSignedUrl(originalFilePath, 3600);

                                if (signedUrlError) {
                                  console.error(
                                    'Signed URL error:',
                                    signedUrlError,
                                  );
                                  toast.error(
                                    'Failed to generate authenticated audio URL',
                                  );
                                  return;
                                }

                                if (signedUrl) {
                                  // Play the audio with authenticated URL
                                  const audio = new Audio(signedUrl.signedUrl);
                                  setIsPlayingPreview(true);

                                  audio.onended = () =>
                                    setIsPlayingPreview(false);
                                  audio.onerror = () => {
                                    setIsPlayingPreview(false);
                                    toast.error(
                                      'Failed to play voice preview.',
                                    );
                                  };

                                  await audio.play();
                                  toast.success('Playing voice preview...');
                                } else {
                                  toast.error(
                                    'Failed to generate authenticated audio URL',
                                  );
                                }
                              } else {
                                toast.error('Invalid audio URL format');
                              }
                            } catch (error) {
                              console.error('Voice preview error:', error);
                              toast.error('Failed to generate voice preview.');
                            }
                          }}
                          disabled={
                            voiceTestMutation.isPending || isPlayingPreview
                          }
                          className="whitespace-nowrap"
                        >
                          {voiceTestMutation.isPending
                            ? 'Generating...'
                            : isPlayingPreview
                              ? 'Playing...'
                              : 'Preview'}
                        </Button>
                      )}
                    </div>
                    <FormDescription>
                      Choose from high-quality AI voices. Use the preview button
                      to test the selected voice.
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

          {/* Knowledge */}
          <FormSection
            title="Knowledge"
            description="Upload or enter knowledge that the agent can use during conversations."
            icon={<Settings className="h-5 w-5" />}
            color="green"
            infoBox={undefined}
          >
            <FormField
              control={form.control}
              name="donor_context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formFieldStyles.label}>
                    Prompt
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the prompt or context for the agent."
                      className={formFieldStyles.textarea}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The prompt or context that guides the agent&apos;s
                    responses.
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
                    Agent Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your agent's personality, role, and how they should interact with donors..."
                      className={formFieldStyles.textarea}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of your agent&apos;s personality and
                    approach
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="faqs"
              render={({ field: _field }) => (
                <FormItem>
                  <FormLabel className={formFieldStyles.label}>FAQs</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="bg-muted/50 rounded-lg border p-4">
                        <p className="text-muted-foreground mb-3 text-sm">
                          💡 FAQs can be managed after creating the agent. For
                          now, focus on the basic agent setup.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // This will be handled after agent creation
                          }}
                        >
                          Manage FAQs Later
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Common questions and answers that the agent should be
                    prepared to address.
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
