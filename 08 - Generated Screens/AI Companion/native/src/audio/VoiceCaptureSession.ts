import { AUDIO_MOTION, normalizeMetering } from './energy';

export type CapturePhase =
  | 'idle'
  | 'requestingPermission'
  | 'listening'
  | 'processing'
  | 'success'
  | 'permissionDenied'
  | 'interrupted'
  | 'error';

export interface LocalRecording {
  kind: 'local-recording';
  uri: string;
  durationMs: number;
  createdAt: number;
}

export interface CaptureSnapshot {
  phase: CapturePhase;
  durationMs: number;
  errorMessage: string | null;
  recording: LocalRecording | null;
}

export const INITIAL_CAPTURE: CaptureSnapshot = {
  phase: 'idle', durationMs: 0, errorMessage: null, recording: null,
};

export interface RecorderStatus {
  isRecording: boolean;
  canRecord: boolean;
  durationMillis: number;
  mediaServicesDidReset: boolean;
  metering?: number;
}

export interface CaptureRecorder {
  readonly uri: string | null;
  readonly isRecording: boolean;
  prepareToRecordAsync(): Promise<void>;
  record(): void;
  stop(): Promise<void>;
  getStatus(): RecorderStatus;
  release(): void;
}

export interface CaptureDependencies {
  requestPermission(): Promise<boolean>;
  setRecordingMode(enabled: boolean): Promise<void>;
  createRecorder(): CaptureRecorder;
  deleteRecording(uri: string): void;
  canStart(): boolean;
  onSnapshot(snapshot: CaptureSnapshot): void;
  onEnergy(energy: number): void;
  onCleanupError(error: unknown): void;
}

class CaptureInterrupted extends Error {}

/** One owner serializes native audio operations. Invalidation cancels awaited starts. */
export class VoiceCaptureSession {
  private snapshot: CaptureSnapshot = { ...INITIAL_CAPTURE };
  private recorder: CaptureRecorder | null = null;
  private pending = Promise.resolve();
  private generation = 0;
  private disposed = false;
  private recordingModeEnabled = false;
  private poller: ReturnType<typeof setInterval> | null = null;
  private temporaryUris = new Set<string>();
  private latestDurationMs = 0;

  constructor(private readonly deps: CaptureDependencies) {}

  get phase(): CapturePhase { return this.snapshot.phase; }

  private publish(patch: Partial<CaptureSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    if (!this.disposed) this.deps.onSnapshot(this.snapshot);
  }

  private enqueue(operation: () => Promise<void>): Promise<void> {
    const result = this.pending.then(operation);
    this.pending = result.catch(() => {});
    return result;
  }

  private current(generation: number): boolean {
    return !this.disposed && generation === this.generation;
  }

  private stopPolling() {
    if (this.poller !== null) clearInterval(this.poller);
    this.poller = null;
    this.deps.onEnergy(0);
  }

  private deleteTemporaryRecordings() {
    for (const uri of this.temporaryUris) {
      this.deps.deleteRecording(uri);
      this.temporaryUris.delete(uri);
    }
  }

  private async closeRecorder(retain: boolean): Promise<LocalRecording | null> {
    this.stopPolling();
    const recorder = this.recorder;
    this.recorder = null;
    let uri: string | null = null;
    let durationMs = this.latestDurationMs;
    let failed: unknown;
    if (recorder) {
      try {
        uri = recorder.uri;
        const status = recorder.getStatus();
        durationMs = Math.max(durationMs, Number.isFinite(status.durationMillis) ? status.durationMillis : 0);
        if (retain && (!status.isRecording || !recorder.isRecording || status.mediaServicesDidReset)) {
          throw new CaptureInterrupted('Native capture stopped unexpectedly');
        }
        if (status.isRecording || status.canRecord) await recorder.stop();
        uri = recorder.uri ?? uri;
      } catch (error) {
        failed = error;
      } finally {
        // Capture the URL before releasing the native shared object.
        try { uri = recorder.uri ?? uri; } catch { /* Native media services may already be gone. */ }
        if (uri) this.temporaryUris.add(uri);
        try { recorder.release(); } catch (error) { failed ??= error; }
      }
    }
    if (this.recordingModeEnabled) {
      try {
        await this.deps.setRecordingMode(false);
        this.recordingModeEnabled = false;
      } catch (error) { failed ??= error; }
    }
    if (!retain || failed) this.deleteTemporaryRecordings();
    if (failed) throw failed;
    if (!retain || !uri || durationMs <= 0) return null;
    return { kind: 'local-recording', uri, durationMs, createdAt: Date.now() };
  }

