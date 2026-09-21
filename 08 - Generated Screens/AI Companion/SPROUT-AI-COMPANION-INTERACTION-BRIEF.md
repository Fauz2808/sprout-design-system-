# Sprout AI Companion Interaction Brief

Status: Implemented as an isolated React Native prototype; final Simulator interaction review pending  
Target: Reusable React Native component, iPhone first  
Visual master: `../Onboarding/assets/sprout-ai-blob-v1-transparent.png`

## Implementation record

The runnable implementation is in [`native/`](./native/README.md). It uses React Native, Skia, Reanimated, and Expo Audio, with no Blender or video loop. The user approved the existing Sprout blob and explicitly requested direct code implementation with all states.

The sections below preserve the original interaction direction, not exact implementation constants. For actual timing, opacity, API, and audio lifecycle, use the source and the native README. Specifically:

- The demo screen composes `AICompanionBlob` and `useVoiceCapture`; no separate `VoiceCompanionController` wrapper is exported.
- All ten visual states below are implemented. State changes blend over 440 ms; the success release lasts 1.1 seconds; unavailable/error states are static with reduced saturation and opacity.
- `processing` in the microphone demo only finalizes local recording. No AI, transcription, reply, or upload is implemented.
- The microphone is opt-in and stops manually. Background/interruption discards the partial recording.
- The native runtime loaded on iPhone 17 Pro Simulator. Typecheck, 21 audio tests, 21 Expo checks, and the iOS JavaScript export passed. Final tap/microphone testing is pending because the host Mac is locked; the Expo Go first-run sheet obscures part of the current capture.
- Physical-device frame rate, energy use, VoiceOver, and large Dynamic Type remain unverified. See `native/VALIDATION.md` for the evidence and limitations.

## 1. Job and audience

Sprout AI Companion is a reusable, one-way voice-input component for parents using Sprout. The parent speaks; the blob listens and responds visually to the energy and rhythm of their voice. It does not speak back, perform a character role, or imply a two-way AI conversation.

The component must feel calm, warm, safe, and attentive. Its job is to make microphone capture visible and trustworthy without turning voice input into a technical waveform tool.

## 2. Primary outcome

The user understands three things without explanation:

1. The microphone is ready.
2. Sprout is actively hearing their voice.
3. Their voice input has stopped, succeeded, or needs attention.

Success means the blob responds within one animation frame of a smoothed audio-level update, remains legible in silence and noisy rooms, and can be reused by any parent feature without embedding feature-specific copy or business logic.

## 3. Selected direction

### Interaction thesis

The blob behaves like a calm living surface, not a music visualizer. It breathes slowly while idle, expands and deforms in proportion to speech energy while listening, then settles decisively when capture ends.

Default control model:

- Tap the blob to start.
- Tap the blob again to finish.
- No automatic silence cutoff in v1. Parents pause while thinking; auto-stop would feel like an error.
- The parent feature decides what happens after capture, such as transcription, search, or event creation.

### Visual authority

- Use the approved transparent Sprout blob as the texture and color source.
- Cream `#F4F1EA` is the default surrounding surface, but the component itself remains transparent.
- Motion uses Sprout greens only. No new cyan, purple, neon, or generic AI gradients.
- No face, eyes, mouth, robot icon, particles, or decorative waveform.

## 4. Component architecture

Keep microphone ownership separate from rendering.

```text
Parent feature
    │
    ▼
VoiceCompanionController
    ├── useVoiceCapture
    │     ├── microphone permission
    │     ├── recording lifecycle
    │     ├── metering normalization
    │     └── recording URI / duration / errors
    │
    └── AICompanionBlob
          ├── controlled visual state
          ├── normalized audio energy 0...1
          ├── Skia image shader
          └── reduced-motion fallback
```

`AICompanionBlob` is presentational and controlled. It must not request permission, create a recorder, upload audio, run speech-to-text, or own feature copy.

