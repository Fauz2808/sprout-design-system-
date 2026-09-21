export const blobStates = [
  'idle', 'requestingPermission', 'listeningQuiet', 'listeningActive',
  'processing', 'success', 'permissionDenied', 'interrupted', 'error', 'disabled',
] as const;

export type BlobState = (typeof blobStates)[number];

export const stateDetails: Record<BlobState, {
  label: string; title: string; status: string; description: string;
}> = {
  idle: { label: 'Idle', title: 'Start with\na thought.', status: 'Ready when you are', description: 'Liquid channels flow within a slowly turning, circular orb.' },
  requestingPermission: { label: 'Permission', title: 'A little permission\nto listen.', status: 'Waiting for microphone access', description: 'The surface settles while access is requested.' },
  listeningQuiet: { label: 'Listening · quiet', title: 'Take your time.\nI’m listening.', status: 'Listening for your voice', description: 'A calm baseline between words and pauses.' },
  listeningActive: { label: 'Listening · voice', title: 'Take your time.\nI’m listening.', status: 'Following your voice', description: 'Small shape changes and fading rings follow your voice.' },
  processing: { label: 'Processing', title: 'A moment\nto settle.', status: 'Finishing your recording', description: 'A steady internal flow while work completes.' },
  success: { label: 'Captured', title: 'Your voice,\ncaptured.', status: 'Recording complete', description: 'One soft release, with a gentle liquid flow continuing inside.' },
  permissionDenied: { label: 'Access denied', title: 'A little permission\nto listen.', status: 'Microphone access is off', description: 'A still surface and a clear way to recover.' },
  interrupted: { label: 'Interrupted', title: 'Let’s pick\nthat up again.', status: 'Recording interrupted', description: 'The microphone is released and the blob settles.' },
  error: { label: 'Error', title: 'Let’s try\nthat again.', status: 'Recording needs attention', description: 'Neutral motion, with the error shown in text.' },
  disabled: { label: 'Disabled', title: 'Here when\nyou need me.', status: 'Voice input is unavailable', description: 'Static and non-interactive until enabled.' },
};

/** A deterministic speech envelope for preview only. Never used for live audio. */
export function previewEnergy(seconds: number): number {
  'worklet';
  const phrase = seconds % 7.4;
  if (phrase > 5.6 || phrase < 0.35) return 0.015;
  const syllables = Math.pow(Math.max(0, Math.sin(seconds * 8.4)), 2);
  const cadence = 0.42 + 0.23 * Math.sin(seconds * 2.1);
  return Math.min(1, 0.10 + syllables * cadence + 0.12 * Math.max(0, Math.sin(seconds * 13.7)));
}

export function isBlobState(value: string | null): value is BlobState {
  return blobStates.includes(value as BlobState);
}