  start = (): Promise<void> => {
    if (this.disposed || ['requestingPermission', 'listening', 'processing'].includes(this.phase)) {
      return this.pending;
    }
    const generation = ++this.generation;
    this.publish({ ...INITIAL_CAPTURE, phase: 'requestingPermission' });
    return this.enqueue(async () => {
      try {
        await this.closeRecorder(false);
        if (!this.current(generation)) return;
        const granted = await this.deps.requestPermission();
        if (!this.current(generation)) return;
        if (!granted) {
          this.publish({ phase: 'permissionDenied', errorMessage: 'Microphone access is off. Enable it in Settings to record your voice.' });
          return;
        }
        if (!this.deps.canStart()) {
          this.publish({ phase: 'interrupted', errorMessage: 'Recording was interrupted. Tap to try again.' });
          return;
        }
        // Mark ownership before awaiting: cleanup must undo a partially applied audio mode.
        this.recordingModeEnabled = true;
        await this.deps.setRecordingMode(true);
        if (!this.current(generation)) { await this.closeRecorder(false); return; }
        this.recorder = this.deps.createRecorder();
        if (this.recorder.uri) this.temporaryUris.add(this.recorder.uri);
        await this.recorder.prepareToRecordAsync();
        if (!this.current(generation) || !this.deps.canStart()) {
          await this.closeRecorder(false);
          if (this.current(generation)) this.publish({ phase: 'interrupted' });
          return;
        }
        this.latestDurationMs = 0;
        this.recorder.record();
        this.publish({ phase: 'listening' });
        this.poller = setInterval(this.poll, AUDIO_MOTION.pollMs);
      } catch (error) {
        try { await this.closeRecorder(false); } catch (cleanupError) { this.deps.onCleanupError(cleanupError); }
        if (this.current(generation)) this.publish({ phase: 'error', errorMessage: 'The microphone could not start. Please try again.' });
      }
    });
  };

  private poll = () => {
    if (this.phase !== 'listening' || !this.recorder || this.disposed) return;
    try {
      const status = this.recorder.getStatus();
      if (this.recorder.uri) this.temporaryUris.add(this.recorder.uri);
      if (!status.isRecording || !this.recorder.isRecording || status.mediaServicesDidReset) {
        void this.interrupt();
        return;
      }
      this.deps.onEnergy(normalizeMetering(status.metering));
      if (Number.isFinite(status.durationMillis)) this.latestDurationMs = Math.max(0, status.durationMillis);
      if (Math.floor(this.latestDurationMs / 1000) !== Math.floor(this.snapshot.durationMs / 1000)) {
        this.publish({ durationMs: this.latestDurationMs });
      }
    } catch {
      void this.interrupt();
    }
  };

  stop = (): Promise<void> => {
    if (this.phase === 'requestingPermission') return this.reset();
    if (this.disposed || this.phase !== 'listening') return this.pending;
    const generation = ++this.generation;
    this.stopPolling();
    this.publish({ phase: 'processing' });
    return this.enqueue(async () => {
      try {
        const recording = await this.closeRecorder(true);
        if (!this.current(generation)) { this.deleteTemporaryRecordings(); return; }
        if (!recording) throw new Error('No completed recording');
        this.publish({ phase: 'success', recording, durationMs: recording.durationMs });
      } catch (error) {
        try { this.deleteTemporaryRecordings(); } catch (error) { this.deps.onCleanupError(error); }
        if (this.current(generation)) this.publish(error instanceof CaptureInterrupted
          ? { phase: 'interrupted', errorMessage: 'Recording was interrupted. Tap to try again.' }
          : { phase: 'error', errorMessage: 'Your voice could not be captured. Please try again.' });
      }
    });
  };

  private discard(phase: 'idle' | 'interrupted'): Promise<void> {
    const generation = ++this.generation;
    this.stopPolling();
    this.publish({ ...INITIAL_CAPTURE, phase, errorMessage: phase === 'interrupted' ? 'Recording was interrupted. Tap to try again.' : null });
    return this.enqueue(async () => {
      try {
        await this.closeRecorder(false);
      } catch (error) {
        this.deps.onCleanupError(error);
        if (this.current(generation)) this.publish({ phase: 'error', errorMessage: 'The temporary recording could not be cleared. Please try again.' });
      }
    });
  }

  reset = (): Promise<void> => this.discard('idle');
  cancel = (): Promise<void> => this.discard('idle');

  interrupt = (): Promise<void> => {
    if (!['requestingPermission', 'listening', 'processing'].includes(this.phase)) return this.pending;
    return this.discard('interrupted');
  };

  dispose = (): Promise<void> => {
    this.disposed = true;
    return this.discard('idle');
  };
}