`useVoiceCapture` owns microphone access and converts raw metering into a stable `energy` value. It exposes recording results and errors to the parent feature.

`VoiceCompanionController` is the optional ready-to-use composition for screens that want the standard tap-to-start and tap-to-finish behavior.

## 5. State model

| State | Blob behavior | Required feedback | Exit |
|---|---|---|---|
| `idle` | Slow 3.6s breathing cycle, subtle internal drift, no halo pulse | “Tap to speak” | Tap |
| `requestingPermission` | Breathing pauses; blob settles to 96% scale | System permission prompt | Permission result |
| `listeningQuiet` | Gentle movement at minimum energy; thin steady halo | “Listening… Tap when you’re done” | Voice energy or tap |
| `listeningActive` | Shape, highlight, and halo react to smoothed energy | Same label; elapsed time optional | Silence or tap |
| `processing` | Audio reaction stops; internal flow makes one slow directional sweep | Feature-owned status, such as “Working on it…” | Parent-controlled result |
| `success` | One restrained outward release, then settle | Feature-owned confirmation | Parent-controlled reset/navigation |
| `permissionDenied` | Static blob, reduced saturation | “Microphone access is off” and “Open Settings” | Settings or type fallback |
| `interrupted` | Motion freezes at neutral, never at a distorted peak | “Recording paused. Tap to try again.” | Tap or dismiss |
| `error` | Static neutral blob with semantic error treatment outside the blob | Plain-language error and retry | Retry or fallback |
| `disabled` | Static at 85% visual intensity | No tap behavior | Parent-controlled |

No `speaking` state exists. The component never animates as if Sprout is talking.

## 6. Audio-to-motion mapping

### Input

Use microphone metering in decibels for v1. Do not use pitch detection yet. Pitch causes unstable, nervous movement and adds processing cost without improving comprehension.

Normalize the useful voice range:

```text
raw dB range: approximately -55 dB to -10 dB
normalized = clamp((dB + 55) / 45, 0, 1)
noise gate: values below 0.08 become 0
```

Apply asymmetric smoothing:

- Attack: 70–90ms so the blob feels immediately attentive.
- Release: 220–280ms so it settles softly instead of flickering between syllables.
- Meter updates: 20–30Hz.
- Visual interpolation: 60fps on the UI/render thread.

### Visual channels

| Audio signal | Visual response | Range |
|---|---|---|
| Smoothed energy | Overall scale | `1.00 → 1.075` |
| Smoothed energy | Edge displacement | subtle `1 → 7px` equivalent |
| Smoothed energy | Halo opacity | `0.06 → 0.20` |
| Smoothed energy | Halo spread | `12 → 30px` equivalent |
| Short energy peaks | Brief surface tension ripple | max one ripple per 180ms |
| Speech cadence | Internal flow speed | `0.08 → 0.28` cycles/second |
| Sustained silence | Return toward listening baseline | after 350ms, never fully idle |

The blob must never exceed 8% scale growth. Large jumps read as alarm or volume warning rather than listening.

## 7. Rendering strategy

Use React Native Skia with the approved transparent PNG as an `ImageShader` input. A runtime shader applies low-frequency UV displacement and highlight drift while retaining the approved material and palette.

Use Reanimated shared values for `energy`, `time`, and transition progress so audio updates do not trigger React component re-renders. The shader reads those values as uniforms.

Fallback path:

- Static approved PNG.
- State changes communicated through a restrained halo, opacity, text, and haptics.
- Used for reduced motion, shader initialization failure, or unsupported runtime conditions.

## 8. Reusable API boundary

Planned component inputs:

- `state`: controlled visual state.
- `energy`: normalized `0...1` audio energy.
- `size`: component diameter.
- `onPress`: optional interaction callback.
- `disabled`: blocks interaction without changing layout.
- `reduceMotion`: override for testing; system preference remains default.
- `accessibilityLabel` and `accessibilityHint`.

