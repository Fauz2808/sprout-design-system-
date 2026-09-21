export const AUDIO_MOTION = {
  floorDb: -55,
  ceilingDb: -10,
  noiseGate: 0.08,
  attackMs: 45,
  releaseMs: 190,
  pollMs: 50,
} as const;

export function normalizeMetering(db: number | null | undefined): number {
  'worklet';
  if (typeof db !== 'number' || !Number.isFinite(db)) return 0;
  const value = Math.max(0, Math.min(1, (db + 55) / 45));
  return value < 0.08 ? 0 : value;
}

/** Exponential envelope is independent of display refresh rate. */
export function smoothEnergy(current: number, target: number, elapsedMs: number): number {
  'worklet';
  const previous = Number.isFinite(current) ? Math.max(0, Math.min(1, current)) : 0;
  const next = Number.isFinite(target) ? Math.max(0, Math.min(1, target)) : 0;
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return previous;
  const timeConstant = next > previous ? AUDIO_MOTION.attackMs : AUDIO_MOTION.releaseMs;
  const value = previous + (next - previous) * (1 - Math.exp(-elapsedMs / timeConstant));
  return next === 0 && value < 0.0001 ? 0 : value;
}
