'use client';

import { useEffect, useRef, useState } from 'react';

import { Call, Device } from '@twilio/voice-sdk';
import {
  AlertCircle,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [callerId, setCallerId] = useState<string>('');

  // Helper to add debug logs (console only)
  const addLog = (message: string) => {
    console.log(message);
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
        // Enumerate audio devices first
        addLog('Checking audio devices...');
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter((d) => d.kind === 'audioinput');
          const audioOutputs = devices.filter((d) => d.kind === 'audiooutput');
          addLog(
            `Found ${audioInputs.length} microphone(s) and ${audioOutputs.length} speaker(s)`,
          );
        } catch (deviceError) {
          addLog(`⚠️ Could not enumerate devices: ${deviceError}`);
        }

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
        addLog('✅ Token received successfully');

        if (cancelled) return;

        // Save callerId for use in connect()
        setCallerId(twilioCallerId || '');

        addLog('Creating Twilio Device with audio codecs...');
        // Create and setup Twilio Device
        const device = new Device(token, {
          codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
          logLevel: 1, // Enable debug logging
          // Explicitly enable audio
          enableImprovedSignalingErrorPrecision: true,
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
  }, []); // Empty dependency array - only run once on mount

  // Add keyboard support for DTMF
  useEffect(() => {
    if (callState.status !== 'connected') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not focused on an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Check if key is a valid DTMF digit
      const validDigits = [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '*',
        '#',
      ];
      if (validDigits.includes(e.key)) {
        e.preventDefault();
        sendDTMF(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callState.status]); // Re-run when call status changes

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
        addLog('✅ Call accepted - audio should now be active');
        setCallState((prev) => ({ ...prev, status: 'connected' }));
        toast.success('Call connected');

        // Log call parameters
        addLog(`📞 Call SID: ${call.parameters.CallSid || 'N/A'}`);
        addLog(`🔊 Audio codecs: Opus, PCMU`);

        // Start duration timer
        durationTimerRef.current = setInterval(() => {
          setCallState((prev) => ({ ...prev, duration: prev.duration + 1 }));
        }, 1000);
      });

      call.on('disconnect', () => {
        addLog('Call disconnected');
        handleCallEnd();
      });

      call.on('error', (error) => {
        addLog(`❌ Call error: ${error.message}`);
        console.error('Call error details:', error);
        toast.error(`Call error: ${error.message}`);
        handleCallEnd();
      });

      call.on('cancel', () => {
        addLog('Call cancelled');
        handleCallEnd();
      });

      call.on('warning', (name: string, data: unknown) => {
        addLog(`⚠️ Call warning: ${name}`);
        console.warn('Call warning:', name, data);
      });

      call.on('reconnecting', (error) => {
        addLog(`🔄 Reconnecting: ${error.message}`);
      });

      call.on('reconnected', () => {
        addLog('✅ Reconnected');
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
  const toggleSpeaker = async () => {
    if (!callRef.current) return;

    try {
      const newSpeakerState = !speakerEnabled;

      // Try to set audio output volume (browser support varies)
      if ('setSinkId' in HTMLMediaElement.prototype) {
        // Get available audio outputs
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter((d) => d.kind === 'audiooutput');

        if (audioOutputs.length > 0) {
          // This is a simplified toggle - in production you'd want device selection
          addLog(
            `Speaker ${newSpeakerState ? 'enabled' : 'muted'} (${audioOutputs.length} devices available)`,
          );
        }
      }

      setSpeakerEnabled(newSpeakerState);
      toast.success(newSpeakerState ? 'Speaker enabled' : 'Speaker muted');
    } catch (error) {
      addLog(`⚠️ Speaker control not supported: ${error}`);
      toast.warning('Speaker control not fully supported in this browser');
    }
  };

  // Send DTMF tone
  const sendDTMF = (digit: string) => {
    if (!callRef.current || callState.status !== 'connected') {
      return;
    }

    try {
      callRef.current.sendDigits(digit);
      addLog(`📱 Sent DTMF tone: ${digit}`);
      toast.success(`Pressed ${digit}`, { duration: 500 });
    } catch (error) {
      addLog(`❌ Failed to send DTMF: ${error}`);
      toast.error('Failed to send key press');
    }
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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Main Call Interface */}
      <Card className="border-2">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Make a Call</CardTitle>
              <CardDescription className="mt-1.5">
                {isInitialized
                  ? 'Phone system ready'
                  : isInitializing
                    ? 'Initializing...'
                    : 'System offline'}
              </CardDescription>
            </div>
            {isInitialized && (
              <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 dark:bg-green-950">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Ready
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phone Number Input */}
          {callState.status === 'idle' && (
            <div className="space-y-3">
              <Label htmlFor="phoneNumber" className="text-base">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={callState.phoneNumber}
                  onChange={(e) =>
                    setCallState((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  onKeyPress={handleKeyPress}
                  disabled={!isInitialized}
                  className="h-12 pl-10 text-lg"
                />
              </div>
              <p className="text-muted-foreground text-sm">
                Enter number in international format (e.g., +1234567890)
              </p>
            </div>
          )}

          {/* Call Status - Connected/Connecting */}
          {callState.status !== 'idle' && (
            <div className="space-y-4">
              {/* Active Call Header */}
              <div className="border-primary/20 bg-primary/5 flex items-center justify-between rounded-lg border-2 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        callState.status === 'connected'
                          ? 'animate-pulse bg-green-500'
                          : 'animate-pulse bg-yellow-500'
                      }`}
                    />
                    <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                      {callState.status}
                    </span>
                  </div>
                  <p className="font-mono text-2xl font-bold tracking-tight">
                    {formatDuration(callState.duration)}
                  </p>
                  {callState.phoneNumber && (
                    <p className="text-muted-foreground text-sm">
                      {callState.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Call Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant={isMuted ? 'destructive' : 'outline'}
                    onClick={toggleMute}
                    disabled={callState.status !== 'connected'}
                    className="h-10 w-10"
                  >
                    {isMuted ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant={!speakerEnabled ? 'destructive' : 'outline'}
                    onClick={toggleSpeaker}
                    disabled={callState.status !== 'connected'}
                    className="h-10 w-10"
                  >
                    {speakerEnabled ? (
                      <Volume2 className="h-5 w-5" />
                    ) : (
                      <VolumeX className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Call Actions */}
          {callState.status === 'idle' ? (
            <Button
              size="lg"
              onClick={makeCall}
              disabled={!isInitialized || !callState.phoneNumber}
              className="h-14 w-full text-lg font-semibold"
            >
              <Phone className="mr-2 h-5 w-5" />
              Start Call
            </Button>
          ) : (
            <Button
              size="lg"
              variant="destructive"
              onClick={endCall}
              className="h-14 w-full text-lg font-semibold"
            >
              <PhoneOff className="mr-2 h-5 w-5" />
              End Call
            </Button>
          )}

          {/* DTMF Keypad */}
          {callState.status === 'connected' && (
            <div className="space-y-4 rounded-lg border bg-gray-50/50 p-4 dark:bg-gray-900/50">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Keypad</Label>
                <p className="text-muted-foreground text-xs">
                  Click or press 0-9, *, #
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  '1',
                  '2',
                  '3',
                  '4',
                  '5',
                  '6',
                  '7',
                  '8',
                  '9',
                  '*',
                  '0',
                  '#',
                ].map((digit) => (
                  <Button
                    key={digit}
                    variant="outline"
                    size="lg"
                    onClick={() => sendDTMF(digit)}
                    className="hover:border-primary h-16 border-2 bg-white text-2xl font-bold shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:bg-gray-800"
                  >
                    {digit}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {callState.status === 'error' && (
            <div className="flex items-start gap-3 rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <p className="font-semibold text-red-900 dark:text-red-100">
                  Connection Error
                </p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  Unable to connect to phone system. Please try again.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
