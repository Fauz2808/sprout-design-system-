const BASELINE_MS = 160;
const PULSE_RELEASE_MS = 160;
const ONSET_GATE = 0.08;
const ONSET_MARGIN = 0.018;
const ONSET_GAIN = 4.5;

export function stepVoicePulse(
  energy: number,
  baseline: number,
  pulse: number,
  elapsedMs: number,
): { baseline: number; pulse: number } {
  'worklet';
  const level = Number.isFinite(energy) ? Math.max(0, Math.min(1, energy)) : 0;
  const previousBaseline = Number.isFinite(baseline) ? Math.max(0, Math.min(1, baseline)) : 0;
  const previousPulse = Number.isFinite(pulse) ? Math.max(0, Math.min(1, pulse)) : 0;
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) {
    return { baseline: previousBaseline, pulse: previousPulse };
  }

  const nextBaseline = level + (previousBaseline - level) * Math.exp(-elapsedMs / BASELINE_MS);
  const onset = level >= ONSET_GATE
    ? Math.min(1, Math.max(0, level - nextBaseline - ONSET_MARGIN) * ONSET_GAIN)
    : 0;
  const releasedPulse = previousPulse * Math.exp(-elapsedMs / PULSE_RELEASE_MS);
  return { baseline: nextBaseline, pulse: Math.max(onset, releasedPulse) };
}
