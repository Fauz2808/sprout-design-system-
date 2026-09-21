import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { AudioModule, RecordingPresets, setAudioModeAsync } from 'expo-audio';
import { File } from 'expo-file-system';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { smoothEnergy } from './energy';
import { INITIAL_CAPTURE, VoiceCaptureSession, type CaptureSnapshot } from './VoiceCaptureSession';

export type { CapturePhase, LocalRecording } from './VoiceCaptureSession';

/** Foreground microphone capture; temporary result belongs to this hook until reset/unmount. */
export function useVoiceCapture() {
  const [snapshot, setSnapshot] = useState<CaptureSnapshot>({ ...INITIAL_CAPTURE });
  const controller = useRef<VoiceCaptureSession | null>(null);
  const targetEnergy = useSharedValue(0);
  const energy = useSharedValue(0);

  const envelope = useFrameCallback((frame) => {
    'worklet';
    energy.value = smoothEnergy(energy.value, targetEnergy.value, frame.timeSincePreviousFrame ?? 16);
  }, false);

  useEffect(() => {
    let mounted = true;
    let releaseForegroundWait: (() => void) | null = null;
    const session = new VoiceCaptureSession({
      requestPermission: async () => {
        const { granted } = await AudioModule.requestRecordingPermissionsAsync();
        // Permission resolution can precede iOS's active event. Wait for the
        // consent sheet to dismiss, but never start behind another inactive UI.
        if (granted && mounted && AppState.currentState === 'inactive') {
          await new Promise<void>((resolve) => {
            const finish = () => {
              subscription.remove();
              releaseForegroundWait = null;
              resolve();
            };
            const subscription = AppState.addEventListener('change', (state) => {
              if (state !== 'inactive') finish();
            });
            releaseForegroundWait = finish;
          });
        }
        return granted;
      },
      setRecordingMode: (enabled) => setAudioModeAsync({
        allowsRecording: enabled,
        allowsBackgroundRecording: false,
        shouldPlayInBackground: false,
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
      }),
      createRecorder: () => {
        const preset = RecordingPresets.HIGH_QUALITY;
        const platformPreset = Platform.OS === 'ios' ? preset.ios : Platform.OS === 'android' ? preset.android : preset.web;
        // Expo's hook flattens platform options before this same native constructor.
        // Owning it here lets stop/file cleanup finish before native release.
        return new AudioModule.AudioRecorder({
          ...preset,
          ...platformPreset,
          numberOfChannels: 1,
          isMeteringEnabled: true,
          directory: 'cache',
        });
      },
      deleteRecording: (uri) => {
        const file = new File(uri);
        if (file.exists) file.delete();
      },
      canStart: () => AppState.currentState === 'active',
      onSnapshot: setSnapshot,
      onEnergy: (value) => { targetEnergy.value = value; },
      onCleanupError: (error) => console.warn('Sprout microphone cleanup failed:', error),
    });
    controller.current = session;
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      // iOS's permission sheet itself becomes inactive, so it must not cancel consent.
      if (state === 'background' || (state === 'inactive' && session.phase === 'listening')) {
        void session.interrupt();
      }
    });
    return () => {
      mounted = false;
      releaseForegroundWait?.();
      appStateSubscription.remove();
      controller.current = null;
      void session.dispose();
    };
  }, [targetEnergy]);

  useEffect(() => {
    const active = snapshot.phase === 'listening';
    envelope.setActive(active);
    if (!active) {
      targetEnergy.value = 0;
      energy.value = 0;
    }
    return () => envelope.setActive(false);
  }, [snapshot.phase, envelope, energy, targetEnergy]);

  const start = useCallback(() => controller.current?.start() ?? Promise.resolve(), []);
  const stop = useCallback(() => controller.current?.stop() ?? Promise.resolve(), []);
  const reset = useCallback(() => controller.current?.reset() ?? Promise.resolve(), []);
  const cancel = useCallback(() => controller.current?.cancel() ?? Promise.resolve(), []);

  return { ...snapshot, energy, start, stop, reset, cancel };
}
