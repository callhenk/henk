'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Settings,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

import { useCreateAgent } from '@kit/supabase/hooks/agents/use-agent-mutations';
import { useUser } from '@kit/supabase/hooks/use-user';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Spinner } from '@kit/ui/spinner';

import { DEFAULT_PHONE_NUMBER_ID } from '~/lib/constants';
import { generateAgentPrompts } from '~/lib/generate-agent-prompts';
import { logger } from '~/lib/utils';

import { AGENT_TYPES, AgentTypesStep } from './agent-types-step';
import { DetailsStep } from './details-step';
import { UseCaseStep } from './use-case-step';

interface CreateAgentPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type StepType = 'agent-type' | 'use-case' | 'details';

export function CreateAgentPanel({
  open,
  onOpenChange,
}: CreateAgentPanelProps) {
  const router = useRouter();
  const { data: user } = useUser();
  const createAgentMutation = useCreateAgent();

  // ElevenLabs-aligned flow state
  const [agentType, setAgentType] = useState<keyof typeof AGENT_TYPES | null>(
    null,
  );
  const [useCase, setUseCase] = useState<string | null>(null);
  // Industry is always "non profit" for this platform
  const industry = 'non profit';

  // Agent details
  const [name, setName] = useState('');
  const [contextPrompt, setContextPrompt] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<StepType>('agent-type');

  // Track if user has manually edited name
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);

  // Extract name from context prompt using LLM when it changes
  useEffect(() => {
    // Only auto-extract if user hasn't manually edited the name field
    if (!nameManuallyEdited && contextPrompt && contextPrompt.length > 10) {
      // Debounce the API call to avoid too many requests while user is typing
      const timeoutId = setTimeout(async () => {
        try {
          const response = await fetch('/api/agents/extract-name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: contextPrompt }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.name) {
              // Only update if the extracted name is different from current
              if (data.name !== name) {
                setName(data.name);
              }
            }
          }
        } catch (error) {
          // Silently fail - name extraction is a nice-to-have feature
          console.debug('Name extraction failed:', error);
        }
      }, 1000); // Wait 1 second after user stops typing

      return () => clearTimeout(timeoutId);
    }
  }, [contextPrompt, nameManuallyEdited, name]);

  // Generate dynamic prompts based on use case and industry (takes priority)
  useEffect(() => {
    if (agentType && useCase && industry) {
      const generatedPrompts = generateAgentPrompts({
        agentType,
        useCase,
        industry,
      });

      // Update context prompt with generated content
      setContextPrompt(generatedPrompts.contextPrompt);

      // Set default name from generated prompts if user hasn't manually edited
      if (!nameManuallyEdited && generatedPrompts.defaultName) {
        setName(generatedPrompts.defaultName);
      }
    } else if (agentType && (!useCase || !industry)) {
      // Only use basic template if use case or industry hasn't been selected yet
      const template = AGENT_TYPES[agentType];
      // Only set defaults if user hasn't manually edited them and fields are empty
      if (!nameManuallyEdited && !name && template.defaultAgentName) {
        setName(template.defaultAgentName);
      }
      // Auto-populate context prompt from agent type if empty
      if (!contextPrompt && template.contextPrompt) {
        setContextPrompt(template.contextPrompt);
      }
    }
  }, [agentType, useCase, industry, nameManuallyEdited, name, contextPrompt]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!user?.id) return;
    setIsSubmitting(true);

    try {
      // Get system prompt from agent type template
      const agentTypeTemplate = agentType ? AGENT_TYPES[agentType] : null;
      const baseSystemPrompt =
        agentTypeTemplate?.systemPrompt || 'You are a helpful AI assistant.';

      // Generate the starting message for ElevenLabs
      const generatedPrompts = generateAgentPrompts({
        agentType: agentType || 'blank',
        useCase,
        industry,
      });
      const startingMessage = generatedPrompts.startingMessage;

      // Build conversation config with required fields for ElevenLabs
      const conversationConfig = {
        agent: {
          first_message: startingMessage,
          language: 'en',
          prompt: {
            prompt: contextPrompt.trim(), // Use the context prompt as the main prompt
            llm: 'gpt-4o-mini',
            max_tokens: 1024,
          },
        },
      };

      // 1) Create ElevenLabs agent with conversation config
      const elevenLabsAgentConfig: Record<string, unknown> = {
        name: name.trim(),
        conversation_config: conversationConfig,
        context_data: {
          donor_context: contextPrompt.trim(), // Store context prompt in context_data for reference
        },
      };

      logger.debug('Sending agent config to ElevenLabs', {
        component: 'CreateAgentPanel',
        action: 'createElevenLabsAgent',
        agentName: elevenLabsAgentConfig.name as string,
        agentType,
        useCase,
        industry,
        hasConversationConfig: Boolean(
          elevenLabsAgentConfig.conversation_config,
        ),
        hasWorkflow: Boolean(elevenLabsAgentConfig.workflow),
        hasVoiceId: Boolean(elevenLabsAgentConfig.voice_id),
      });

      const resp = await fetch('/api/elevenlabs-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentConfig: elevenLabsAgentConfig }),
      });

      const raw = await resp.text();
      let elevenlabsData: unknown = {};
      try {
        elevenlabsData = raw ? JSON.parse(raw) : {};
      } catch {
        // ignore JSON parse error
      }

      if (!resp.ok) {
        logger.error(
          'ElevenLabs agent creation failed',
          new Error('API request failed'),
          {
            component: 'CreateAgentPanel',
            action: 'createElevenLabsAgent',
            status: resp.status,
            responsePreview: raw?.slice(0, 500),
            parsedData: elevenlabsData,
          },
        );
        setIsSubmitting(false);
        throw new Error(
          ((elevenlabsData as Record<string, unknown>)?.error as
            | string
            | undefined) || 'Failed to create ElevenLabs agent',
        );
      }
      const elevenlabsAgentId: string | null = (() => {
        const root = elevenlabsData as Record<string, unknown>;
        const data = root?.data as Record<string, unknown> | undefined;
        const idFromData = (data?.agent_id as string | undefined) ?? null;
        const idFromRoot = (root?.agent_id as string | undefined) ?? null;
        return idFromData ?? idFromRoot;
      })();

      // 2) Create agent record in DB
      const created = await createAgentMutation.mutateAsync({
        name: name.trim(),
        donor_context: contextPrompt.trim() || null, // Save context prompt to donor_context field
        starting_message: startingMessage || null, // Save starting message as top-level field
        voice_type: 'ai_generated',
        voice_id: '',
        knowledge_base: {
          agentType,
          useCase,
          industry,
          contextPrompt: contextPrompt.trim(), // User-provided context prompt
          systemPrompt: baseSystemPrompt, // System prompt from agent type
          startingMessage: startingMessage, // Generated starting message
          firstMessage: startingMessage, // For compatibility
          llmModel: 'gpt-4o-mini',
          temperature: 0.7,
          maxTokens: 1024,
          asrQuality: 'high',
          ttsStability: 75,
        },
        status: 'active',
        elevenlabs_agent_id: elevenlabsAgentId,
      });

      // 3) Assign default phone to agent (caller_id)
      if (created?.id) {
        try {
          const phoneResp = await fetch(
            `/api/agents/${created.id}/assign-phone`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phone_number_id: DEFAULT_PHONE_NUMBER_ID,
              }),
            },
          ).catch((e) => {
            logger.warn('Phone assignment network error', {
              component: 'CreateAgentPanel',
              action: 'assignPhone',
              agentId: created.id,
              error: e,
            });
            return undefined as unknown as Response;
          });
          if (phoneResp) {
            const raw = await phoneResp.text().catch(() => '');
            logger.debug('Phone assignment response received', {
              component: 'CreateAgentPanel',
              action: 'assignPhone',
              agentId: created.id,
              status: phoneResp.status,
              ok: phoneResp.ok,
              responsePreview: raw?.slice(0, 300),
            });
          }
        } catch (err) {
          logger.warn('Phone assignment failed', {
            component: 'CreateAgentPanel',
            action: 'assignPhone',
            agentId: created.id,
            error: err,
          });
        }
      }

      if (created?.id) {
        // Navigate to details page
        router.push(`/home/agents/${created.id}`);
      }
      toast.success('Agent created successfully!');
    } catch (err) {
      logger.error(
        'Failed to create agent',
        err instanceof Error ? err : new Error(String(err)),
        {
          component: 'CreateAgentPanel',
          action: 'handleSubmit',
          agentName: name,
          agentType,
          useCase,
          industry,
        },
      );
      toast.error(
        err instanceof Error ? err.message : 'Failed to create agent',
      );
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          onOpenChange(o);
          if (!o) {
            setStep('agent-type');
            // Reset form
            setAgentType(null);
            setUseCase(null);
            setName('');
            setContextPrompt('');
          }
        }}
      >
        <DialogContent className="flex max-h-[100vh] w-full flex-col rounded-none p-0 sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg">
          <DialogHeader className="flex-shrink-0 border-b px-4 py-5 sm:px-6 sm:py-6">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold sm:text-xl">
                Create Agent
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Set up a new AI voice agent for your campaigns
              </DialogDescription>
            </div>

            {/* Step indicator */}
            <div className="mt-3 grid grid-cols-3 gap-1 sm:mt-4 sm:gap-2">
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
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-5 sm:px-6 sm:py-6">
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
                    onContextPromptChange={setContextPrompt}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="bg-muted/20 flex-shrink-0 border-t px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex w-full flex-col-reverse items-center justify-between gap-2 sm:flex-row">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-foreground w-full transition-colors duration-200 sm:w-auto"
              >
                Cancel
              </Button>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goBack}
                  disabled={stepIndex === 0}
                  className="flex-1 transition-opacity duration-200 sm:flex-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {stepIndex < steps.length - 1 ? (
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
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canProceed()}
                    size="sm"
                    className="flex-1 transition-opacity duration-200 sm:flex-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="mr-2 h-3 w-3" />
                        Creating...
                      </>
                    ) : (
                      'Create Agent'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </>
  );
}
