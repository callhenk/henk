'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Target,
  Building2,
  Settings,
  Eye,
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

import { AgentTypesStep, AGENT_TYPES } from './agent-types-step';
import { UseCaseStep } from './use-case-step';
import { IndustryStep } from './industry-step';
import { DetailsStep } from './details-step';
import { ReviewStep } from './review-step';

interface CreateAgentPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type StepType =
  | 'agent-type'
  | 'use-case'
  | 'industry'
  | 'details'
  | 'review';

// Default workflow template for all agents
const DEFAULT_WORKFLOW = {
  nodes: [
    { node_id: 'start', node_type: 'agent', initial_message: '' },
    { node_id: 'end', node_type: 'end' },
  ],
  edges: [
    {
      source_node_id: 'start',
      target_node_id: 'end',
      edge_type: 'none',
    },
  ],
};

export function CreateAgentPanel({
  open,
  onOpenChange,
}: CreateAgentPanelProps) {
  const router = useRouter();
  const { data: user } = useUser();
  const createAgentMutation = useCreateAgent();

  // ElevenLabs-aligned flow state
  const [agentType, setAgentType] = useState<keyof typeof AGENT_TYPES | null>(null);
  const [useCase, setUseCase] = useState<string | null>(null);
  const [industry, setIndustry] = useState<string | null>(null);

  // Agent details
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [website, setWebsite] = useState('');
  const [chatOnly, setChatOnly] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<StepType>('agent-type');

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
      key: 'industry',
      title: 'Industry',
      icon: <Building2 className="h-4 w-4" />,
      description: 'Your sector',
    },
    {
      key: 'details',
      title: 'Details',
      icon: <Settings className="h-4 w-4" />,
      description: 'Name & goal',
    },
    {
      key: 'review',
      title: 'Review',
      icon: <Eye className="h-4 w-4" />,
      description: 'Confirm & create',
    },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  const canProceed = () => {
    switch (step) {
      case 'agent-type':
        return agentType !== null;
      case 'use-case':
        return useCase !== null;
      case 'industry':
        return industry !== null;
      case 'details':
        return Boolean(name.trim() && goal.trim());
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    const currentStepIndex = steps.findIndex((s) => s.key === step);
    if (currentStepIndex >= 0 && currentStepIndex < steps.length - 1 && canProceed()) {
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
      // Get system prompt from agent type
      const agentTypeTemplate = agentType ? AGENT_TYPES[agentType] : null;
      const baseSystemPrompt = agentTypeTemplate?.systemPrompt || '';

      // Build comprehensive conversation config
      const conversationConfig = {
        asr: {
          quality: 'high',
          language: 'en',
        },
        llm: {
          model: 'gpt-4-turbo',
          temperature: 0.7,
          max_tokens: 500,
        },
        tts: {
          stability: 75,
          similarity_boost: 75,
        },
        agent: {
          prompt: baseSystemPrompt,
          first_message: `Hi! I'm ${name}. ${goal}`,
          language: 'en',
        },
      };

      // 1) Create ElevenLabs agent with full configuration
      const elevenLabsAgentConfig: Record<string, unknown> = {
        name: name.trim(),
        conversation_config: conversationConfig,
        workflow: DEFAULT_WORKFLOW,
      };

      console.log('[create-agent] Sending full config to /api/elevenlabs-agent:', {
        name: elevenLabsAgentConfig.name,
        agentType,
        useCase,
        industry,
        chatOnly,
        hasConversationConfig: Boolean(elevenLabsAgentConfig.conversation_config),
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
        console.error('[create-agent] ElevenLabs agent creation failed:', {
          status: resp.status,
          body: raw?.slice(0, 500),
          parsed: elevenlabsData,
        });
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
        description: goal.trim() || null,
        voice_type: 'ai_generated',
        voice_id: '',
        knowledge_base: {
          agentType,
          useCase,
          industry,
          website,
          chatOnly,
          systemPrompt: conversationConfig.agent.prompt,
          firstMessage: conversationConfig.agent.first_message,
          llmModel: 'gpt-4-turbo',
          temperature: 0.7,
          maxTokens: 500,
          asrQuality: 'high',
          ttsStability: 75,
        },
        status: chatOnly ? 'chat' : 'active',
        elevenlabs_agent_id: elevenlabsAgentId,
      });

      // 3) Assign default phone to agent (caller_id) - only if not chat-only
      if (!chatOnly) {
        const DEFAULT_PHONE_NUMBER_ID = 'phnum_5301k1ge5gxvejpvsdvw7ey565pc';
        if (created?.id) {
          console.log('[create-agent] assign-phone start', {
            agentId: created.id,
            phoneNumberId: DEFAULT_PHONE_NUMBER_ID,
          });
          try {
            const phoneResp = await fetch(`/api/agents/${created.id}/assign-phone`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone_number_id: DEFAULT_PHONE_NUMBER_ID }),
            }).catch((e) => {
              console.warn('[create-agent] assign-phone network error', e);
              return undefined as unknown as Response;
            });
            if (phoneResp) {
              const raw = await phoneResp.text().catch(() => '');
              console.log('[create-agent] assign-phone response', {
                status: phoneResp.status,
                ok: phoneResp.ok,
                bodyPreview: raw?.slice(0, 300),
              });
            }
          } catch (err) {
            console.warn('[create-agent] assign-phone failed', err);
          }
        }
      }

      if (created?.id) {
        // Navigate to details page
        router.push(`/home/agents/${created.id}`);
      }
      toast.success('Agent created successfully!');
    } catch (err) {
      console.error('Failed to create agent', err);
      toast.error(
        err instanceof Error ? err.message : 'Failed to create agent'
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
            setIndustry(null);
            setName('');
            setGoal('');
            setWebsite('');
            setChatOnly(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl p-0 max-h-[90vh] flex flex-col">
          <DialogHeader className="border-b px-6 py-5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-semibold">
                  Create Agent
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Set up a new AI voice agent for your campaigns
                </DialogDescription>
              </div>
            </div>

            {/* Step indicator */}
            <div className="mt-4 grid grid-cols-5 gap-2">
              {steps.map((s, idx) => (
                <div
                  key={s.key}
                  className={`rounded-lg px-3 py-2 text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                    idx <= stepIndex
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'border bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center h-5">
                    {idx < stepIndex ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span className="font-medium text-[9px] leading-tight text-center">{s.title}</span>
                </div>
              ))}
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-5">
              {step === 'agent-type' && (
                <AgentTypesStep selectedType={agentType} onSelectType={setAgentType} />
              )}

              {step === 'use-case' && (
                <UseCaseStep selectedUseCase={useCase} onSelectUseCase={setUseCase} />
              )}

              {step === 'industry' && (
                <IndustryStep selectedIndustry={industry} onSelectIndustry={setIndustry} />
              )}

              {step === 'details' && (
                <DetailsStep
                  name={name}
                  onNameChange={setName}
                  goal={goal}
                  onGoalChange={setGoal}
                  website={website}
                  onWebsiteChange={setWebsite}
                  chatOnly={chatOnly}
                  onChatOnlyChange={setChatOnly}
                />
              )}

              {step === 'review' && (
                <ReviewStep
                  agentType={agentType}
                  useCase={useCase}
                  industry={industry}
                  name={name}
                  goal={goal}
                  website={website}
                  chatOnly={chatOnly}
                />
              )}
            </div>
          </div>

          <DialogFooter className="border-t px-6 py-3 flex-shrink-0 bg-muted/20">
            <div className="flex w-full items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground">
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goBack}
                  disabled={stepIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {stepIndex < steps.length - 1 ? (
                  <Button onClick={goNext} disabled={!canProceed()} size="sm">
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canProceed()}
                    size="sm"
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
        <div className="bg-background/80 animate-in fade-in pointer-events-none fixed inset-0 z-[100] backdrop-blur-sm duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3 px-4 text-center">
              <div className="relative">
                <div className="border-primary/30 h-8 w-8 rounded-full border-2"></div>
                <div className="border-primary absolute inset-0 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
              </div>
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
