import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VoiceCaptureSession, type CaptureDependencies, type CaptureSnapshot, type RecorderStatus } from '../src/audio/VoiceCaptureSession';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function fixture(overrides: Partial<CaptureDependencies> = {}) {
  const snapshots: CaptureSnapshot[] = [];
  const energy: number[] = [];
  const deleted: string[] = [];
  const modes: boolean[] = [];
  const calls = { permission: 0, create: 0, record: 0, stop: 0, release: 0 };
  const status: RecorderStatus = {
    isRecording: false, canRecord: false, durationMillis: 0,
    mediaServicesDidReset: false, metering: -32.5,
  };
  const recorder = {
    uri: 'file:///cache/sprout-test.m4a',
    get isRecording() { return status.isRecording; },
    prepareToRecordAsync: async () => { status.canRecord = true; },
    record: () => { calls.record += 1; status.isRecording = true; },
    stop: async () => { calls.stop += 1; status.isRecording = false; status.canRecord = false; },
    getStatus: () => status,
    release: () => { calls.release += 1; },
  };
  const session = new VoiceCaptureSession({
    requestPermission: async () => { calls.permission += 1; return true; },
    setRecordingMode: async (enabled) => { modes.push(enabled); },
    createRecorder: () => { calls.create += 1; return recorder; },
    deleteRecording: (uri) => { deleted.push(uri); },
    canStart: () => true,
    onSnapshot: (snapshot) => snapshots.push(snapshot),
    onEnergy: (value) => energy.push(value),
    onCleanupError: () => {},
    ...overrides,
  });
  return { session, recorder, status, calls, snapshots, energy, deleted, modes };
}

test('initialization never requests permission or opens microphone', async () => {
  const f = fixture();
  assert.equal(f.session.phase, 'idle');
  assert.equal(f.calls.permission, 0);
  assert.equal(f.calls.create, 0);
  await f.session.dispose();
});

test('denied permission is recoverable and does not create recorder', async () => {
  const f = fixture({ requestPermission: async () => false });
  await f.session.start();
  assert.equal(f.session.phase, 'permissionDenied');
  assert.equal(f.calls.create, 0);
  assert.deepEqual(f.modes, []);
  await f.session.dispose();
});

test('cancel during permission prompt prevents late microphone start', async () => {
  const permission = deferred<boolean>();
  const requested = deferred<void>();
  const f = fixture({ requestPermission: () => { requested.resolve(); return permission.promise; } });
  const start = f.session.start();
  await requested.promise;
  const cancel = f.session.cancel();
  permission.resolve(true);
  await Promise.all([start, cancel]);
  assert.equal(f.session.phase, 'idle');
  assert.equal(f.calls.create, 0);
  assert.equal(f.calls.record, 0);
  await f.session.dispose();
});

test('cancel during native preparation releases recorder without recording', async () => {
  const preparation = deferred<void>();
  const requested = deferred<void>();
  const f = fixture();
  f.recorder.prepareToRecordAsync = async () => {
    requested.resolve();
    await preparation.promise;
    f.status.canRecord = true;
  };
  const start = f.session.start();
  await requested.promise;
  const cancel = f.session.cancel();
  preparation.resolve();
  await Promise.all([start, cancel]);
  assert.equal(f.calls.record, 0);
  assert.equal(f.calls.release, 1);
  assert.deepEqual(f.modes, [true, false]);
  assert.deepEqual(f.deleted, [f.recorder.uri]);
  await f.session.dispose();
});

test('manual stop returns local capture and reset deletes it', async () => {
  const f = fixture();
  await f.session.start();
  f.status.durationMillis = 2300;
  const stop = f.session.stop();
  assert.equal(f.session.phase, 'processing');
  await stop;
  assert.equal(f.session.phase, 'success');
  assert.equal(f.snapshots.at(-1)?.recording?.kind, 'local-recording');
  assert.equal(f.snapshots.at(-1)?.recording?.durationMs, 2300);
  assert.equal(f.calls.release, 1);
  assert.deepEqual(f.deleted, []);
  assert.deepEqual(f.modes, [true, false]);
  await f.session.reset();
  assert.deepEqual(f.deleted, [f.recorder.uri]);
  assert.equal(f.snapshots.at(-1)?.recording, null);
  await f.session.dispose();
});

test('duplicate taps do not create overlapping native operations', async () => {
  const f = fixture();
  await Promise.all([f.session.start(), f.session.start(), f.session.start()]);
  assert.equal(f.calls.permission, 1);
  assert.equal(f.calls.record, 1);
  f.status.durationMillis = 500;
  await Promise.all([f.session.stop(), f.session.stop()]);
  assert.equal(f.calls.stop, 1);
  assert.equal(f.calls.release, 1);
  await f.session.dispose();
});

