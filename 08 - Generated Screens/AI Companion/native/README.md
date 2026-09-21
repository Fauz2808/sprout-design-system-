# Sprout AI Companion

An isolated React Native prototype of the approved Sprout liquid blob. Its surface responds to microphone volume and speech rhythm. The interaction is input-only: tap to record, tap again to finish. There is no AI reply, transcription, upload, or backend connection.

The app opens in **State preview**, which uses simulated audio and never requests microphone access. Switch to **Microphone**, then tap the blob or **Tap to speak** to begin real capture. Silence does not stop a recording.

## Run on iPhone Simulator

Requirements: Node.js 22, npm, Xcode with an installed iOS Simulator runtime, and an unlocked Mac for the permission prompts and Simulator controls.

```sh
cd "/Users/ahmadfauzanazhim/Sprout/08 - Generated Screens/AI Companion/native"
npm ci
npm run ios
```

The `ios` script starts Expo on `localhost:8087`, opens iOS Simulator, and prefers IPv4 DNS results. Keep the terminal running. The IPv4 preference avoids the Simulator connection issue encountered with the default localhost resolution on this machine. `npm start` runs the same server without opening Simulator.

Dismiss Expo Go's first-run developer-menu introduction before testing the app. In **State preview**, choose **Explore states** to inspect every visual state, adjust simulated voice energy, or enable Reduced Motion. **Play the full sequence** demonstrates the normal capture flow.

`npm run ios` uses Expo Go. To generate and run an app-specific native development build instead:

```sh
npm run ios:build
```

This generates the ignored `ios/` project and requires the local Xcode/CocoaPods toolchain. The app-specific bundle identifier is `co.joinsprout.companion.prototype`. The custom microphone permission text in `app.json` applies to that native build; Expo Go controls its own permission prompt.

## Runtime and integration boundary

| Dependency | Prototype version |
| --- | --- |
| Expo | SDK 57, `~57.0.23` |
| React Native | `0.86.3` |
| React | `19.2.3` |
| React Native Skia | `2.6.2` |
| Reanimated | `4.5.1` |
| Expo Audio | `~57.0.5` |

The existing Sprout design-system package at `04 - Design System & Storybook/package.json` uses React Native `0.73.4` and React `18.2.0`. This prototype has its own dependency manifest and lockfile. Do not copy its dependency versions into that older package without a separate compatibility migration. The production app's actual React Native version must be confirmed before integration.

The renderer evaluates an actual 3D sphere in a Skia runtime shader: camera-ray intersection, surface normals, rotating object-space coordinates, fixed lighting, and a shallow refraction approximation. The approved material in `assets/sprout-ai-blob.png` flows through that 3D space. Two smooth, spatially varying tangent currents stretch and bend the liquid channels independently of the sphere's rotation. Front and refracted-back samples share that flow field. It uses Reanimated shared values and does not need Blender, a video loop, or another native dependency. See `assets/PROVENANCE.md` for the source asset.

Rotation and material flow have separate clocks. Their phases remain continuous across normal state changes, including after the one-shot completion ring ends. Hidden/background components stop both clocks, static/error states stop their frame callback, and Reduce Motion freezes the material as well as the shape. This is procedural material deformation, not a fluid-physics simulation; the sphere's circular silhouette stays independent of the flowing texture.

This is an implicit mathematical 3D surface, not a polygon mesh or a path-traced glass simulation. The original reference supplies one view with baked highlights. Side and back views are an interpretation of its material, not a reconstruction of unseen geometry. Two material samples per sphere pixel keep the shader bounded; physical-device performance still needs measurement.

## Reusable API

`AICompanionBlob` is a controlled visual component. It does not own the microphone or feature-specific copy.

| Prop | Meaning |
| --- | --- |
| `state: BlobState` | One of the ten states below. |
| `energy: SharedValue<number>` | Smoothed voice energy between `0` and `1`. |
| `size?: number` | Full canvas size including the halo; defaults to `320`. |
| `onPress?: () => void` | Optional parent-owned action. |
| `active?: boolean` | Pause continuous rendering when the containing screen is hidden. |
| `reduceMotion?: boolean` | Force the static alternative. System Reduce Motion also applies. |
| `accessibilityLabel?`, `accessibilityHint?` | Parent-provided, state-specific accessible text. |

`useVoiceCapture()` returns:

```ts
{
  phase,          // idle | requestingPermission | listening | processing |
                  // success | permissionDenied | interrupted | error
  energy,         // SharedValue<number>, already smoothed
  durationMs,     // recording duration; UI updates approximately once per second
  errorMessage,   // string | null
  recording,      // { kind: 'local-recording', uri, durationMs, createdAt } | null
  start,          // () => Promise<void>
  stop,           // () => Promise<void>
  reset,          // () => Promise<void>
  cancel,         // () => Promise<void>
}
```

