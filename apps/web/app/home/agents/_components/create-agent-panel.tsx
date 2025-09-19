'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Check, ChevronLeft, ChevronRight, User, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

import { useCreateAgent } from '@kit/supabase/hooks/agents/use-agent-mutations';
import { useUser } from '@kit/supabase/hooks/use-user';
import { useVoices } from '@kit/supabase/hooks/voices/use-voices';
import { Button } from '@kit/ui/button';
// Removed @kit/ui/form usage in favor of plain markup since we're not using react-hook-form context
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Spinner } from '@kit/ui/spinner';
import { Textarea } from '@kit/ui/textarea';

interface CreateAgentPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAgentPanel({
  open,
  onOpenChange,
}: CreateAgentPanelProps) {
  const router = useRouter();
  const { data: user } = useUser();
  const createAgentMutation = useCreateAgent();
  const { data: voices = [] } = useVoices();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [voiceType, setVoiceType] = useState<'ai_generated' | 'custom'>(
    'ai_generated',
  );
  const [voiceId, setVoiceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const steps: Array<{
    key: 'info' | 'voice' | 'review';
    title: string;
    description?: string;
  }> = [
    {
      key: 'info',
      title: 'Agent Information',
      description: 'Name and description',
    },
    {
      key: 'voice',
      title: 'Voice',
      description: 'Choose voice type and voice',
    },
    { key: 'review', title: 'Review', description: 'Confirm and create' },
  ];

  const canProceed = () => {
    if (step === 0) return Boolean(name.trim());
    if (step === 1)
      return voiceType === 'ai_generated'
        ? Boolean(voiceId) || voices.length === 0
        : true;
    return true;
  };

  const goNext = () => {
    if (step < 2 && canProceed()) setStep((s) => (s + 1) as 0 | 1 | 2);
  };

  const goBack = () => {
    if (step > 0) setStep((s) => (s - 1) as 0 | 1 | 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!user?.id) return;
    setIsSubmitting(true);

    try {
      // 1) Create ElevenLabs agent first: minimal required payload (no conversation_flow)
      const elevenLabsAgentConfig: Record<string, unknown> = {
        name: name.trim(),
        conversation_config: {},
      };
      if (voiceId && voiceId !== 'none') {
        elevenLabsAgentConfig.voice_id = voiceId;
      }

      console.log('[create-agent] Sending to /api/elevenlabs-agent:', {
        name: elevenLabsAgentConfig.name,
        hasConversationConfig:
          typeof elevenLabsAgentConfig.conversation_config === 'object',
        hasVoiceId: Boolean(
          (elevenLabsAgentConfig as { voice_id?: string }).voice_id,
        ),
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
        description: description.trim() ? description.trim() : null,
        voice_type: voiceType,
        voice_id: voiceId?.trim() ? voiceId.trim() : '',
        knowledge_base: {},
        status: 'active',
        elevenlabs_agent_id: elevenlabsAgentId,
      });

      // 3) Assign default phone to agent (caller_id)
      const DEFAULT_PHONE_NUMBER_ID = 'phnum_5301k1ge5gxvejpvsdvw7ey565pc';
      if (created?.id) {
        console.log('[create-agent] assign-phone start', {
          agentId: created.id,
          phoneNumberId: DEFAULT_PHONE_NUMBER_ID,
        });
        try {
          const resp = await fetch(`/api/agents/${created.id}/assign-phone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number_id: DEFAULT_PHONE_NUMBER_ID }),
          }).catch((e) => {
            console.warn('[create-agent] assign-phone network error', e);
            return undefined as unknown as Response;
          });
          if (resp) {
            const raw = await resp.text().catch(() => '');
            console.log('[create-agent] assign-phone response', {
              status: resp.status,
              ok: resp.ok,
              bodyPreview: raw?.slice(0, 300),
            });
          }
        } catch (err) {
          console.warn('[create-agent] assign-phone failed', err);
        }
      }

      if (created?.id) {
        // Navigate immediately to prevent any gap
        router.push(`/home/agents/${created.id}`);
        // Close modal after navigation starts
        onOpenChange(false);
      }
      toast.success('Agent created');
    } catch (err) {
      console.error('Failed to create agent', err);
      toast.error('Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          onOpenChange(o);
          if (!o) setStep(0);
        }}
      >
        <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="border-b px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold">
                Create Agent
              </DialogTitle>
              <DialogDescription>
                Set up a new AI voice agent for your campaigns
              </DialogDescription>
            </div>
          </div>

          {/* Step indicator */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {steps.map((s, idx) => (
              <div
                key={s.key}
                className={
                  idx <= step
                    ? 'bg-primary text-primary-foreground rounded-md px-3 py-2 text-xs'
                    : 'rounded-md border px-3 py-2 text-xs'
                }
              >
                <div className="flex items-center gap-2">
                  <span className="bg-background text-foreground inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px]">
                    {idx < step ? <Check className="h-3 w-3" /> : idx + 1}
                  </span>
                  <span className="font-medium">{s.title}</span>
                </div>
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="overflow-y-auto px-6 py-6">
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Agent Information</h3>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Agent Name
                  </label>
                  <Input
                    placeholder="e.g., Sarah"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <p className="text-muted-foreground mt-1 text-xs">
                    Choose a friendly, memorable name.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    placeholder="Brief description"
                    className="min-h-[80px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <p className="text-muted-foreground mt-1 text-xs">
                    What this agent is for.
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold">Voice</h3>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Voice Type
                  </label>
                  <Select
                    value={voiceType}
                    onValueChange={(v) =>
                      setVoiceType(v as 'ai_generated' | 'custom')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai_generated">AI Generated</SelectItem>
                      <SelectItem value="custom">Custom Voice</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Technology powering your agent voice.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Select Voice
                  </label>
                  <Select value={voiceId} onValueChange={setVoiceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No voices available
                        </SelectItem>
                      ) : (
                        voices.map((v) => (
                          <SelectItem key={v.voice_id} value={v.voice_id}>
                            {v.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Review</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-muted-foreground text-xs">Name</div>
                    <div className="font-medium">{name || '—'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">
                      Description
                    </div>
                    <div className="font-medium">{description || '—'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">
                      Voice Type
                    </div>
                    <div className="font-medium">
                      {voiceType === 'ai_generated' ? 'AI Generated' : 'Custom'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Voice</div>
                    <div className="font-medium">
                      {voices.find((v) => v.voice_id === voiceId)?.name || '—'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <div className="flex w-full items-center justify-between gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={goBack} disabled={step === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {step < 2 ? (
                <Button onClick={goNext} disabled={!canProceed()}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceed()}
                >
                  {isSubmitting ? (
                    <Spinner className="h-4 w-4" />
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm pointer-events-none animate-in fade-in duration-300 z-[100]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3 text-center px-4">
              <div className="relative">
                <div className="w-8 h-8 border-2 border-primary/30 rounded-full"></div>
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Creating your agent...</p>
                <p className="text-xs text-muted-foreground">This will only take a moment</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
