export const VOICE_RIPPLE_LIFESPAN_MS = 900;
export const VOICE_RIPPLE_COOLDOWN_MS = 300;

export type VoiceRipplesState = {
  agesMs: [number, number, number];
  strengths: [number, number, number];
  cooldownMs: number;
  previousPulse: number;
};

export function createVoiceRipples(): VoiceRipplesState {
  'worklet';
  return {
    agesMs: [VOICE_RIPPLE_LIFESPAN_MS, VOICE_RIPPLE_LIFESPAN_MS, VOICE_RIPPLE_LIFESPAN_MS],
    strengths: [0, 0, 0],
    cooldownMs: 0,
    previousPulse: 0,
  };
}

export function stepVoiceRipples(
  state: VoiceRipplesState,
  pulse: number,
  energy: number,
  elapsedMs: number,
  enabled = true,
): VoiceRipplesState {
  'worklet';
  const level = Number.isFinite(energy) ? Math.max(0, Math.min(1, energy)) : 0;
  const currentPulse = Number.isFinite(pulse) ? Math.max(0, Math.min(1, pulse)) : 0;
  if (!enabled) {
    const reset = createVoiceRipples();
    reset.previousPulse = currentPulse;
    return reset;
  }

  const next = createVoiceRipples();
  const delta = Number.isFinite(elapsedMs) && elapsedMs > 0
    ? Math.min(elapsedMs, VOICE_RIPPLE_LIFESPAN_MS)
    : 0;
  const previousPulse = Number.isFinite(state.previousPulse)
    ? Math.max(0, Math.min(1, state.previousPulse))
    : 0;
  const cooldown = Number.isFinite(state.cooldownMs)
    ? Math.max(0, Math.min(VOICE_RIPPLE_COOLDOWN_MS, state.cooldownMs))
    : 0;
  next.cooldownMs = Math.max(0, cooldown - delta);
  next.previousPulse = delta > 0 ? currentPulse : previousPulse;

  let oldest = 0;
  for (let index = 0; index < 3; index += 1) {
    const age = Number.isFinite(state.agesMs[index])
      ? Math.max(0, Math.min(VOICE_RIPPLE_LIFESPAN_MS, state.agesMs[index]))
      : VOICE_RIPPLE_LIFESPAN_MS;
    const strength = Number.isFinite(state.strengths[index])
      ? Math.max(0, Math.min(1, state.strengths[index]))
      : 0;
    next.agesMs[index] = Math.min(VOICE_RIPPLE_LIFESPAN_MS, age + delta);
    next.strengths[index] = next.agesMs[index] < VOICE_RIPPLE_LIFESPAN_MS ? strength : 0;
    if (next.agesMs[index] > next.agesMs[oldest]) oldest = index;
  }

  const onsetRise = delta > 0 ? (currentPulse - previousPulse) * (1000 / 60) / delta : 0;
  if (delta > 0 && next.cooldownMs === 0 && level >= 0.08
      && currentPulse >= 0.18 && onsetRise > 0.02) {
    next.agesMs[oldest] = 0;
    next.strengths[oldest] = 0.35 + 0.65 * currentPulse;
    next.cooldownMs = VOICE_RIPPLE_COOLDOWN_MS;
  }
  return next;
}