`start()` requests permission only after an explicit user action. `stop()` finalizes the local file. `reset()` and `cancel()` discard the capture and return to idle. Errors are exposed through `phase` and `errorMessage`; a resolved operation does not by itself mean capture succeeded. Read `recording` after the `success` state.

The hook's `listening` phase maps to either `listeningQuiet` or `listeningActive` in the UI. Alias `energy` before using it inside a worklet; do not capture the entire hook result. The actual energy remains on shared values, while React only receives quiet/active threshold changes.

Example composition for a screen whose navigator provides `isFocused`:

```tsx
import { useEffect, useState } from 'react';
import { Button, Linking, Text, View } from 'react-native';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { AICompanionBlob } from './src/companion/AICompanionBlob';
import { type BlobState, stateDetails } from './src/companion/model';
import { useVoiceCapture } from './src/audio/useVoiceCapture';

export function VoiceInput({ isFocused }: { isFocused: boolean }) {
  const { phase, energy, errorMessage, recording, start, stop, cancel, reset } = useVoiceCapture();
  const [voiceActive, setVoiceActive] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useAnimatedReaction(
    () => energy.value > 0.075,
    (active, previous) => {
      if (active !== previous) runOnJS(setVoiceActive)(active);
    },
  );

  useEffect(() => {
    if (!isFocused) void cancel();
  }, [isFocused, cancel]);

  const state: BlobState = !isFocused ? 'disabled'
    : phase === 'listening' ? voiceActive ? 'listeningActive' : 'listeningQuiet'
      : phase;
  const busy = phase === 'requestingPermission' || phase === 'processing';

  async function toggle() {
    setSettingsError(null);
    if (phase === 'permissionDenied') {
      try { await Linking.openSettings(); }
      catch { setSettingsError('Open iPhone Settings to enable microphone access.'); }
    } else if (phase === 'listening') {
      await stop();
    } else {
      await start();
    }
  }

  return (
    <View>
      <AICompanionBlob
        state={state}
        energy={energy}
        active={isFocused}
        onPress={isFocused && !busy ? () => void toggle() : undefined}
        accessibilityLabel={`Sprout companion. ${stateDetails[state].status}.`}
        accessibilityHint={phase === 'permissionDenied' ? 'Opens Settings.'
          : phase === 'listening' ? 'Finishes recording.' : 'Starts voice input.'}
      />
      <Text accessibilityLiveRegion="polite">{stateDetails[state].status}</Text>
      {(settingsError || errorMessage) && <Text>{settingsError || errorMessage}</Text>}
      {phase === 'permissionDenied' && <Button title="Check permission again" onPress={() => void start()} />}
      {recording && <Button title="Discard recording" onPress={() => void reset()} />}
    </View>
  );
}
```

Use a single active microphone owner per app audio session. `active={false}` pauses the renderer; it does not stop capture by itself. A mounted screen that loses navigation focus should call `cancel()`, as above. App backgrounding, inactive transitions during capture, native interruptions, and unmounting are handled by the hook. Permission-sheet inactivity is treated separately so granting access can complete normally.

For a parent feature that prefers typing, provide its own typing fallback beside the blob. No text-input workflow is built into this prototype.

## States

| State | Visual/interaction meaning |
| --- | --- |
| `idle` | Slow 3D rotation and independent liquid flow within a circular silhouette. |
| `requestingPermission` | Settled surface while permission and recorder setup complete. |
| `listeningQuiet` | Listening baseline between words; microphone remains active. |
| `listeningActive` | Small shape changes and expanding, fading rings follow speech accents. |
| `processing` | Finalizing the local recording after stop. It does not mean AI processing. |
| `success` | One restrained release, then gentle internal flow continues. The local capture completed. |
| `permissionDenied` | Static treatment with access recovery in Settings. |
| `interrupted` | Neutral/static treatment; partial audio is discarded and retry is explicit. |
| `error` | Static treatment with a specific error message from the capture hook. |
| `disabled` | Non-interactive visual, controlled by the parent. |

There is no `speaking` state. Preview can select all ten states without opening the microphone. Live capture reaches its states from real lifecycle events; `disabled` remains a parent-controlled visual state.

## Audio and file ownership

Metering is polled every `50ms`. The useful range is approximately `-55dB` to `-10dB`, with a noise gate at normalized energy `0.08`. Invalid or missing metering becomes silence. An exponential envelope uses a `45ms` attack and `190ms` release on UI frames. Raw audio samples do not trigger React re-renders.

Rising speech energy emits a circular, soft-green ripple which expands and fades over `900ms`, using the same visual language as the completion ring. The scheduler holds at most three rings and spaces emissions by at least `300ms`. It follows speech onsets rather than a periodic oscillator: sustained volume settles, and silence emits no new rings. Onset sensitivity is normalized across display refresh rates.

The 3D radius grows up to `1.5%`, plus up to `0.35%` axis stretch, to stay nearly circular even at peak speech. Pulse/ring state resets outside active listening, when hidden, and with Reduce Motion. Reduced Motion freezes both 3D rotation and internal material flow. The surrounding layout and capture behavior are unchanged.

