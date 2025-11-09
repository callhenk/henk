'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  PhoneCall,
  Settings,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Spinner } from '@kit/ui/spinner';

import featuresFlagConfig from '../../config/feature-flags.config';
import { generateAgentPrompts } from '../../lib/generate-agent-prompts';
import { logger } from '../../lib/utils';
import { RealtimeVoiceChat } from '../home/agents/[id]/_components/realtime-voice-chat';
import { AGENT_TYPES } from '../home/agents/_components/agent-types-step';
import { DetailsStep } from '../home/agents/_components/details-step';
import { UseCaseStep } from '../home/agents/_components/use-case-step';

type StepType = 'use-case' | 'details' | 'conversation';

interface CreatedAgent {
  id: string;
  name: string;
  elevenlabs_agent_id: string;
}

export default function SelfOnboardDemoPage() {
  const router = useRouter();

  // Agent creation state - must be before any conditional returns
  const [step, setStep] = useState<StepType>('use-case');
  const [agentType] = useState<keyof typeof AGENT_TYPES>('business_agent');
  const [useCase, setUseCase] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [contextPrompt, setContextPrompt] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
  const [contextPromptManuallyEdited, setContextPromptManuallyEdited] =
    useState(false);
  const [firstMessageManuallyEdited, setFirstMessageManuallyEdited] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<CreatedAgent | null>(null);
  const [email, setEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const industry = 'non profit';

  // Generate dynamic prompts based on use case and industry
  useEffect(() => {
    if (agentType && useCase && industry) {
      const generatedPrompts = generateAgentPrompts({
        agentType,
        useCase,
        industry,
      });

      // Only update if user hasn't manually edited
      if (!contextPromptManuallyEdited) {
        setContextPrompt(generatedPrompts.contextPrompt);
      }
      if (!firstMessageManuallyEdited) {
        setFirstMessage(generatedPrompts.startingMessage || '');
      }
      if (!nameManuallyEdited && generatedPrompts.defaultName) {
        setName(generatedPrompts.defaultName);
      }
    } else if (agentType && (!useCase || !industry)) {
      const template = AGENT_TYPES[agentType];
      if (!nameManuallyEdited && !name && template.defaultAgentName) {
        setName(template.defaultAgentName);
      }
      if (
        !contextPromptManuallyEdited &&
        !contextPrompt &&
        template.contextPrompt
      ) {
        setContextPrompt(template.contextPrompt);
      }
      if (
        !firstMessageManuallyEdited &&
        !firstMessage &&
        template.startingMessage
      ) {
        setFirstMessage(template.startingMessage);
      }
    }
  }, [
    agentType,
    useCase,
    industry,
    nameManuallyEdited,
    contextPromptManuallyEdited,
    firstMessageManuallyEdited,
    name,
    contextPrompt,
    firstMessage,
  ]);

  const steps: Array<{
    key: StepType;
    title: string;
    icon: React.ReactNode;
    description?: string;
  }> = [
    {
      key: 'use-case',
      title: 'Use Case',
      icon: <Target className="h-4 w-4" />,
      description: 'Primary purpose',
    },
    {
      key: 'details',
      title: 'Details',
      icon: <Settings className="h-4 w-4" />,
      description: 'Name & goal',
    },
    {
      key: 'conversation',
      title: 'Talk',
      icon: <PhoneCall className="h-4 w-4" />,
      description: 'Test your agent',
    },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  const canProceed = () => {
    switch (step) {
      case 'use-case':
        return useCase !== null;
      case 'details':
        return Boolean(name.trim() && contextPrompt.trim());
      case 'conversation':
        return createdAgent !== null;
      default:
        return false;
    }
  };

  const goNext = () => {
    const currentStepIndex = steps.findIndex((s) => s.key === step);
    if (
      currentStepIndex >= 0 &&
      currentStepIndex < steps.length - 1 &&
      canProceed()
    ) {
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep) {
        setStep(nextStep.key);
      }
    }
  };

  const goBack = () => {
    const currentStepIndex = steps.findIndex((s) => s.key === step);
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      if (prevStep) {
        setStep(prevStep.key);
      }
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Get system prompt from agent type template
      const agentTypeTemplate = agentType ? AGENT_TYPES[agentType] : null;
      const baseSystemPrompt =
        agentTypeTemplate?.systemPrompt || 'You are a helpful AI assistant.';

      // Use the user's custom first message or fall back to generated one
      const startingMessage =
        firstMessage.trim() || 'Hello! How can I help you today?';

      // Build conversation config with required fields for ElevenLabs
      const conversationConfig = {
        agent: {
          first_message: startingMessage,
          language: 'en',
          prompt: {
            prompt: contextPrompt.trim(),
            llm: 'gpt-4o-mini',
            max_tokens: 1024,
          },
        },
      };

      // Build knowledge base
      const knowledgeBase = {
        agentType,
        useCase,
        industry,
        contextPrompt: contextPrompt.trim(),
        systemPrompt: baseSystemPrompt,
        startingMessage: startingMessage,
        firstMessage: startingMessage,
        llmModel: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 1024,
        asrQuality: 'high',
        ttsStability: 75,
      };

      logger.debug('Creating demo agent', {
        component: 'SelfOnboardDemo',
        action: 'createDemoAgent',
        agentName: name.trim(),
      });

      // Call the public API endpoint
      const resp = await fetch('/api/public/create-demo-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          contextPrompt: contextPrompt.trim(),
          startingMessage,
          knowledgeBase,
          conversationConfig,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setIsSubmitting(false);

        // Handle rate limiting
        if (resp.status === 429) {
          toast.error(
            data.message || 'Rate limit exceeded. Please try again later.',
          );
          return;
        }

        throw new Error(data.error || 'Failed to create agent');
      }

      if (data.success && data.agent) {
        setCreatedAgent({
          id: data.agent.elevenlabs_agent_id, // Use ElevenLabs ID as the ID
          name: data.agent.name,
          elevenlabs_agent_id: data.agent.elevenlabs_agent_id,
        });
        toast.success('Agent created successfully!');
        setStep('conversation');
      }
      setIsSubmitting(false);
    } catch (err) {
      logger.error(
        'Failed to create agent',
        err instanceof Error ? err : new Error(String(err)),
        {
          component: 'SelfOnboardDemo',
          action: 'handleCreateAgent',
        },
      );
      toast.error(
        err instanceof Error ? err.message : 'Failed to create agent',
      );
      setIsSubmitting(false);
    }
  };

  // If feature is disabled, show a friendly message
  if (!featuresFlagConfig.enableSelfOnboardDemo) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md space-y-4 text-center">
          <div className="text-6xl">🚧</div>
          <h1 className="text-2xl font-bold">Demo Currently Unavailable</h1>
          <p className="text-muted-foreground">
            The self-onboard demo is currently disabled. Please contact us to
            learn more about our AI voice agents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/30">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                Public Demo • Free to Try
              </span>
            </div>
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Create Your AI Voice Agent
          </h1>
          <p className="text-muted-foreground mx-auto mb-4 max-w-2xl text-base leading-relaxed sm:text-lg">
            Build and test your own AI voice agent in minutes. Once created, you
            can have a real-time conversation with it directly in your browser.{' '}
            <strong className="font-semibold">No sign-up required!</strong>
          </p>
          <div className="mx-auto inline-flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
              <span className="text-xs">ℹ️</span>
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong className="font-semibold">Demo Mode:</strong> Agents are
              created for testing purposes only and are not saved to an account.
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-2">
          <CardHeader className="border-b px-4 py-5 sm:px-6 sm:py-6">
            <CardTitle className="text-center text-lg font-semibold sm:text-xl">
              Agent Setup
            </CardTitle>

            {/* Step indicator */}
            <div className="mt-6 flex items-center justify-center gap-2 sm:gap-3">
              {steps.map((s, idx) => (
                <div key={s.key} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 sm:h-11 sm:w-11 ${
                        idx < stepIndex
                          ? 'bg-green-500 text-white'
                          : idx === stepIndex
                            ? 'bg-primary text-primary-foreground ring-primary/20 font-semibold ring-2 ring-offset-2'
                            : 'bg-muted text-muted-foreground border-2'
                      }`}
                    >
                      {idx < stepIndex ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <div className="flex h-4 w-4 items-center justify-center sm:h-5 sm:w-5">
                          {s.icon}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-0">
                      <span
                        className={`text-center text-[10px] font-medium sm:text-xs ${
                          idx <= stepIndex
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`mb-5 h-0.5 w-8 transition-colors duration-200 sm:w-12 ${
                        idx < stepIndex ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {step === 'use-case' && (
              <div className="animate-in fade-in duration-300">
                <UseCaseStep
                  selectedUseCase={useCase}
                  onSelectUseCase={setUseCase}
                />
              </div>
            )}

            {step === 'details' && (
              <div className="animate-in fade-in duration-300">
                <DetailsStep
                  name={name}
                  onNameChange={setName}
                  onNameEdited={() => setNameManuallyEdited(true)}
                  contextPrompt={contextPrompt}
                  onContextPromptChange={(value) => {
                    setContextPrompt(value);
                    setContextPromptManuallyEdited(true);
                  }}
                  firstMessage={firstMessage}
                  onFirstMessageChange={(value) => {
                    setFirstMessage(value);
                    setFirstMessageManuallyEdited(true);
                  }}
                  enableAiGeneration={true}
                  agentName={name}
                  industry={industry}
                />
              </div>
            )}

            {step === 'conversation' && createdAgent && (
              <div className="animate-in fade-in space-y-6 duration-300">
                {/* Success Banner */}
                <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/30">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 shadow-lg">
                        <Check className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                        🎉 Your Agent is Ready!
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-green-800 dark:text-green-200">
                        Meet{' '}
                        <strong className="font-semibold">
                          {createdAgent.name}
                        </strong>
                        , your new AI voice assistant. Tap the call button below
                        to have a real-time conversation!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Voice Chat Inline */}
                <RealtimeVoiceChat
                  agentId={createdAgent.id}
                  agentName={createdAgent.name}
                  elevenlabsAgentId={createdAgent.elevenlabs_agent_id}
                  inline={true}
                />

                {/* Email Capture & Calendly */}
                {!emailSent ? (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1 space-y-2">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                            Interested in using AI agents for your organization?
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Leave your email and we&apos;ll send you more
                            information, or book a demo call directly.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1"
                          disabled={isSendingEmail}
                        />
                        <Button
                          onClick={async () => {
                            if (!email.trim()) {
                              toast.error('Please enter your email');
                              return;
                            }

                            setIsSendingEmail(true);

                            try {
                              const response = await fetch(
                                '/api/public/send-demo-interest',
                                {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    email: email.trim(),
                                    agentName: createdAgent.name,
                                    useCase: useCase,
                                    contextPrompt: contextPrompt,
                                  }),
                                },
                              );

                              if (!response.ok) {
                                throw new Error('Failed to send email');
                              }

                              setEmailSent(true);
                              toast.success(
                                "Thank you! We'll be in touch soon.",
                              );
                            } catch {
                              toast.error('Failed to send. Please try again.');
                            } finally {
                              setIsSendingEmail(false);
                            }
                          }}
                          disabled={isSendingEmail || !email.trim()}
                          className="sm:w-auto"
                        >
                          {isSendingEmail ? (
                            <>
                              <Spinner className="mr-2 h-3 w-3" />
                              Sending...
                            </>
                          ) : (
                            'Send'
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <div className="bg-muted h-px flex-1" />
                        <span className="text-muted-foreground text-xs">
                          or
                        </span>
                        <div className="bg-muted h-px flex-1" />
                      </div>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          window.open(
                            'https://calendly.com/jerome-callhenk/30min',
                            '_blank',
                          );
                        }}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Book a 30-min Demo Call
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
                    <div className="flex items-start gap-3">
                      <Check className="mt-1 h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100">
                          Thank you for your interest!
                        </h4>
                        <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                          We&apos;ve received your information and will be in
                          touch soon.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            window.open(
                              'https://calendly.com/jerome-callhenk/30min',
                              '_blank',
                            );
                          }}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Or Book a Call Now
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          {/* Footer with action buttons */}
          <div className="bg-muted/20 border-t px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex w-full flex-col-reverse items-center justify-between gap-2 sm:flex-row">
              {step === 'conversation' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStep('details');
                    // Clear created agent when going back to edit
                    setCreatedAgent(null);
                  }}
                  className="w-full transition-colors duration-200 sm:w-auto"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Edit
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-muted-foreground hover:text-foreground w-full transition-colors duration-200 sm:w-auto"
                >
                  Exit
                </Button>
              )}
              <div className="flex w-full items-center gap-2 sm:w-auto">
                {step !== 'conversation' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goBack}
                      disabled={stepIndex === 0}
                      className="flex-1 transition-opacity duration-200 sm:flex-none"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {stepIndex < steps.length - 2 ? (
                      <Button
                        onClick={goNext}
                        disabled={!canProceed()}
                        size="sm"
                        className="flex-1 transition-opacity duration-200 sm:flex-none"
                      >
                        Next <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleCreateAgent}
                        disabled={isSubmitting || !canProceed()}
                        size="sm"
                        className="flex-1 transition-opacity duration-200 sm:flex-none"
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner className="mr-2 h-3 w-3" />
                            {createdAgent ? 'Updating...' : 'Creating...'}
                          </>
                        ) : createdAgent ? (
                          'Update & Test Agent'
                        ) : (
                          'Create & Test Agent'
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Loading overlay during agent creation */}
      {isSubmitting && (
        <div className="bg-background/80 animate-in fade-in pointer-events-none fixed inset-0 z-[100] backdrop-blur-sm duration-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3 px-4 text-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
              <div className="space-y-1">
                <p className="text-foreground text-sm font-medium">
                  Creating your agent...
                </p>
                <p className="text-muted-foreground text-xs">
                  This will only take a moment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
