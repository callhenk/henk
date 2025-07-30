'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, MessageSquare, Users } from 'lucide-react';
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

import { DatePicker } from './date-picker';

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  agent: z.string().min(1, 'Please select an agent'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date().optional(),
  goal: z.string().min(1, 'Fundraising goal is required'),
  script: z.string().min(50, 'Script must be at least 50 characters'),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const mockAgents = [
  { id: 'sarah', name: 'Sarah', voice: 'Warm and friendly' },
  { id: 'mike', name: 'Mike', voice: 'Professional and confident' },
  { id: 'emma', name: 'Emma', voice: 'Compassionate and caring' },
  { id: 'david', name: 'David', voice: 'Enthusiastic and energetic' },
];

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

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      agent: '',
      startDate: undefined,
      endDate: undefined,
      goal: '',
      script: '',
      ...initialData,
    },
  });

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        const value = initialData[key as keyof CampaignFormData];
        if (value !== undefined) {
          // Convert string dates to Date objects for date fields
          if (key === 'startDate' && typeof value === 'string') {
            form.setValue('startDate', new Date(value));
          } else if (key === 'endDate' && typeof value === 'string') {
            form.setValue('endDate', new Date(value));
          } else {
            form.setValue(key as keyof CampaignFormData, value);
          }
        }
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: CampaignFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (mode === 'create') {
        console.log('Campaign created:', data);
        // Redirect to campaigns list after creation
        router.push('/home/campaigns');
      } else {
        console.log('Campaign updated:', data);
        // Redirect to campaign detail after update
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
                ? 'Update your AI voice fundraising campaign'
                : 'Set up a new AI voice fundraising campaign'}
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
                <MessageSquare className="h-5 w-5" />
                Campaign Information
              </CardTitle>
              <CardDescription>
                Basic details about your fundraising campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fundraising Goal</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $10,000" {...field} />
                    </FormControl>
                    <FormDescription>
                      Set a target amount for your fundraising campaign
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Agent Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                AI Agent Selection
              </CardTitle>
              <CardDescription>
                Choose the AI voice agent for this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="agent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Agent</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an AI agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{agent.name}</span>
                              <span className="text-muted-foreground text-sm">
                                {agent.voice}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Script Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Call Script
              </CardTitle>
              <CardDescription>
                The script your AI agent will use when making calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="script"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Script Template</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Hello, this is [Agent Name] calling on behalf of [Organization]. We're reaching out to discuss our current fundraising campaign..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Write a natural, conversational script for your AI agent.
                      The agent will adapt this based on the conversation flow.
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
