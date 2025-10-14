'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Clock,
  Headphones,
  MessageSquare,
  Play,
  TrendingUp,
  User,
} from 'lucide-react';

import { useConversation } from '@kit/supabase/hooks/conversations/use-conversations';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Separator } from '@kit/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { StatsCard } from '~/components/shared';

type ElevenTranscriptItem = {
  role: 'user' | 'assistant' | string;
  time_in_call_secs?: number;
  message?: string;
};

type ElevenConversation = {
  agent_id?: string;
  conversation_id: string;
  status?:
    | 'initiated'
    | 'in-progress'
    | 'processing'
    | 'done'
    | 'failed'
    | string;
  transcript?: ElevenTranscriptItem[];
  metadata?: {
    start_time_unix_secs?: number;
    call_duration_secs?: number;
  } | null;
  has_audio?: boolean;
  has_user_audio?: boolean;
  has_response_audio?: boolean;
  analysis?: unknown | null;
};

export function ConversationDetail({
  conversationId,
}: {
  conversationId: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<ElevenConversation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const { data: localConversation } = useConversation(conversationId);

  // Prefer the external ElevenLabs conversation_id stored in our DB
  const externalConversationId = useMemo<string | null>(() => {
    return (
      ((localConversation as unknown as { conversation_id?: string } | null)
        ?.conversation_id ??
        null) ||
      null
    );
  }, [localConversation]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const idForFetch = externalConversationId || conversationId;
        const res = await fetch(
          `/api/elevenlabs/conversations/${encodeURIComponent(idForFetch)}`,
        );
        const json = await res.json();
        if (!res.ok || !json?.success) {
          const message =
            typeof json?.error === 'string' ? json.error : json?.error?.message;
          throw new Error(message || res.statusText);
        }
        if (!cancelled) setData(json.data as ElevenConversation);
      } catch (e) {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : 'Failed to load conversation',
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [conversationId, externalConversationId]);

  const durationSeconds = useMemo(() => {
    return data?.metadata?.call_duration_secs ?? 0;
  }, [data]);

  const callDate = useMemo(() => {
    const ts = data?.metadata?.start_time_unix_secs;
    return ts ? new Date(ts * 1000) : null;
  }, [data]);

  const transcriptText = useMemo(() => {
    if (!data?.transcript?.length) return '';
    return data.transcript
      .map(
        (t) =>
          `${t.role === 'assistant' ? 'Agent' : 'User'}${t.time_in_call_secs != null ? ` (${t.time_in_call_secs}s)` : ''}: ${t.message ?? ''}`,
      )
      .join('\n\n');
  }, [data]);

  const handleBack = () => {
    router.push('/home/conversations');
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }

    if (remainingSeconds > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${minutes}m`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Conversations
          </Button>
        </div>
        <div className="text-muted-foreground text-sm">
          Loading conversation…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Conversations
          </Button>
        </div>
        <div className="text-destructive text-sm">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Conversations
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Call Duration"
          value={formatDuration(durationSeconds)}
          subtitle="Total time"
          icon={Clock}
        />
        <StatsCard
          title="Sentiment"
          value={data.status ?? 'unknown'}
          subtitle="Status from API"
          icon={User}
        />
        <StatsCard
          title="Audio"
          value={data.has_audio ? 'Available' : 'No'}
          subtitle="Recording presence"
          icon={Headphones}
        />
        <StatsCard
          title="Conversation ID"
          value={data.conversation_id}
          subtitle="Reference"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className={'glass-panel'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Call Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Agent ID
                  </label>
                  <p className="text-base">{data.agent_id ?? '-'}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Call Date
                  </label>
                  <p className="text-base">
                    {callDate ? formatDate(callDate) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Status
                  </label>
                  <p className="text-base">{data.status ?? 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Conversation ID
                  </label>
                  <p className="text-base">{data.conversation_id}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Recording
                  </label>
                  <p className="text-base">
                    {localConversation?.recording_url ? 'Available' : 'None'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="summary">AI Summary</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="mt-6">
              <Card className={'glass-panel'}>
                <CardHeader>
                  <CardTitle>Call Transcript</CardTitle>
                  <CardDescription>Conversation turns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 space-y-4 overflow-y-auto">
                    {transcriptText
                      ?.split('\n\n')
                      .filter(Boolean)
                      .map((exchange, index, arr) => (
                        <div key={index} className="space-y-2">
                          <div className="text-muted-foreground text-sm">
                            {exchange}
                          </div>
                          {index < arr.length - 1 && <Separator />}
                        </div>
                      ))}
                    {!transcriptText && (
                      <div className="text-muted-foreground text-sm">
                        No transcript available.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="mt-6">
              <Card className={'glass-panel'}>
                <CardHeader>
                  <CardTitle>AI Analysis</CardTitle>
                  <CardDescription>Insights (if provided)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-muted-foreground text-sm">
                    No analysis available.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Card className={'glass-panel'}>
                <CardHeader>
                  <CardTitle>Call Analytics</CardTitle>
                  <CardDescription>Metrics from metadata</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Talk Time</span>
                        <span>{formatDuration(durationSeconds)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>User Audio</span>
                        <span>{data.has_user_audio ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Response Audio</span>
                        <span>{data.has_response_audio ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className={'glass-panel'}>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={async () => {
                  const url = localConversation?.recording_url ?? null;
                  if (!url) return;
                  try {
                    if (!audioRef.current) {
                      audioRef.current = new Audio(url);
                    }
                    if (isPlaying) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    } else {
                      await audioRef.current.play();
                      setIsPlaying(true);
                      audioRef.current.onended = () => setIsPlaying(false);
                    }
                  } catch {
                    setIsPlaying(false);
                  }
                }}
                disabled={!localConversation?.recording_url}
              >
                <Play className="mr-2 h-4 w-4" />
                {isPlaying ? 'Pause' : 'Listen to Call'}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  const text =
                    transcriptText ||
                    (localConversation?.transcript as unknown as string) ||
                    '';
                  const blob = new Blob([text], {
                    type: 'text/plain;charset=utf-8',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `conversation-${conversationId}-transcript.txt`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                }}
                disabled={!transcriptText && !localConversation?.transcript}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Download Transcript
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  const payload = {
                    conversation_id: data.conversation_id,
                    elevenlabs: data,
                    local: localConversation ?? null,
                  };
                  const blob = new Blob([JSON.stringify(payload, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `conversation-${conversationId}.json`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                }}
              >
                <Headphones className="mr-2 h-4 w-4" />
                Export Summary
              </Button>
            </CardContent>
          </Card>

          <Card className={'glass-panel'}>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Duration (s)
                </span>
                <span className="text-sm font-medium">{durationSeconds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Has Audio</span>
                <span className="text-sm font-medium">
                  {data.has_audio ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Turns</span>
                <span className="text-sm font-medium">
                  {data.transcript?.length ?? 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