Planned capture outputs:

- recording URI.
- duration in milliseconds.
- current normalized energy.
- permission state.
- interruption or recording error.

Feature-specific transcription, AI processing, upload, and persistence stay outside this package.

## 9. React Native prototype target

Build the first runnable prototype as an isolated Expo React Native app in this design repository, not inside the production design-system package. The production Sprout React Native source is not present here.

Recommended prototype stack:

- Expo app with an iOS development build.
- `expo-audio` for microphone permission, recording, and metering.
- `@shopify/react-native-skia` for the textured runtime shader.
- React Native Reanimated shared values for frame-safe motion.

Compatibility constraint: the existing design-system package uses React Native 0.73.4 and React 18. Current React Native Skia requires React Native 0.79+ and React 19; Skia 1.12.4 or below is required for React Native 0.78 and earlier. The isolated prototype can use the current stack, but the eventual Mohit handoff must either pin a compatible Skia version or align with the production app's actual React Native version.

## 10. Accessibility and trust

- The blob cannot be the only state indicator. Every state has visible text and a programmatic accessibility label.
- Tap target is at least 44×44pt even when the blob is rendered smaller.
- Respect iOS Reduce Motion. Replace continuous deformation with static state changes and a gentle opacity shift.
- Do not request microphone permission on screen load. Request only after the first explicit tap.
- If permission is denied, retain a typing fallback supplied by the parent feature.
- Stop and release the microphone when the app backgrounds, the screen unmounts, or an interruption occurs.
- Do not retain audio unless the parent feature explicitly accepts the completed recording.
- Haptics: one light impact on recording start, one soft success notification on accepted completion, none during speech.

## 11. Performance and validation

- Target 60fps on a baseline iPhone 13-class device.
- Audio sampling may update at 20–30Hz; rendering interpolates independently.
- Never set React state for every audio sample.
- Keep blob draw area bounded to its component instead of a full-screen Skia canvas.
- Pause the render loop when the component is not visible or is static.
- Validate microphone permission and animation in Simulator first.
- Validate latency, interruptions, thermals, and frame rate on one physical iPhone before production handoff. Simulator microphone and GPU behavior are not production evidence.

## 12. Prototype acceptance criteria

1. First tap requests permission, then begins recording when granted.
2. Normal speech visibly changes the blob within 100ms.
3. Quiet room noise does not create obvious deformation.
4. Tap while listening stops and returns a recording URI plus duration.
5. Long pauses do not auto-stop the session.
6. Permission denial presents recovery and typing fallback hooks.
7. App backgrounding stops capture and enters `interrupted` safely.
8. Reduce Motion produces a usable static alternative.
9. Component can be rendered in a demo screen with mocked energy and no microphone dependency.
10. No feature-specific copy or API logic exists inside `AICompanionBlob`.

## 13. Out of scope for v1

- AI voice playback or a `speaking` state.
- Full duplex or interruptible conversation.
- Speech-to-text accuracy and backend integration.
- Emotion inference from voice.
- Pitch-driven character behavior.
- Automatic end-of-speech detection.
- Android tuning before the iOS interaction is approved.

## 14. Implementation sequence after approval

1. Scaffold isolated Expo + Skia prototype.
2. Implement deterministic mocked-energy mode and state controls.
3. Implement the image shader using the approved transparent blob.
4. Add `expo-audio` permission, recording, and dB metering.
5. Connect smoothed energy to shader uniforms.
6. Add interruption, denied-permission, error, and reduced-motion paths.
7. Run on iPhone Simulator and capture all states.
8. Verify once on a physical iPhone before the handoff package is considered production-ready.

## Sources checked

- Expo Audio documentation: microphone permission, recording hooks, metering, and real-time PCM streaming.
- React Native Skia documentation: runtime shaders, image shaders, installation, and React Native compatibility.
- React Native Reanimated documentation: shared values and UI-thread updates.
