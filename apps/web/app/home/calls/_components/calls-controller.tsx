'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [callerId, setCallerId] = useState<string>('');

  // Helper to add debug logs
  const addLog = (message: string) => {
    console.log(message);
    setDebugLogs((prev) =>
      [...prev, `${new Date().toLocaleTimeString()}: ${message}`].slice(-10),
    );
  };

  // Initialize on mount - using useEffect with empty dependency array
  useEffect(() => {
    // Use a ref to prevent multiple initializations
    let cancelled = false;

    const initializeDevice = async () => {
      // Check if already initialized or initializing
      if (deviceRef.current || isInitialized || isInitializing) {
        addLog('Device already initialized or initializing, skipping');
        return;
      }

      setIsInitializing(true);
      addLog('Starting initialization...');

      try {
        // Fetch token from API
        addLog('Fetching token from API...');
        const response = await fetch('/api/twilio/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const error = await response.json();
          const errorMessage = error.error || 'Failed to get token';
          addLog(`Token API error: ${errorMessage}`);
          toast.error(`Token error: ${errorMessage}`);
          throw new Error(errorMessage);
        }

        const { data } = await response.json();
        const { token, callerId: twilioCallerId } = data;
        addLog('Token received successfully');

        if (cancelled) return;

        // Save callerId for use in connect()
        setCallerId(twilioCallerId || '');

        addLog('Creating Twilio Device...');
        // Create and setup Twilio Device
        const device = new Device(token, {
          codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
          logLevel: 1, // Enable debug logging
        });

        // Register device event handlers
        device.on('ready', () => {
          addLog('✅ Device is ready!');
          if (!cancelled) {
            setIsInitialized(true);
            setIsInitializing(false);
            toast.success('Phone system ready');
          }
        });

        device.on('error', (error) => {
          addLog(`❌ Device error: ${error.message}`);
          toast.error(`Phone system error: ${error.message}`);
          setCallState((prev) => ({ ...prev, status: 'error' }));
          setIsInitializing(false);
        });

        device.on('registering', () => {
          addLog('📞 Device is registering...');
        });

        device.on('registered', () => {
          addLog('✅ Device registered successfully');
          // Sometimes 'ready' event doesn't fire, so we treat 'registered' as ready
          if (!cancelled && !isInitialized) {
            addLog('Setting device as ready (registered event)');
            setIsInitialized(true);
            setIsInitializing(false);
            toast.success('Phone system ready');
          }
        });

        device.on('unregistered', () => {
          addLog('📵 Device unregistered');
        });

        device.on('incoming', (call) => {
          addLog(`📲 Incoming call from ${call.parameters.From}`);
          toast.info(`Incoming call from ${call.parameters.From}`);
        });

        device.on('tokenWillExpire', async () => {
          addLog('🔄 Token expiring, refreshing...');
          try {
            const response = await fetch('/api/twilio/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            const { data } = await response.json();
            device.updateToken(data.token);
          } catch {
            addLog('Failed to refresh token');
          }
        });

        if (cancelled) {
          device.destroy();
          return;
        }

        // Register the device with timeout
        addLog('🔌 Registering device...');
        const registerTimeout = setTimeout(() => {
          addLog('⏱️ Registration timeout after 10 seconds');
          toast.error('Connection timeout - Check Twilio configuration');
          setCallState((prev) => ({ ...prev, status: 'error' }));
          setIsInitializing(false);
        }, 10000);

        try {
          await device.register();
          clearTimeout(registerTimeout);
          addLog('✅ Device.register() completed');
          deviceRef.current = device;
        } catch (regError) {
          clearTimeout(registerTimeout);
          addLog(`❌ Device.register() failed: ${regError}`);
          throw regError;
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to initialize Twilio Device:', error);
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

          // Only show toast if we haven't already shown one for the API error
          if (!errorMessage.includes('Unauthorized')) {
            toast.error(`Phone system error: ${errorMessage}`);
          }

          setCallState((prev) => ({ ...prev, status: 'error' }));
          setIsInitializing(false);
        }
      }
    };

    initializeDevice();

    return () => {
      cancelled = true;
      // Cleanup on unmount
      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

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
      addLog('Requesting microphone access...');

      // Request microphone permissions first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // Stop the test stream immediately - Twilio will create its own
        stream.getTracks().forEach((track) => track.stop());
        addLog('✅ Microphone access granted');
      } catch (permError) {
        addLog(`❌ Microphone permission denied: ${permError}`);
        toast.error(
          'Microphone access denied. Please allow microphone access and try again.',
        );
        setCallState((prev) => ({ ...prev, status: 'idle' }));
        return;
      }

      addLog(`Making call to ${callState.phoneNumber}...`);

      // Make the call with required parameters
      // Note: callerId parameter is sometimes required to avoid connection errors
      const call = await deviceRef.current.connect({
        params: {
          To: callState.phoneNumber,
          CallerId: callerId,
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
                ? 'Initializing phone system... (Check browser console if this takes too long)'
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

          {/* Debug Logs */}
          {debugLogs.length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/50">
              <p className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                Debug Log
              </p>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {debugLogs.map((log, index) => (
                  <p
                    key={index}
                    className="font-mono text-xs text-blue-700 dark:text-blue-300"
                  >
                    {log}
                  </p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