test('background interruption clears partial file and cannot report success', async () => {
  const f = fixture();
  await f.session.start();
  f.status.durationMillis = 500;
  await f.session.interrupt();
  assert.equal(f.session.phase, 'interrupted');
  assert.equal(f.snapshots.at(-1)?.recording, null);
  assert.deepEqual(f.deleted, [f.recorder.uri]);
  assert.equal(f.status.isRecording, false);
  await f.session.dispose();
});

test('native stop failure still releases microphone and discards file', async () => {
  const f = fixture();
  f.recorder.stop = async () => { throw new Error('Native recorder failed'); };
  await f.session.start();
  f.status.durationMillis = 300;
  await f.session.stop();
  assert.equal(f.session.phase, 'error');
  assert.equal(f.calls.release, 1);
  assert.deepEqual(f.deleted, [f.recorder.uri]);
  assert.deepEqual(f.modes, [true, false]);
  await f.session.dispose();
});

test('stop racing a native interruption never reports a successful capture', async () => {
  const f = fixture();
  await f.session.start();
  f.status.durationMillis = 300;
  f.status.isRecording = false;
  await f.session.stop();
  assert.equal(f.session.phase, 'interrupted');
  assert.equal(f.calls.release, 1);
  assert.deepEqual(f.deleted, [f.recorder.uri]);
  assert.deepEqual(f.modes, [true, false]);
  await f.session.dispose();
});

test('media reset replacing native URL also deletes original partial file', async (t) => {
  t.mock.timers.enable({ apis: ['setInterval'] });
  const f = fixture();
  await f.session.start();
  const originalUri = f.recorder.uri;
  f.recorder.uri = 'file:///cache/recreated-native-recorder.m4a';
  f.status.isRecording = false;
  t.mock.timers.tick(50);
  await f.session.dispose();
  assert.deepEqual(f.deleted, [originalUri, f.recorder.uri]);
});

test('metering drives shared energy without one React update per sample', async (t) => {
  t.mock.timers.enable({ apis: ['setInterval'] });
  const f = fixture();
  await f.session.start();
  const initialSnapshots = f.snapshots.length;
  f.status.metering = undefined;
  t.mock.timers.tick(50);
  assert.equal(f.energy.at(-1), 0);
  f.status.metering = -32.5;
  f.status.durationMillis = 450;
  t.mock.timers.tick(450);
  assert.equal(f.energy.at(-1), 0.5);
  assert.equal(f.snapshots.length, initialSnapshots);
  f.status.durationMillis = 1000;
  t.mock.timers.tick(50);
  assert.equal(f.snapshots.length, initialSnapshots + 1);
  await f.session.dispose();
});

test('native media reset changes to interrupted and clears energy', async (t) => {
  t.mock.timers.enable({ apis: ['setInterval'] });
  const f = fixture();
  await f.session.start();
  f.status.mediaServicesDidReset = true;
  t.mock.timers.tick(50);
  assert.equal(f.session.phase, 'interrupted');
  assert.equal(f.energy.at(-1), 0);
  await f.session.dispose();
  assert.equal(f.calls.release, 1);
});

test('unmount during pending permission cannot publish or start late', async () => {
  const permission = deferred<boolean>();
  const requested = deferred<void>();
  const f = fixture({ requestPermission: () => { requested.resolve(); return permission.promise; } });
  const start = f.session.start();
  await requested.promise;
  const snapshots = f.snapshots.length;
  const disposal = f.session.dispose();
  permission.resolve(true);
  await Promise.all([start, disposal]);
  assert.equal(f.calls.create, 0);
  assert.equal(f.snapshots.length, snapshots);
});

test('failed file deletion stays tracked for the next reset', async () => {
  let attempts = 0;
  const f = fixture({ deleteRecording: () => {
    attempts += 1;
    if (attempts === 1) throw new Error('Temporarily locked');
  } });
  await f.session.start();
  f.status.durationMillis = 500;
  await f.session.stop();
  await f.session.reset();
  assert.equal(f.session.phase, 'error');
  await f.session.reset();
  assert.equal(f.session.phase, 'idle');
  assert.equal(attempts, 2);
  await f.session.dispose();
});

test('app already backgrounded cannot begin recording after consent', async () => {
  const f = fixture({ canStart: () => false });
  await f.session.start();
  assert.equal(f.session.phase, 'interrupted');
  assert.equal(f.calls.create, 0);
  await f.session.dispose();
});
