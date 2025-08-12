'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { User, Volume2, X } from 'lucide-react';
import { toast } from 'sonner';

import { useCreateAgent } from '@kit/supabase/hooks/agents/use-agent-mutations';
import { useUser } from '@kit/supabase/hooks/use-user';
import { useVoices } from '@kit/supabase/hooks/voices/use-voices';
import { Button } from '@kit/ui/button';
// Removed @kit/ui/form usage in favor of plain markup since we're not using react-hook-form context
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@kit/ui/sheet';
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

      toast.success('Agent created');
      onOpenChange(false);
      if (created?.id) {
        router.push(`/home/agents/${created.id}`);
      }
    } catch (err) {
      console.error('Failed to create agent', err);
      toast.error('Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-card m-4 flex max-h-[calc(100vh-2rem)] min-h-fit w-full max-w-full flex-col overflow-hidden rounded-2xl border !p-0 sm:m-6 sm:max-h-[calc(100vh-3rem)] sm:w-[480px] md:w-[640px] lg:m-8 lg:w-[720px] [&>button]:hidden"
        style={{
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.15)',
        }}
      >
        <SheetHeader className="bg-card sticky top-0 z-10 border-b px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Create Agent
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-600 dark:text-gray-300">
                Set up a new AI voice agent for your campaigns
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="bg-muted hover:bg-muted/80 rounded-full border"
            >
              <X className="h-4 w-4 text-gray-700 dark:text-gray-200" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="overflow-y-auto px-6 py-6">
            <form id="agent-form" onSubmit={handleSubmit} className="space-y-8">
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
            </form>
          </div>

          {/* Submit Buttons */}
          <div className="bg-card mt-auto border-t px-6 py-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                form="agent-form"
                disabled={isSubmitting}
                className="w-full bg-blue-500/80 hover:bg-blue-600/80 sm:w-auto sm:flex-1"
              >
                {isSubmitting ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  'Create Agent'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full border-red-400/30 bg-red-500/10 hover:bg-red-500/20 sm:w-auto dark:hover:bg-red-500/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
