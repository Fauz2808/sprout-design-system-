import React, { Component, useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  AppState,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  Canvas,
  Fill,
  ImageShader,
  Shader,
  useImage,
} from '@shopify/react-native-skia';
import {
  Easing,
  cancelAnimation,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { getBlob3dShader } from './blob3dShader';
import { stepVoicePulse } from './voicePulse';
import { createVoiceRipples, stepVoiceRipples, VOICE_RIPPLE_LIFESPAN_MS } from './voiceRipples';
import type { BlobState } from './model';

const MATERIAL = require('../../assets/sprout-ai-blob.png');

export interface AICompanionBlobProps {
  state: BlobState;
  /** Smoothed microphone energy, normalized to 0…1. */
  energy: SharedValue<number>;
  /** Complete canvas bounds, including space for the voice peak and halo. */
  size?: number;
  onPress?: () => void;
  reduceMotion?: boolean;
  /** Set false when the containing screen is no longer visible. */
  active?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

type Appearance = {
  listening: number;
  processing: number;
  saturation: number;
  opacity: number;
  speed: number;
};

const APPEARANCE: Record<BlobState, Appearance> = {
  idle: { listening: 0, processing: 0, saturation: 1, opacity: 1, speed: 0.72 },
  requestingPermission: { listening: 0, processing: 0.35, saturation: 0.9, opacity: 0.86, speed: 0.6 },
  listeningQuiet: { listening: 1, processing: 0, saturation: 1, opacity: 1, speed: 0.86 },
  listeningActive: { listening: 1, processing: 0, saturation: 1, opacity: 1, speed: 1 },
  processing: { listening: 0, processing: 1, saturation: 0.96, opacity: 1, speed: 1.38 },
  success: { listening: 0, processing: 0, saturation: 1, opacity: 1, speed: 0.72 },
  permissionDenied: { listening: 0, processing: 0, saturation: 0.58, opacity: 0.68, speed: 0 },
  interrupted: { listening: 0, processing: 0, saturation: 0.68, opacity: 0.76, speed: 0 },
  error: { listening: 0, processing: 0, saturation: 0.55, opacity: 0.65, speed: 0 },
  disabled: { listening: 0, processing: 0, saturation: 0.35, opacity: 0.38, speed: 0 },
};

function StillBlob({ size, opacity }: { size: number; opacity: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={[styles.still, { width: size, height: size }]} pointerEvents="none">
      {failed ? (
        <View style={[styles.placeholder, { width: size * 0.76, height: size * 0.76, borderRadius: size, opacity }]} />
      ) : (
        <Image
          source={MATERIAL}
          resizeMode="contain"
          onError={() => setFailed(true)}
          style={{ width: size * 0.97, height: size * 0.97, opacity }}
          accessible={false}
        />
      )}
    </View>
  );
}

class RendererBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function BlobCanvas({
  state,
  energy,
  size,
  motionAllowed,
  active,
  press,
}: {
  state: BlobState;
  energy: SharedValue<number>;
  size: number;
  motionAllowed: boolean;
  active: boolean;
  press: SharedValue<number>;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const material = useImage(MATERIAL, () => setImageFailed(true));
  const shader = useMemo(getBlob3dShader, []);
  const look = APPEARANCE[state];
  const clock = useSharedValue(0);
  const materialClock = useSharedValue(0);
  const listening = useSharedValue(look.listening);
  const processing = useSharedValue(look.processing);
  const saturation = useSharedValue(look.saturation);
  const opacity = useSharedValue(look.opacity);
  const speed = useSharedValue(look.speed);
  const success = useSharedValue(state === 'success' ? 1 : 0);
  const successProgress = useSharedValue(0);
  const voiceBaseline = useSharedValue(0);
  const voicePulse = useSharedValue(0);
  const voiceRipples = useSharedValue(createVoiceRipples());

  const animated = active && motionAllowed && !imageFailed && !!material && !!shader;
  const reactsToVoice = animated && look.listening > 0;
  const frame = useFrameCallback(({ timeSincePreviousFrame }) => {
    const delta = Math.min(timeSincePreviousFrame ?? 0, 32) / 1000;
    clock.value += delta * speed.value;
    // Keep material flow independent of orientation and continuous at transitions.
    materialClock.value += delta * (0.65 + speed.value * 0.35);
    if (reactsToVoice) {
      const next = stepVoicePulse(energy.value, voiceBaseline.value, voicePulse.value, timeSincePreviousFrame ?? 0);
      voiceBaseline.value = next.baseline;
      voicePulse.value = next.pulse;
      voiceRipples.value = stepVoiceRipples(voiceRipples.value, next.pulse, energy.value, timeSincePreviousFrame ?? 0);
    }
  }, false);

  useEffect(() => {
    if (!reactsToVoice) {
      voiceBaseline.value = 0;
      voicePulse.value = 0;
      voiceRipples.value = createVoiceRipples();
    }
  }, [reactsToVoice, voiceBaseline, voicePulse, voiceRipples]);

  useEffect(() => {
    frame.setActive(animated && look.speed > 0);
    return () => frame.setActive(false);
  }, [animated, frame, look.speed]);

  useEffect(() => {
    const config = { duration: animated ? 440 : 0, easing: Easing.out(Easing.cubic) };
    listening.value = withTiming(look.listening, config);
    processing.value = withTiming(look.processing, config);
    saturation.value = withTiming(look.saturation, config);
    opacity.value = withTiming(look.opacity, config);
    speed.value = withTiming(look.speed, config);
    success.value = withTiming(state === 'success' ? 1 : 0, config);
    return () => {
      cancelAnimation(listening);
      cancelAnimation(processing);
      cancelAnimation(saturation);
      cancelAnimation(opacity);
      cancelAnimation(speed);
      cancelAnimation(success);
    };
  }, [animated, look, state, listening, processing, saturation, opacity, speed, success]);

  useEffect(() => {
    cancelAnimation(successProgress);
    if (state !== 'success' || !animated) {
      successProgress.value = state === 'success' ? 1 : 0;
      return;
    }
    successProgress.value = 0;
    successProgress.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) });
    return () => {
      cancelAnimation(successProgress);
    };
  }, [state, animated, successProgress]);

  const uniforms = useDerivedValue(() => {
    const input = active && motionAllowed && look.listening > 0 ? energy.value : 0;
    const ringsVisible = active && motionAllowed && look.listening > 0;
    return {
      size,
      time: motionAllowed ? clock.value : 0,
      materialTime: motionAllowed ? materialClock.value : 0,
      energy: Number.isFinite(input) ? Math.max(0, Math.min(1, input)) : 0,
      pulse: active && motionAllowed && look.listening > 0 ? voicePulse.value : 0,
      idle: state === 'idle' ? 1 : 0,
      voiceRingProgress: voiceRipples.value.agesMs.map(age => age / VOICE_RIPPLE_LIFESPAN_MS),
      voiceRingStrength: ringsVisible ? voiceRipples.value.strengths : [0, 0, 0],
      listening: listening.value,
      processing: processing.value,
      motion: motionAllowed && look.speed > 0 ? 1 : 0,
      saturation: saturation.value,
      opacity: opacity.value,
      success: success.value,
      successProgress: successProgress.value,
      press: motionAllowed ? press.value : 0,
    };
  }, [active, motionAllowed, size, look.speed, look.listening, state]);

  if (!material || !shader || imageFailed) {
    return <StillBlob size={size} opacity={look.opacity} />;
  }

  return (
    <Canvas style={{ width: size, height: size }} pointerEvents="none" accessible={false}>
      <Fill>
        <Shader source={shader} uniforms={uniforms}>
          <ImageShader
            image={material}
            fit="contain"
            rect={{ x: 0, y: 0, width: size, height: size }}
            tx="decal"
            ty="decal"
          />
        </Shader>
      </Fill>
    </Canvas>
  );
}