The hook records one local temporary file in the app's cache. It retains a successful result only for the current hook session. Starting another recording, resetting, cancelling, or unmounting deletes the previous temporary file. Backgrounding or an interruption discards a partial recording. There is no playback, persistent storage, upload, or automatic speech cutoff in this prototype.

If a parent feature accepts a recording, copy `recording.uri` to storage that the parent owns **before** resetting or unmounting the hook. Do not keep the temporary URI as a durable reference. App termination can prevent cleanup code from running, and the OS can remove cache files independently. Cleanup failures are surfaced and retried on a later reset; temporary cache is not a permanent storage contract.

System Reduce Motion always takes precedence. The preview switch can additionally force a static alternative, but cannot turn off the system setting. The component retains text-based state feedback and falls back to the approved image when the shader cannot initialize.

## Checks

```sh
npm run typecheck
npm test
npx expo-doctor
npx expo install --check
npm run export:ios
npm audit
node scripts/render-blob-3d.cjs
```

The render script also supports `--animate` for a fixed-rotation material-flow clip and `--animate --rotate` to add a combined clip. It writes to a fresh temporary directory unless an output directory is supplied. Optional `--seconds`, `--fps`, and `--size` bound software-rendering work; encoding requires local `ffmpeg`. These clips test appearance, not device performance.

`export:ios` produces a Metro/Hermes bundle and assets in the ignored `dist/` directory. It is not an `.ipa`, a native Xcode build, or evidence of physical-device performance.

Latest validation recorded on 2026-09-17. See [VALIDATION.md](VALIDATION.md) for evidence and earlier checks:

- TypeScript check passed.
- All 55 tests passed, covering audio lifecycle, pulse/ripple timing, exact shader compilation, independent material flow and frame continuity, 3D rotation, circular bounds, ring expansion/fade, and Reduced Motion.
- Expo Doctor passed all 21 checks during initial setup; this refinement adds no dependencies.
- An iOS production bundle export completed after integrating the 3D renderer.
- Expo Go rendered the current 3D component in iPhone Simulator. Native screenshots and a screen recording capture idle rotation, user-driven microphone start/stop, speech rings, and completion. The earlier locked-Mac and onboarding-overlay limitations no longer apply to these captures.
- Physical iPhone microphone response, permission recovery, real interruptions, latency, frame rate, and thermals have not been validated. Android and web are not acceptance targets for this iteration.

Before a production handoff, complete a full ten-state walkthrough, accessibility and Settings-recovery checks, then repeat microphone, background/interruption, and Reduce Motion checks on a physical iPhone. The current refinement has scoped renderer/ripple verification, not whole-app production approval.

## Scoped `xcode` / `uuid` override

`package.json` contains:

```json
"overrides": {
  "xcode": {
    "uuid": "11.1.1"
  }
}
```

The `xcode` tooling dependency inherited a vulnerable `uuid` version below `11.1.1`. This scoped override resolved the audit finding without changing unrelated UUID dependencies; `npm audit` reported zero vulnerabilities after the change. `xcode`'s CommonJS `generateUuid()` path was checked with an initialized project hash and produced a valid 24-character project ID. Preserve the lockfile and this override until an upstream dependency update removes the need for it.

## Source map

- `App.tsx`: native preview controls and real microphone composition.
- `src/companion/AICompanionBlob.tsx`: controlled visual component, motion preference, accessibility wrapper, and fallback.
- `src/companion/blob3dShader.ts`: current 3D sphere, independent tangent material flow, rotation, lighting/refraction, speech ripples, and completion ring.
- `src/companion/blobShader.ts`: retained previous 2.5D renderer for reference; not used by the current component.
- `src/companion/voicePulse.ts`: frame-rate-independent speech-accent envelope.
- `src/companion/voiceRipples.ts`: bounded three-ring emission/lifetime scheduler.
- `src/companion/model.ts`: ten-state model, display copy, and deterministic preview energy.
- `src/audio/useVoiceCapture.ts`: native Expo adapter and UI-frame energy smoothing.
- `src/audio/VoiceCaptureSession.ts`: serialized recorder lifecycle, cancellation, and temporary-file ownership.
- `src/audio/energy.ts`: metering normalization and envelope functions.
- `src/theme/theme.ts`: Sprout color, font, spacing, radius, and elevation tokens.
- `tests/audio-*.test.ts`: audio lifecycle and normalization tests.
- `tests/blob-3d-shader.test.ts`: actual shader compilation and pixel checks for rotation, circularity, expanding/fading rings, clipping, and Reduced Motion.
- `tests/voice-*.test.ts`: pulse and ripple timing/gating regressions.
- `scripts/render-blob-3d.cjs`: reproducible offscreen rotation/voice/reduced-motion fixtures; these supplement native checks and do not measure device frame rate.

The agreed interaction brief is one directory above this app: `../SPROUT-AI-COMPANION-INTERACTION-BRIEF.md`.
