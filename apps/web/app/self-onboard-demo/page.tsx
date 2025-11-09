'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  Settings,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Spinner } from '@kit/ui/spinner';

import featuresFlagConfig from '../../config/feature-flags.config';
import { generateAgentPrompts } from '../../lib/generate-agent-prompts';
import { logger } from '../../lib/utils';
import { RealtimeVoiceChat } from '../home/agents/[id]/_components/realtime-voice-chat';
import {
  AGENT_TYPES,
  AgentTypesStep,
} from '../home/agents/_components/agent-types-step';
import { DetailsStep } from '../home/agents/_components/details-step';
import { UseCaseStep } from '../home/agents/_components/use-case-step';

type StepType = 'agent-type' | 'use-case' | 'details' | 'conversation';

interface CreatedAgent {
  id: string;
  name: string;
  elevenlabs_agent_id: string;
}

export default function SelfOnboardDemoPage() {
  const router = useRouter();

  // Agent creation state - must be before any conditional returns
  const [step, setStep] = useState<StepType>('agent-type');
  const [agentType, setAgentType] = useState<keyof typeof AGENT_TYPES | null>(
    null,
  );
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
      key: 'agent-type',
      title: 'Agent Type',
      icon: <Briefcase className="h-4 w-4" />,
      description: 'Choose template',
    },
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
      case 'agent-type':
        return agentType !== null;
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
        <div className="mb-8 sm:mb-10">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/30">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                Public Demo • Free to Try
              </span>
            </div>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Create Your AI Voice Agent
          </h1>
          <p className="text-muted-foreground mb-4 max-w-2xl text-base leading-relaxed sm:text-lg">
            Build and test your own AI voice agent in minutes. Once created, you
            can have a real-time conversation with it directly in your browser.{' '}
            <strong className="font-semibold">No sign-up required!</strong>
          </p>
          <div className="inline-flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
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
            <CardTitle className="text-lg font-semibold sm:text-xl">
              Agent Setup
            </CardTitle>

            {/* Step indicator */}
            <div className="mt-3 grid grid-cols-4 gap-1 sm:mt-4 sm:gap-2">
              {steps.map((s, idx) => (
                <div
                  key={s.key}
                  className={`flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-xs transition-colors duration-200 sm:gap-1 sm:px-3 sm:py-2 ${
                    idx <= stepIndex
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'bg-muted text-muted-foreground border'
                  }`}
                >
                  <div className="flex h-4 items-center justify-center transition-opacity duration-200 sm:h-5">
                    {idx < stepIndex ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-[10px] font-bold sm:text-xs">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <span className="text-center text-[7px] leading-tight font-medium sm:text-[9px]">
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {step === 'agent-type' && (
              <div className="animate-in fade-in duration-300">
                <AgentTypesStep
                  selectedType={agentType}
                  onSelectType={setAgentType}
                />
              </div>
            )}

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