export function AICompanionBlob({
  state,
  energy,
  size = 320,
  onPress,
  reduceMotion = false,
  active = true,
  accessibilityLabel = 'Sprout companion',
  accessibilityHint,
}: AICompanionBlobProps) {
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const press = useSharedValue(0);
  const safeSize = Number.isFinite(size) ? Math.max(48, size) : 320;
  const motionAllowed = !reduceMotion && !systemReduceMotion;
  const disabled = state === 'disabled';

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setSystemReduceMotion(enabled);
    }).catch(() => {});
    const motionSubscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduceMotion);
    const appSubscription = AppState.addEventListener('change', (next) => setForeground(next === 'active'));
    return () => {
      mounted = false;
      motionSubscription.remove();
      appSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!active || !foreground || !motionAllowed || disabled) {
      cancelAnimation(press);
      press.value = 0;
    }
    return () => cancelAnimation(press);
  }, [active, foreground, motionAllowed, disabled, press]);

  return (
    <Pressable
      testID="ai-companion-blob"
      onPress={onPress}
      onPressIn={() => { if (motionAllowed) press.value = withTiming(1, { duration: 110 }); }}
      onPressOut={() => { press.value = withTiming(0, { duration: motionAllowed ? 240 : 0 }); }}
      disabled={disabled || !onPress}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy: state === 'processing' || state === 'requestingPermission' }}
      style={{ width: safeSize, height: safeSize }}
    >
      <RendererBoundary fallback={<StillBlob size={safeSize} opacity={APPEARANCE[state].opacity} />}>
        <BlobCanvas
          state={state}
          energy={energy}
          size={safeSize}
          motionAllowed={motionAllowed}
          active={active && foreground}
          press={press}
        />
      </RendererBoundary>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  still: { alignItems: 'center', justifyContent: 'center' },
  placeholder: { backgroundColor: '#B1C9AF', borderColor: '#186338', borderWidth: 1 },
});
