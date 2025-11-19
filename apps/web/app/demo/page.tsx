'use client';

import { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';
import { Phone, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';

// Import the useAgents hook from the correct location
import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import { useBusinessContext } from '@kit/supabase/hooks/use-business-context';
import { useSignInWithEmailPassword } from '@kit/supabase/hooks/use-sign-in-with-email-password';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { verifyDemoToken } from '~/lib/demo-auth';

import { RealtimeVoiceChat } from '../home/agents/[id]/_components/realtime-voice-chat';

export default function TestCallPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isLoading: isLoadingBusinessContext, data: businessContext } =
    useBusinessContext();
  const { data: allAgents = [], isLoading: isLoadingAgents } = useAgents();
  const signInMutation = useSignInWithEmailPassword();
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [allowedAgentIds, setAllowedAgentIds] = useState<string[] | undefined>(
    undefined,
  );
  const [demoName, setDemoName] = useState<string | undefined>(undefined);

  // Phone numbers (used for test calls)
  const [availableCallerIds, setAvailableCallerIds] = useState<string[]>([]);

  // Test call state
  const [testToNumber, setTestToNumber] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isPlacingTestCall, setIsPlacingTestCall] = useState(false);

  // Direct call state
  const [showVoiceChat, setShowVoiceChat] = useState(false);

  // Auto-login with demo token credentials
  useEffect(() => {
    // Prevent multiple login attempts
    if (loginAttempted) return;

    const token = searchParams.get('token');
    if (!token) {
      // No token means unauthorized access
      setIsSigningIn(false);
      setHasValidToken(false);
      setTokenError('No access token provided');
      setLoginAttempted(true);
      return;
    }

    try {
      const credentials = verifyDemoToken(token);
      if (!credentials) {
        // Invalid token, show error
        setTokenError('Invalid or expired demo token');
        toast.error('Invalid demo token');
        setIsSigningIn(false);
        setHasValidToken(false);
        setLoginAttempted(true);
        return;
      }

      // Valid token found
      setHasValidToken(true);
      setIsSigningIn(true);
      setTokenError(null);
      setLoginAttempted(true);

      // Set allowed agent IDs if provided in token (only if non-empty array)
      if (
        credentials.allowedAgentIds &&
        Array.isArray(credentials.allowedAgentIds) &&
        credentials.allowedAgentIds.length > 0
      ) {
        setAllowedAgentIds(credentials.allowedAgentIds);
      }

      // Set demo name if provided in token
      if (credentials.demoName) {
        setDemoName(credentials.demoName);
      }

      // Auto-login with demo credentials using proper sign-in hook
      signInMutation
        .mutateAsync({
          email: credentials.email,
          password: credentials.password,
        })
        .then(() => {
          // Invalidate both business-context and agents queries to refetch with new auth session
          queryClient.invalidateQueries({ queryKey: ['business-context'] });
          queryClient.invalidateQueries({ queryKey: ['agents'] });
          // Small delay to ensure both queries complete
          setTimeout(() => {
            queryClient.refetchQueries({ queryKey: ['business-context'] });
            queryClient.refetchQueries({ queryKey: ['agents'] });
          }, 100);
          setIsSigningIn(false);
        })
        .catch(() => {
          console.error('Demo login failed:');
          setTokenError('Authentication failed with demo credentials');
          toast.error('Demo login failed');
          setHasValidToken(false);
          setIsSigningIn(false);
        });
    } catch {
      // Token parsing/decryption failed
      setTokenError('Malformed or corrupted demo token');
      toast.error('Invalid token format');
      setIsSigningIn(false);
      setHasValidToken(false);
      setLoginAttempted(true);
    }
  }, [searchParams]);

  // Load phone numbers
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/voice/phone-numbers');
        const json = await resp.json();
        if (resp.ok && json?.success && Array.isArray(json.data)) {
          const numbers = (
            json.data as Array<{
              phone_number: string;
              supports_outbound?: boolean;
            }>
          )
            .filter((n) => n.supports_outbound)
            .map((n) => n.phone_number)
            .filter((p): p is string => typeof p === 'string' && p.length > 0);
          setAvailableCallerIds(numbers);
        }
      } catch {
        // ignore
      }
    })();
  }, [isSigningIn]);

  // Check if we're still loading (business context OR agents)
  const isLoading = isLoadingBusinessContext || isLoadingAgents;

  // Filter agents based on allowedAgentIds from token
  const agents =
    allowedAgentIds && allowedAgentIds.length > 0
      ? allAgents.filter((agent) => allowedAgentIds.includes(agent.id))
      : allAgents;

  // Set default agent if available (wait for sign-in and data to load)
  useEffect(() => {
    if (!isSigningIn && !isLoading && !selectedAgentId && agents.length > 0) {
      setSelectedAgentId(agents[0]?.id ?? '');
    }
  }, [isSigningIn, isLoading, selectedAgentId, agents]);

  // Additional effect to ensure business context is properly loaded before ending sign-in
  useEffect(() => {
    if (isSigningIn && businessContext?.business_id && agents.length > 0) {
      // Business context loaded with agents available - we can finish signing in
      setIsSigningIn(false);
    }
  }, [businessContext, agents, isSigningIn]);

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);

  const handlePlaceTestCall = async () => {
    try {
      if (!selectedAgent) {
        toast.error('Please select an agent');
        return;
      }

      setIsPlacingTestCall(true);
      const resp = await fetch('/api/campaigns/simulate-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_number: testToNumber,
          agent_id: selectedAgent.elevenlabs_agent_id || undefined,
          caller_id: availableCallerIds[0] || undefined,
          lead_name: 'Test Call',
          goal_metric: 'pledge_rate',
        }),
      });
      const json = await resp.json();
      if (!resp.ok || !json?.success) {
        throw new Error(json?.error || `Failed (${resp.status})`);
      }
      toast.success('Test call started successfully!');

      // Clear the form
      setTestToNumber('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to start test call');
    } finally {
      setIsPlacingTestCall(false);
    }
  };

  const handleStartDirectCall = () => {
    if (!selectedAgent) {
      toast.error('Please select an agent');
      return;
    }
    setShowVoiceChat(true);
  };

  // Show access denied screen if no valid token
  if (!hasValidToken && !isSigningIn) {
    const isInvalidToken =
      tokenError && tokenError !== 'No access token provided';

    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <span className="text-2xl">{isInvalidToken ? '❌' : '🔒'}</span>
          </div>
          <h1 className="mb-4 text-2xl font-bold">
            {isInvalidToken ? 'Invalid Demo Token' : 'Demo Access Required'}
          </h1>

          {tokenError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Error: {tokenError}
              </p>
            </div>
          )}

          <p className="text-muted-foreground mb-6">
            {isInvalidToken
              ? 'The demo token you provided is not valid. Please check your link or contact our team for a new demo token.'
              : 'This demo requires a valid access token. Please contact our team to get access to the demonstration.'}
          </p>

          <div className="bg-muted/50 rounded-lg border p-4 text-left">
            <h3 className="mb-2 font-medium">
              {isInvalidToken
                ? 'To get a new demo link:'
                : 'To access this demo:'}
            </h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Contact our sales team</li>
              <li>• Request a {isInvalidToken ? 'new ' : ''}demo link</li>
              <li>• Use the provided secure URL</li>
              {isInvalidToken && (
                <li>• Check that you&apos;re using the complete URL</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Show signing in screen
  if (isSigningIn) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-current"></div>
          <p className="text-muted-foreground">Signing in to demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Live Demo Available
            </span>
          </div>
          {demoName && (
            <div className="border-primary/20 bg-primary/5 mb-3 inline-block rounded-lg border px-3 py-1">
              <span className="text-muted-foreground text-xs font-medium">
                Demo:{' '}
              </span>
              <span className="text-sm font-semibold">{demoName}</span>
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight">
            AI Voice Assistant
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            Experience seamless conversations with our intelligent voice agents.
            Choose between phone demonstrations or interactive browser-based
            conversations.
          </p>
        </div>

        <Tabs defaultValue="test-call" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="test-call" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Demo
            </TabsTrigger>
            <TabsTrigger
              value="direct-call"
              className="flex items-center gap-2"
            >
              <PhoneCall className="h-4 w-4" />
              Voice Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test-call" className="mt-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5">
                  <Phone className="h-5 w-5 text-blue-500" />
                  Phone Demonstration
                </CardTitle>
                <p className="text-muted-foreground">
                  Receive a live demonstration call on your phone to experience
                  our AI voice technology
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Choose AI Assistant
                  </label>
                  <Select
                    value={selectedAgentId}
                    onValueChange={setSelectedAgentId}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an AI assistant for your demonstration" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAgent && (
                    <p className="text-muted-foreground text-sm">
                      <strong>{selectedAgent.name}:</strong>{' '}
                      {selectedAgent.organization_info ||
                        'This AI assistant will demonstrate our voice technology capabilities.'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    placeholder="(e.g. +1 555-123-4567)"
                    value={testToNumber}
                    onChange={(e) => setTestToNumber(e.target.value)}
                    type="tel"
                  />
                  <p className="text-muted-foreground text-xs">
                    We&apos;ll call this number to demonstrate our AI voice
                    assistant
                  </p>
                </div>

                <Button
                  onClick={handlePlaceTestCall}
                  disabled={
                    isPlacingTestCall ||
                    isLoading ||
                    !testToNumber ||
                    !availableCallerIds.length ||
                    !selectedAgent
                  }
                  className="w-full"
                  size="lg"
                >
                  {isPlacingTestCall ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                      Initiating Call...
                    </>
                  ) : (
                    <>
                      <Phone className="mr-2 h-4 w-4" />
                      Start Demo Call
                    </>
                  )}
                </Button>

                {!availableCallerIds.length && (
                  <div className="bg-muted/50 rounded-lg border p-4">
                    <p className="font-medium">
                      Service Configuration Required
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Phone demonstration service is currently being configured.
                      Please try again shortly.
                    </p>
                  </div>
                )}

                {isLoading && (
                  <div className="bg-muted/50 rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                      <p className="text-muted-foreground text-sm">
                        Loading AI assistants...
                      </p>
                    </div>
                  </div>
                )}

                {!isLoading && !agents.length && (
                  <div className="bg-muted/50 rounded-lg border p-4">
                    <p className="font-medium">No AI Assistants Available</p>
                    <p className="text-muted-foreground text-sm">
                      AI assistants are currently being set up. Please check
                      back soon.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="direct-call" className="mt-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5">
                  <PhoneCall className="h-5 w-5 text-purple-500" />
                  Interactive Voice Chat
                </CardTitle>
                <p className="text-muted-foreground">
                  Have a real-time conversation with our AI assistant directly
                  in your browser
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Choose AI Assistant
                  </label>
                  <Select
                    value={selectedAgentId}
                    onValueChange={setSelectedAgentId}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an AI assistant for voice conversation" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAgent && (
                    <p className="text-muted-foreground text-sm">
                      <strong>{selectedAgent.name}:</strong>{' '}
                      {selectedAgent.organization_info ||
                        'Ready for an interactive voice conversation with advanced AI capabilities.'}
                    </p>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg border p-4">
                  <p className="mb-3 flex items-center gap-2 font-medium">
                    <span className="text-lg">🎤</span>
                    Voice Chat Features
                  </p>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-green-600 dark:text-green-400">
                        ✓
                      </span>
                      <span>Instant voice interaction - no setup required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-green-600 dark:text-green-400">
                        ✓
                      </span>
                      <span>Natural conversation flow with advanced AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-green-600 dark:text-green-400">
                        ✓
                      </span>
                      <span>Real-time speech recognition and response</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-green-600 dark:text-green-400">
                        ✓
                      </span>
                      <span>Secure browser-based communication</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleStartDirectCall}
                  disabled={!selectedAgent || isLoading}
                  className="w-full"
                  size="lg"
                >
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Start Voice Conversation
                </Button>

                {isLoading && (
                  <div className="bg-muted/50 rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                      <p className="text-muted-foreground text-sm">
                        Loading AI assistants...
                      </p>
                    </div>
                  </div>
                )}

                {!isLoading && !agents.length && (
                  <div className="bg-muted/50 rounded-lg border p-4">
                    <p className="font-medium">No AI Assistants Available</p>
                    <p className="text-muted-foreground text-sm">
                      AI assistants are currently being set up. Please check
                      back soon.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Voice Chat Modal */}
      {showVoiceChat && selectedAgent && (
        <RealtimeVoiceChat
          agentId={selectedAgent.id}
          agentName={selectedAgent.name}
          elevenlabsAgentId={selectedAgent.elevenlabs_agent_id || ''}
          onClose={() => setShowVoiceChat(false)}
        />
      )}
    </div>
  );
}
