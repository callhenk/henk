'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Settings, User, Volume2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Import our Supabase hooks
import { useCreateAgent } from '@kit/supabase/hooks/agents/use-agent-mutations';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useUser } from '@kit/supabase/hooks/use-user';
import { useVoiceTestMutation } from '@kit/supabase/hooks/voices/use-voice-mutations';
import { useVoices } from '@kit/supabase/hooks/voices/use-voices';
// Import Edge Functions utilities
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

interface AgentFormData {
  name: string;
  description?: string;
  voice_type: string;
  voice_id: string;
  organization_info?: string;
  donor_context?: string;
  faqs?: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
    elevenlabs_enabled: boolean;
    enable_voice_testing: boolean;
    fallback_to_simulation: boolean;
  };
}

const voiceTypes = [
  { value: 'ai_generated', label: 'AI Generated' },
  { value: 'custom', label: 'Custom Voice' },
];

interface AgentFormProps {
  initialData?: Partial<AgentFormData>;
}

export function AgentForm({ initialData }: AgentFormProps) {
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
  // Mutations
  const createAgentMutation = useCreateAgent();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      voice_type: '',
      voice_id: '',
      organization_info: '',
      donor_context: '',
      faqs: '',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
        elevenlabs_enabled: true,
        enable_voice_testing: true,
        fallback_to_simulation: true,
      },
      ...initialData,
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        const value = initialData[key as keyof AgentFormData];
        if (value !== undefined) {
          form.setValue(key as keyof AgentFormData, value);
        }
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: AgentFormData) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating agent with data:', data);

      // First, create the ElevenLabs agent
      const elevenLabsAgentConfig = {
        name: data.name,
        description: data.description || '',
        voice_id: data.voice_id || '',
        llm_model: 'gpt-4o', // Default to GPT-4o for best performance
        voice_settings: data.voice_settings,
        context_data: {
          organization_info: data.organization_info || '',
          donor_context: data.donor_context || '',
          faqs: (() => {
            try {
              return data.faqs && data.faqs.trim() ? JSON.parse(data.faqs) : {};
            } catch (error) {
              console.error('Error parsing FAQs JSON:', error);
              return {};
            }
          })(),
        },
        conversation_flow: {
          greeting: `Hello! I'm ${data.name}, and I'm here to help with your fundraising needs.`,
          introduction:
            'I can assist you with donation campaigns, donor outreach, and fundraising strategies.',
          value_proposition:
            'Our organization is committed to making a difference, and your support helps us achieve our mission.',
          closing:
            'Thank you for your time and consideration. Your support means the world to us.',
        },
        prompts: {
          fundraising:
            'I help organizations raise funds through effective donor outreach and campaign management.',
          objection_handling: {
            cost_concern:
              'I understand budget concerns. Let me show you how our programs provide excellent value.',
            timing_issue:
              'I appreciate your busy schedule. Let me work around your availability.',
            already_donated:
              'Thank you for your previous support! Every contribution makes a difference.',
          },
          closing_techniques: [
            'Would you be interested in learning more about our current campaign?',
            'Could I send you some information about our upcoming initiatives?',
            'Would you like to schedule a follow-up conversation?',
          ],
        },
        status: 'active',
        account_id: user.id,
      };

      console.log(
        'Creating ElevenLabs agent with config:',
        JSON.stringify(elevenLabsAgentConfig, null, 2),
      );

      // Call the ElevenLabs agent creation Edge Function
      const elevenLabsResponse = await fetch('/api/elevenlabs-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          ...elevenLabsAgentConfig,
        }),
      });

      if (!elevenLabsResponse.ok) {
        const errorData = await elevenLabsResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create ElevenLabs agent');
      }

      const elevenLabsData = await elevenLabsResponse.json();
      console.log('ElevenLabs agent created:', elevenLabsData);

      // Create the agent record in Supabase database with the ElevenLabs agent ID
      const supabaseResult = await createAgentMutation.mutateAsync({
        name: data.name,
        description: data.description || null,
        voice_type: data.voice_type || 'elevenlabs',
        voice_id: data.voice_id || '',
        knowledge_base: {},
        status: 'active',
        elevenlabs_agent_id: elevenLabsData.data?.agent_id || null,
      });

      console.log('Agent created successfully:', supabaseResult);
      toast.success('Agent created successfully!');
      router.push(`/home/agents/${supabaseResult.id}`);
    } catch (error) {
      console.error('Agent creation error:', error);
      toast.error(
        `Failed to create agent: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/home/agents');
  };

  const pageTitle = 'Create New Agent';
  const submitButtonText = isSubmitting ? 'Creating...' : 'Create Agent';

  return (
    <div className={formContainerStyles.container}>
      <PageHeader
        title={pageTitle}
        description="Set up a new AI voice agent for your fundraising campaigns"
        onBack={handleBack}
        breadcrumbs={[
          { label: 'Agents', href: '/home/agents' },
          { label: 'Create Agent' },
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
          </div>
        </form>
      </Form>
    </div>
  );
}
