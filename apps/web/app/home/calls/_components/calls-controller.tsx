'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Call, Device } from '@twilio/voice-sdk';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

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

interface CallState {
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
  duration: number;
  phoneNumber: string;
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
      toast.error(
        'Failed to initialize phone system - please check configuration',
      );
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

    // Reset state
    setCallState((prev) => ({
      ...prev,
      status: 'idle',
      duration: 0,
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

  // Handle pressing Enter key to make call
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Enter' &&
      callState.status === 'idle' &&
      callState.phoneNumber &&
      isInitialized
    ) {
      makeCall();
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Simple Call Card */}
      <Card>
        <CardHeader>
          <CardTitle>Direct Call</CardTitle>
          <CardDescription>
            {isInitialized
              ? 'Phone system ready - Enter a number and press Call'
              : isInitializing
                ? 'Initializing phone system...'
                : 'Phone system offline - Check Twilio configuration'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              onKeyPress={handleKeyPress}
              disabled={callState.status !== 'idle'}
              className="text-lg"
            />
            <p className="text-muted-foreground text-sm">
              Enter the phone number in international format (e.g., +1234567890)
            </p>
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
                <span className="text-lg font-medium">
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
                size="lg"
                onClick={makeCall}
                disabled={!isInitialized || !callState.phoneNumber}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
            ) : (
              <Button
                className="flex-1"
                size="lg"
                variant="destructive"
                onClick={endCall}
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                End Call
              </Button>
            )}
          </div>

          {/* Error State */}
          {callState.status === 'error' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/50">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Connection Error
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                Unable to connect to phone system. Please check Twilio
                configuration and try again.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
