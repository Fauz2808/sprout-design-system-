/*
THESIS: Voice has a visible, calm presence through the approved Sprout liquid orb.
OWN-WORLD: Cream, botanical green, Playfair Display and Inter; one generous orb.
STORY: Explore each state, then explicitly enable the microphone to try real input.
FIRST VIEWPORT: Native mode switch, short heading, central orb, status, primary action.
FORM: Approved component expanded into a native test surface; code-first by request.
FINISH: Simulator evidence, interaction verification, reusable API and honest limits.
*/
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo, ActivityIndicator, AppState, Linking, Modal, Pressable,
  ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { PlayfairDisplay_500Medium } from '@expo-google-fonts/playfair-display/500Medium';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import * as Haptics from 'expo-haptics';
import { Check, CaretDown, Microphone, Play, Stop, X } from 'phosphor-react-native';
import { runOnJS, useAnimatedReaction, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { AICompanionBlob } from './src/companion/AICompanionBlob';
import { BlobState, blobStates, isBlobState, previewEnergy, stateDetails } from './src/companion/model';
import { useVoiceCapture } from './src/audio/useVoiceCapture';
import { color, elevation, fonts, radius, space } from './src/theme/theme';

const previewSequence: { state: BlobState; ms: number }[] = [
  { state: 'idle', ms: 1300 }, { state: 'requestingPermission', ms: 1000 },
  { state: 'listeningQuiet', ms: 1700 }, { state: 'listeningActive', ms: 8000 },
  { state: 'listeningQuiet', ms: 1200 }, { state: 'processing', ms: 2400 },
  { state: 'success', ms: 2300 },
];

function CompanionScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const capture = useVoiceCapture();
  const liveEnergy = capture.energy;
  const [mode, setMode] = useState<'preview' | 'microphone'>('preview');
  const [previewState, setPreviewState] = useState<BlobState>('idle');
  const [sheet, setSheet] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [voiceActive, setVoiceActive] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const previewLevel = useSharedValue(0);
  const sensitivity = useSharedValue(0.85);
  const [intensity, setIntensity] = useState(0.85);
  const previewClock = useSharedValue(0);
  const previousCapturePhase = useRef(capture.phase);

  useEffect(() => {
    if (capture.phase !== previousCapturePhase.current && mode === 'microphone') {
      if (capture.phase === 'listening') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      if (capture.phase === 'success') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    previousCapturePhase.current = capture.phase;
  }, [capture.phase, mode]);

  const stopSequence = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlaying(false);
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => alive && setSystemReduceMotion(value));
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduceMotion);
    const lifecycle = AppState.addEventListener('change', value => {
      setForeground(value === 'active');
      if (value !== 'active') stopSequence();
    });
    return () => { alive = false; motion.remove(); lifecycle.remove(); };
  }, [stopSequence]);

  const frame = useFrameCallback(({ timeSincePreviousFrame }) => {
    'worklet';
    previewClock.value += Math.min(timeSincePreviousFrame ?? 16, 64) / 1000;
    previewLevel.value = previewState === 'listeningActive'
      ? previewEnergy(previewClock.value) * sensitivity.value
      : 0;
  }, false);

  useEffect(() => {
    frame.setActive(mode === 'preview' && previewState === 'listeningActive' && foreground && !sheet && !reduceMotion && !systemReduceMotion);
    if (previewState !== 'listeningActive') previewLevel.value = 0;
  }, [mode, previewState, foreground, sheet, reduceMotion, systemReduceMotion, frame, previewLevel]);

  useAnimatedReaction(
    () => liveEnergy.value > 0.075,
    (active, previous) => { if (active !== previous) runOnJS(setVoiceActive)(active); },
  );

  // Preview links exercise visual states only. They can never start the microphone.
  useEffect(() => {
    const route = (url: string | null) => {
      if (!url || !__DEV__) return;
      const query = url.includes('?') ? new URLSearchParams(url.split('?')[1]) : null;
      const requested = query?.get('state') ?? null;
      if (!isBlobState(requested)) return;
      stopSequence();
      void capture.cancel().then(() => {
        setMode('preview'); setPreviewState(requested); setSheet(false);
        setReduceMotion(query?.get('reduceMotion') === 'true');
      });
    };
    Linking.getInitialURL().then(route);
    const listener = Linking.addEventListener('url', ({ url }) => route(url));
    return () => listener.remove();
  }, [capture.cancel, stopSequence]);

  const state: BlobState = mode === 'preview' ? previewState
    : capture.phase === 'listening' ? voiceActive ? 'listeningActive' : 'listeningQuiet'
      : capture.phase;
  const detail = stateDetails[state];
  const effectiveReduceMotion = reduceMotion || systemReduceMotion;
  const isRecording = mode === 'microphone' && capture.phase === 'listening';
  const isBusy = mode === 'microphone' && ['requestingPermission', 'processing'].includes(capture.phase);
  const isUnavailable = state === 'disabled';
  const isError = ['permissionDenied', 'interrupted', 'error'].includes(state);

  const chooseState = (next: BlobState) => {
    stopSequence(); setPreviewState(next); setSheet(false);
  };

  const playSequence = () => {
    if (playing) { stopSequence(); setPreviewState('idle'); return; }
    stopSequence(); setPlaying(true); setPreviewState('idle');
    let elapsed = 0;
    previewSequence.forEach(step => {
      timers.current.push(setTimeout(() => setPreviewState(step.state), elapsed));
      elapsed += step.ms;
    });
    timers.current.push(setTimeout(() => { setPlaying(false); timers.current = []; }, elapsed));
  };

  const changeMode = async (index: number) => {
    stopSequence(); setSettingsError(null);
    await capture.cancel();
    setMode(index === 0 ? 'preview' : 'microphone');
    setPreviewState('idle');
  };

  const primaryAction = async () => {
    if (mode === 'preview') { playSequence(); return; }
    if (isBusy || isUnavailable) return;
    if (capture.phase === 'permissionDenied') {
      try { await Linking.openSettings(); }
      catch { setSettingsError('Open Settings on your iPhone to allow microphone access.'); }
      return;
    }
    if (capture.phase === 'listening') {
      await capture.stop();
    } else {
      await capture.start();
    }
  };

  const actionLabel = mode === 'preview' ? playing ? 'Stop preview' : 'Play the full sequence'
    : isRecording ? 'Finish recording'
      : state === 'permissionDenied' ? 'Open Settings'
        : state === 'success' ? 'Record again'
          : isBusy ? 'One moment…' : isUnavailable ? 'Unavailable' : 'Tap to speak';

  const duration = `${Math.floor(capture.durationMs / 60000).toString().padStart(2, '0')}:${Math.floor(capture.durationMs / 1000 % 60).toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.wordmark}>sprout</Text>
        <Text style={styles.headerCaption}>Voice companion</Text>
      </View>
      <View style={styles.modeSwitch}>
        <SegmentedControl values={['State preview', 'Microphone']} selectedIndex={mode === 'preview' ? 0 : 1}
          onChange={event => void changeMode(event.nativeEvent.selectedSegmentIndex)}
          style={styles.segment} appearance="light"
          fontStyle={{ fontFamily: fonts.medium, color: color.text.default, fontSize: 14 }}
          activeFontStyle={{ fontFamily: fonts.semibold, color: color.text.brand.bold }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <Text style={styles.title} accessibilityRole="header">{detail.title}</Text>
        </View>
        <View style={styles.orbStage}>
          <AICompanionBlob state={state} energy={mode === 'preview' ? previewLevel : capture.energy}
            size={Math.min(width - 32, 350)} active={foreground && !sheet}
            reduceMotion={effectiveReduceMotion}
            onPress={isUnavailable || isBusy ? undefined : () => void primaryAction()}
            accessibilityLabel={`Sprout companion. ${detail.status}.`}
            accessibilityHint={mode === 'preview' ? 'Plays a simulated voice sequence.' : isRecording ? 'Double tap to finish recording.' : state === 'permissionDenied' ? 'Double tap to open microphone settings.' : 'Double tap to start voice input.'} />
        </View>
        <View style={styles.statusArea} accessibilityLiveRegion="polite">
          <View style={styles.statusLine}>
            {state === 'success' ? <Check size={16} color={color.text.brand.default} weight="bold" />
              : <View style={[styles.statusDot, { backgroundColor: isError ? color.text.danger.bold : color.text.brand.default }]} />}
            <Text style={[styles.status, isError && styles.errorText]}>{detail.status}</Text>
          </View>
          <Text style={styles.helper}>{isRecording ? `${duration} · Tap when you’re done`
            : mode === 'microphone' && capture.errorMessage ? capture.errorMessage
              : mode === 'microphone' && state === 'success' ? `${duration} recorded · Stored only for this session`
                : mode === 'preview' ? 'Preview uses simulated audio.' : 'Your microphone starts only when you tap.'}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => void primaryAction()} disabled={isBusy || isUnavailable}
            accessibilityRole="button" accessibilityLabel={actionLabel} testID="primary-action"
            style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed, (isBusy || isUnavailable) && styles.primaryDisabled]}>
            {isBusy ? <ActivityIndicator color={color.text.stable.white} />
              : isRecording || playing ? <Stop size={19} color={color.text.stable.white} weight="fill" />
                : mode === 'preview' ? <Play size={19} color={color.text.stable.white} weight="fill" />
                  : <Microphone size={20} color={color.text.stable.white} />}
            <Text style={styles.primaryLabel}>{actionLabel}</Text>
          </Pressable>

          {mode === 'preview' ? (
            <Pressable style={({ pressed }) => [styles.stateSelector, pressed && styles.softPressed]}
              onPress={() => setSheet(true)} accessibilityRole="button" accessibilityLabel={`Choose a state. Current: ${detail.label}`} testID="state-picker">
              <Text style={styles.selectorLabel}>Explore states</Text>
              <View style={styles.selectorValue}><Text style={styles.selectorState}>{detail.label}</Text><CaretDown size={15} color={color.text.brand.default} /></View>
            </Pressable>
          ) : state === 'permissionDenied' ? (
            <Pressable style={styles.secondary} onPress={() => void capture.start()} accessibilityRole="button">
              <Text style={styles.secondaryLabel}>Check permission again</Text>
            </Pressable>
          ) : state === 'success' ? (
            <Pressable style={styles.secondary} onPress={() => void capture.reset()} accessibilityRole="button">
              <Text style={styles.secondaryLabel}>Discard recording</Text>
            </Pressable>
          ) : <View style={styles.privacyRow}><Text style={styles.privacy}>Audio stays on this device. No AI reply or upload.</Text></View>}
          {settingsError && <Text style={styles.errorText}>{settingsError}</Text>}
        </View>
      </ScrollView>

      <Modal visible={sheet} animationType={effectiveReduceMotion ? 'none' : 'slide'} presentationStyle="pageSheet"
        onRequestClose={() => setSheet(false)}>
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle} accessibilityRole="header">Explore the companion</Text>
            <Pressable style={styles.close} onPress={() => setSheet(false)} accessibilityRole="button" accessibilityLabel="Close state preview"><X size={22} color={color.text.brand.bold} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.sheetContent}>
            <Text style={styles.sheetIntro}>Choose a visual state. These controls do not use the microphone.</Text>
            {blobStates.map(item => (
              <Pressable key={item} onPress={() => chooseState(item)} accessibilityRole="radio"
                accessibilityState={{ checked: previewState === item }} testID={`state-${item}`}
                style={({ pressed }) => [styles.stateRow, pressed && styles.softPressed]}>
                <View style={styles.rowCopy}><Text style={styles.rowTitle}>{stateDetails[item].label}</Text><Text style={styles.rowDescription}>{stateDetails[item].description}</Text></View>
                {previewState === item && <Check size={21} weight="bold" color={color.text.brand.default} />}
              </Pressable>
            ))}
            <View style={styles.motionRow}>
              <View style={styles.rowCopy}><Text style={styles.rowTitle}>Reduced motion</Text><Text style={styles.rowDescription}>{systemReduceMotion ? 'Enabled by your iPhone settings.' : 'Preview the quieter, static alternative.'}</Text></View>
              <Switch value={effectiveReduceMotion} disabled={systemReduceMotion} onValueChange={setReduceMotion}
                trackColor={{ true: color.background.brand.default }} accessibilityLabel="Reduced motion" />
            </View>
            <View style={styles.intensityHeader}><Text style={styles.rowTitle}>Preview voice energy</Text><Text style={styles.rowDescription}>{Math.round(intensity * 100)}%</Text></View>
            <Slider minimumValue={0} maximumValue={1} value={intensity} minimumTrackTintColor={color.background.brand.default}
              maximumTrackTintColor={color.border.brand.subtle} onValueChange={value => { setIntensity(value); sensitivity.value = value; }}
              accessibilityLabel="Preview voice energy" accessibilityValue={{ min: 0, max: 100, now: Math.round(intensity * 100) }} style={styles.slider} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ PlayfairDisplay_500Medium, Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  if (!fontsLoaded && !fontError) return <View style={styles.loading}><ActivityIndicator color={color.text.brand.default} accessibilityLabel="Loading Sprout companion" /></View>;
  return <SafeAreaProvider><CompanionScreen /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.background.default },
  loading: { flex: 1, backgroundColor: color.background.default, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[24], paddingTop: space[8], paddingBottom: space[24] },
  wordmark: { fontFamily: fonts.display, fontSize: 30, color: color.text.brand.default, letterSpacing: -1 },
  headerCaption: { fontFamily: fonts.medium, fontSize: 13, color: color.text.subtle },
  modeSwitch: { paddingHorizontal: space[24] },
  segment: { height: 44 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center' },
  heading: { paddingTop: space[32], paddingHorizontal: space[24] },
  title: { fontFamily: fonts.display, fontSize: 36, lineHeight: 43, letterSpacing: -0.8, color: color.text.brand.bold, textAlign: 'center' },
  orbStage: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 320 },
  statusArea: { paddingHorizontal: space[24], alignItems: 'center', gap: space[8], paddingBottom: space[24] },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: space[8] },
  statusDot: { width: 6, height: 6, borderRadius: radius.full },
  status: { fontFamily: fonts.medium, fontSize: 15, color: color.text.brand.bold, textAlign: 'center' },
  helper: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: color.text.subtle, textAlign: 'center', fontVariant: ['tabular-nums'] },
  actions: { width: '100%', paddingHorizontal: space[24] },
  primary: { minHeight: 56, backgroundColor: color.background.brand.default, borderRadius: radius.full, paddingHorizontal: space[24], paddingVertical: space[16], gap: space[8], flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  primaryPressed: { backgroundColor: color.background.brand.pressed, transform: [{ scale: 0.985 }] },
  primaryDisabled: { backgroundColor: color.background.brand.hover, opacity: 0.65 },
  primaryLabel: { fontFamily: fonts.display, fontSize: 18, color: color.text.stable.white, flexShrink: 1, textAlign: 'center' },
  stateSelector: { minHeight: 56, paddingHorizontal: space[8], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[12], borderRadius: radius.md },
  selectorLabel: { fontFamily: fonts.medium, fontSize: 13, color: color.text.subtle },
  selectorValue: { flexDirection: 'row', alignItems: 'center', gap: space[8], flexShrink: 1 },
  selectorState: { fontFamily: fonts.medium, fontSize: 13, color: color.text.brand.default, flexShrink: 1 },
  softPressed: { backgroundColor: elevation.surface.raised },
  secondary: { minHeight: 56, justifyContent: 'center', alignItems: 'center' },
  secondaryLabel: { fontFamily: fonts.medium, fontSize: 14, color: color.text.brand.default },
  privacyRow: { minHeight: 56, justifyContent: 'center' },
  privacy: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: color.text.subtle, textAlign: 'center' },
  errorText: { color: color.text.danger.bold, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  sheet: { flex: 1, backgroundColor: color.background.default },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[12], padding: space[24], paddingBottom: space[8] },
  sheetTitle: { fontFamily: fonts.display, fontSize: 24, color: color.text.brand.bold, flex: 1 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sheetContent: { paddingHorizontal: space[24], paddingBottom: space[24] },
  sheetIntro: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: color.text.subtle, marginBottom: space[16] },
  stateRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: space[16], paddingVertical: space[12], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border.brand.subtle },
  rowCopy: { flex: 1, gap: space[4] },
  rowTitle: { fontFamily: fonts.medium, fontSize: 15, color: color.text.brand.bold },
  rowDescription: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: color.text.subtle },
  motionRow: { flexDirection: 'row', alignItems: 'center', gap: space[16], paddingVertical: space[24] },
  intensityHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: space[16] },
  slider: { width: '100%', height: 44 },
});
