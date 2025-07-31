'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Settings, User, Volume2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  language: z.string().min(1, 'Language is required'),
  tone: z.string().min(1, 'Tone is required'),
  voiceId: z.string().min(1, 'Voice ID is required'),
  voiceName: z.string().min(1, 'Voice name is required'),
  defaultScript: z
    .string()
    .min(50, 'Default script must be at least 50 characters'),
});

type AgentFormData = z.infer<typeof agentSchema>;

const mockLanguages = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
];

const mockTones = [
  { value: 'warm-friendly', label: 'Warm and friendly' },
  { value: 'professional-confident', label: 'Professional and confident' },
  { value: 'compassionate-caring', label: 'Compassionate and caring' },
  { value: 'enthusiastic-energetic', label: 'Enthusiastic and energetic' },
  { value: 'calm-reassuring', label: 'Calm and reassuring' },
];

const mockVoices = [
  { id: 'voice_sarah_001', name: 'Sarah', provider: 'AI Voice' },
  { id: 'voice_mike_002', name: 'Mike', provider: 'AI Voice' },
  { id: 'voice_emma_003', name: 'Emma', provider: 'AI Voice' },
  { id: 'voice_david_004', name: 'David', provider: 'AI Voice' },
  { id: 'voice_lisa_005', name: 'Lisa', provider: 'AI Voice' },
];

interface AgentFormProps {
  mode: 'create' | 'edit';
  agentId?: string;
  initialData?: Partial<AgentFormData>;
}

export function AgentForm({ mode, agentId, initialData }: AgentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      language: '',
      tone: '',
      voiceId: '',
      voiceName: '',
      defaultScript: '',
      ...initialData,
    },
  });

  // Update form when initialData changes (for edit mode)
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
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (mode === 'create') {
        console.log('Agent created:', data);
        // Redirect to agents list after creation
        router.push('/home/agents');
      } else {
        console.log('Agent updated:', data);
        // Redirect to agent detail after update
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
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={formFieldStyles.label}>
                      Language
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={formFieldStyles.select}>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockLanguages.map((language) => (
                          <SelectItem
                            key={language.value}
                            value={language.value}
                          >
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The primary language your agent will speak
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tone"
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
                        {mockTones.map((tone) => (
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
              name="voiceId"
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
                      {mockVoices.map((voice) => (
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
              name="voiceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formFieldStyles.label}>
                    Voice Display Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Sarah"
                      className={formFieldStyles.input}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is how the voice will appear in your dashboard and
                    reports
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
              name="defaultScript"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={formFieldStyles.label}>
                    Default Script
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hello, this is [Agent Name] calling on behalf of [Organization]. We're reaching out to discuss our current fundraising campaign..."
                      className={formFieldStyles.textarea}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This script will be used as the default template for
                    campaigns using this agent. You can customize it per
                    campaign.
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
