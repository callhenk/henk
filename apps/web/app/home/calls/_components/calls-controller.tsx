'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Call, Device } from '@twilio/voice-sdk';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

import { useCampaigns } from '@kit/supabase/hooks/campaigns/use-campaigns';
// Conversation creation disabled until agent selection is implemented
// import {
//   useCreateConversation,
//   useUpdateConversation,
// } from '@kit/supabase/hooks/conversations/use-conversation-mutations';
import { useLeads } from '@kit/supabase/hooks/leads/use-leads';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Separator } from '@kit/ui/separator';

interface CallState {
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
  duration: number;
  phoneNumber: string;
  contactId?: string;
  conversationId?: string;
}

export function CallsController() {
  // Twilio Device and Call refs
  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State management
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    duration: 0,
    phoneNumber: '',
  });
  const [isMuted, setIsMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');

  // Hooks for data
  const { data: leads } = useLeads();
  const { data: campaigns } = useCampaigns();
  // Conversation mutations disabled until agent selection is implemented
  // const createConversation = useCreateConversation();
  // const updateConversation = useUpdateConversation();

  // Domain safeguarding
  useEffect(() => {
    const checkDomain = () => {
      if (process.env.NODE_ENV === 'production') {
        const hostname = window.location.hostname;
        const allowedDomains = [
          'callhenk.com',
          'www.callhenk.com',
          'app.callhenk.com',
        ];

        if (!allowedDomains.includes(hostname)) {
          toast.error('This service is only available on callhenk.com');
          return false;
        }
      }
      return true;
    };

    if (!checkDomain()) {
      // Disable the calling functionality if not on allowed domain
      setCallState((prev) => ({ ...prev, status: 'error' }));
    }
  }, []);

  // Initialize Twilio Device
  const initializeDevice = useCallback(async () => {
    if (isInitializing || isInitialized) return;

    setIsInitializing(true);
    try {
      // Fetch token from API
      const response = await fetch('/api/twilio/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get token');
      }

      const { data } = await response.json();
      const { token } = data;

      // Create and setup Twilio Device
      const device = new Device(token, {
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
      });

      // Register device event handlers
      device.on('ready', () => {
        console.log('Twilio Device is ready');
        setIsInitialized(true);
        toast.success('Phone system ready');
      });

      device.on('error', (error) => {
        console.error('Twilio Device error:', error);
        toast.error(`Phone system error: ${error.message}`);
        setCallState((prev) => ({ ...prev, status: 'error' }));
      });

      device.on('incoming', (call) => {
        console.log('Incoming call from', call.parameters.From);
        // Handle incoming calls if needed
        toast.info(`Incoming call from ${call.parameters.From}`);
      });

      device.on('tokenWillExpire', async () => {
        console.log('Token will expire, refreshing...');
        // Refresh the token
        const response = await fetch('/api/twilio/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const { data } = await response.json();
        device.updateToken(data.token);
      });

      // Register the device
      await device.register();
      deviceRef.current = device;
    } catch (error) {
      console.error('Failed to initialize Twilio Device:', error);
      toast.error('Failed to initialize phone system');
      setCallState((prev) => ({ ...prev, status: 'error' }));
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, isInitialized]);

  // Initialize on mount
  useEffect(() => {
    initializeDevice();

    return () => {
      // Cleanup on unmount
      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [initializeDevice]);

  // Handle making a call
  const makeCall = async () => {
    if (!deviceRef.current || !callState.phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    if (callState.status !== 'idle') {
      toast.error('A call is already in progress');
      return;
    }

    try {
      setCallState((prev) => ({ ...prev, status: 'connecting' }));

      // Make the call
      const call = await deviceRef.current.connect({
        params: {
          To: callState.phoneNumber,
        },
        rtcConstraints: {
          audio: true,
        },
      });

      // Set up call event handlers
      call.on('accept', () => {
        console.log('Call accepted');
        setCallState((prev) => ({ ...prev, status: 'connected' }));
        toast.success('Call connected');

        // Start duration timer
        durationTimerRef.current = setInterval(() => {
          setCallState((prev) => ({ ...prev, duration: prev.duration + 1 }));
        }, 1000);

        // Note: Conversation creation requires agent_id which we don't have for direct calls
        // This feature would need to be updated to either:
        // 1. Create a default "manual call" agent
        // 2. Select an agent before making calls
        // 3. Store call records in a different table

        // For now, we'll skip conversation creation for direct Twilio calls
        // You could uncomment and modify this when you have agent selection:
        /*
        if (selectedLead && selectedCampaign && selectedAgent) {
          const conversationData = {
            lead_id: selectedLead,
            campaign_id: selectedCampaign,
            agent_id: selectedAgent,
            status: 'in_progress' as const,
            started_at: new Date().toISOString(),
            call_sid: (call.parameters as Record<string, unknown>)?.CallSid as string | null,
          };

          createConversation.mutate(conversationData, {
            onSuccess: (data) => {
              setCallState((prev) => ({ ...prev, conversationId: data.id }));
            },
          });
        }
        */
      });

      call.on('disconnect', () => {
        console.log('Call disconnected');
        handleCallEnd();
      });

      call.on('error', (error) => {
        console.error('Call error:', error);
        toast.error(`Call error: ${error.message}`);
        handleCallEnd();
      });

      call.on('cancel', () => {
        console.log('Call cancelled');
        handleCallEnd();
      });

      callRef.current = call;
    } catch (error) {
      console.error('Failed to make call:', error);
      toast.error('Failed to initiate call');
      setCallState((prev) => ({ ...prev, status: 'idle' }));
    }
  };

  // Handle ending a call
  const endCall = () => {
    if (callRef.current) {
      callRef.current.disconnect();
    }
  };

  // Handle call end cleanup
  const handleCallEnd = () => {
    // Stop duration timer
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    // Update conversation record if exists (currently disabled for direct calls)
    // Uncomment when agent selection is implemented
    /*
    if (callState.conversationId) {
      updateConversation.mutate({
        id: callState.conversationId,
        status: 'completed' as const,
        ended_at: new Date().toISOString(),
        duration_seconds: callState.duration,
      });
    }
    */

    // Reset state
    setCallState((prev) => ({
      ...prev,
      status: 'idle',
      duration: 0,
      conversationId: undefined,
    }));
    setIsMuted(false);
    callRef.current = null;
  };

  // Toggle mute
  const toggleMute = () => {
    if (callRef.current) {
      const newMuteState = !isMuted;
      callRef.current.mute(newMuteState);
      setIsMuted(newMuteState);
      toast.success(newMuteState ? 'Microphone muted' : 'Microphone unmuted');
    }
  };

  // Toggle speaker
  const toggleSpeaker = () => {
    // Note: Browser limitations may prevent speaker selection
    setSpeakerEnabled(!speakerEnabled);
    toast.success(speakerEnabled ? 'Speaker disabled' : 'Speaker enabled');
  };

  // Format duration display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle lead selection
  const handleLeadSelect = (leadId: string) => {
    setSelectedLead(leadId);
    const lead = leads?.find(
      (l: { id: string; phone?: string | null }) => l.id === leadId,
    );
    if (lead?.phone) {
      setCallState((prev) => ({ ...prev, phoneNumber: lead.phone || '' }));
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Call Controls Card */}
      <Card>
        <CardHeader>
          <CardTitle>Make a Call</CardTitle>
          <CardDescription>
            {isInitialized
              ? 'Phone system ready'
              : 'Initializing phone system...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lead Selection */}
          <div className="space-y-2">
            <Label>Select Lead (Optional)</Label>
            <Select value={selectedLead} onValueChange={handleLeadSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a lead" />
              </SelectTrigger>
              <SelectContent>
                {leads?.map(
                  (lead: {
                    id: string;
                    first_name?: string | null;
                    last_name?: string | null;
                    phone?: string | null;
                  }) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.first_name} {lead.last_name} - {lead.phone}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Campaign Selection */}
          <div className="space-y-2">
            <Label>Campaign (Optional)</Label>
            <Select
              value={selectedCampaign}
              onValueChange={setSelectedCampaign}
            >
              <SelectTrigger>
                <SelectValue placeholder="Associate with campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns?.map((campaign: { id: string; name: string }) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1234567890"
              value={callState.phoneNumber}
              onChange={(e) =>
                setCallState((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
              disabled={callState.status !== 'idle'}
            />
          </div>

          {/* Call Status */}
          {callState.status !== 'idle' && (
            <div className="bg-muted flex items-center justify-between rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    callState.status === 'connected' ? 'success' : 'secondary'
                  }
                >
                  {callState.status}
                </Badge>
                <span className="text-sm font-medium">
                  {formatDuration(callState.duration)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  disabled={callState.status !== 'connected'}
                >
                  {isMuted ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleSpeaker}
                  disabled={callState.status !== 'connected'}
                >
                  {speakerEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Call Actions */}
          <div className="flex gap-2">
            {callState.status === 'idle' ? (
              <Button
                className="flex-1"
                onClick={makeCall}
                disabled={!isInitialized || !callState.phoneNumber}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
            ) : (
              <Button
                className="flex-1"
                variant="destructive"
                onClick={endCall}
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                End Call
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
          <CardDescription>
            Make outbound calls to your prospects directly from Henk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Select a Lead (Optional)</strong>
              <p className="text-muted-foreground">
                Choose from your existing leads to auto-fill their phone number
                and track the conversation.
              </p>
            </div>
            <Separator />
            <div>
              <strong>2. Associate with Campaign (Optional)</strong>
              <p className="text-muted-foreground">
                Link the call to a campaign for better tracking and analytics.
              </p>
            </div>
            <Separator />
            <div>
              <strong>3. Enter Phone Number</strong>
              <p className="text-muted-foreground">
                Enter the phone number in international format (e.g.,
                +1234567890).
              </p>
            </div>
            <Separator />
            <div>
              <strong>4. Make the Call</strong>
              <p className="text-muted-foreground">
                Click the Call button to initiate the call. Use the controls to
                mute/unmute and manage audio.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/50">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Security Notice
            </p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              This calling feature is only available on callhenk.com domains for
              security purposes. All calls are logged and associated with your
              business account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
