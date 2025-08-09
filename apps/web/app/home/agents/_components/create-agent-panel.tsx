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
      // 1) Create ElevenLabs agent first (same flow as AgentForm)
      const elevenLabsAgentConfig = {
        name: name.trim(),
        description: description.trim(),
        voice_id: voiceId || '',
        llm_model: 'gpt-4o',
        voice_settings: {},
        context_data: {
          organization_info: '',
          donor_context: '',
          faqs: {},
        },
        conversation_flow: {
          greeting: `Hello! I'm ${name.trim()}, and I'm here to help with your fundraising needs.`,
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
        },
        status: 'active',
        account_id: user.id,
      };

      const resp = await fetch('/api/elevenlabs-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...elevenLabsAgentConfig }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to create ElevenLabs agent');
      }
      const elevenlabsData = await resp.json();
      const elevenlabsAgentId: string | null =
        elevenlabsData?.data?.agent_id || null;

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
        className="m-2 flex h-dvh w-full max-w-full flex-col overflow-hidden rounded-2xl border border-white/30 !bg-white/95 !p-0 sm:m-4 sm:h-screen sm:w-[480px] sm:rounded-2xl sm:border-white/30 md:w-[640px] lg:m-6 lg:w-[720px] dark:border-white/10 dark:!bg-neutral-900/85 [&>button]:hidden"
      >
        <SheetHeader className="sticky top-0 z-10 border-b border-white/30 bg-white/95 px-4 py-4 dark:border-white/10 dark:bg-neutral-900/85">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold">
                Create Agent
              </SheetTitle>
              <SheetDescription className="text-muted-foreground text-sm">
                Set up a new AI voice agent for your campaigns
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <form onSubmit={handleSubmit} className="space-y-8">
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

            <div className="sticky bottom-0 z-10 -mx-4 flex gap-3 border-t border-white/30 bg-white/95 px-4 py-4 dark:border-white/10 dark:bg-neutral-900/85">
              <Button type="submit" disabled={isSubmitting}>
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
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-400/40 dark:text-red-400 dark:hover:bg-red-400/10"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
