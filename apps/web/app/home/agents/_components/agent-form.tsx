'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mic, Settings, User, Volume2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
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

const agentSchema = z.object({
  name: z.string().min(1, 'Agent name is required'),
  language: z.string().min(1, 'Language is required'),
  tone: z.string().min(1, 'Tone is required'),
  voiceId: z.string().min(1, 'Voice ID is required'),
  voiceName: z.string().min(1, 'Voice name is required'),
  defaultScript: z.string().min(50, 'Default script must be at least 50 characters'),
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
  { id: 'voice_sarah_001', name: 'Sarah (ElevenLabs)', provider: 'ElevenLabs' },
  { id: 'voice_mike_002', name: 'Mike (ElevenLabs)', provider: 'ElevenLabs' },
  { id: 'voice_emma_003', name: 'Emma (ElevenLabs)', provider: 'ElevenLabs' },
  { id: 'voice_david_004', name: 'David (ElevenLabs)', provider: 'ElevenLabs' },
  { id: 'voice_lisa_005', name: 'Lisa (ElevenLabs)', provider: 'ElevenLabs' },
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
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? 'Update your AI voice agent settings'
                : 'Set up a new AI voice agent'}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Agent Information
              </CardTitle>
              <CardDescription>
                Basic details about your AI voice agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sarah, Mike, Emma" {...field} />
                    </FormControl>
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
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockLanguages.map((language) => (
                            <SelectItem key={language.value} value={language.value}>
                              {language.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Communication Tone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Voice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Voice Settings
              </CardTitle>
              <CardDescription>
                Configure the voice for your AI agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="voiceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voice ID</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select voice" />
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
                      Choose from available ElevenLabs voices
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
                    <FormLabel>Voice Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sarah (ElevenLabs)" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is how the voice will appear in the interface
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Default Script */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Default Script Template
              </CardTitle>
              <CardDescription>
                The default script template for this agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="defaultScript"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Script</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Hello, this is [Agent Name] calling on behalf of [Organization]. We're reaching out to discuss our current fundraising campaign..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This script will be used as the default template for campaigns using this agent.
                      You can customize it per campaign.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {submitButtonText}
            </Button>
            <Button type="button" variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            {!isEditMode && (
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
} 