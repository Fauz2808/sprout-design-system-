# Validation record

Date: 2026-09-17. Scope: isolated iPhone prototype, not the production Sprout app.

## Follow-up: living internal material

The user requested internal texture/gradient motion, not only rigid rotation. `flowMaterialPoint` now applies two smooth, spatially varying tangent currents to the 3D material coordinates. Both surface samples use this field. `materialTime` is driven separately from the rotation clock; the shader still uses two texture samples and the same analytic circular surface. No new dependencies were added.

- Material motion continues after the completion ring ends. The success-only frame-stop timer was removed; background/hidden, Reduce Motion, and static/error state gating remain in place.
- The targeted renderer suite passed all nine tests without relaxing thresholds. It isolates material flow with rotation held fixed, checks several phase/orientation pairs, limits adjacent-frame RGB changes at 60/120 Hz, verifies settled-success flow, and preserves exact alpha silhouettes and Reduced Motion equality. These are software-rendered continuity checks, not native frame-rate measurements.
- The full regression suite passed 55/55 tests. Advancing only material time changed 94.46–95.64% of opaque pixels across the tested phases while preserving every alpha sample. Worst average adjacent-frame RGB changes were 1.070/255 at 60 Hz sampling and 0.562/255 at 120 Hz sampling.
- Typecheck and the iOS JS/Hermes export passed after the runtime edits.
- `.impeccable/review/04-living-material-native.mp4` records the running Simulator screen after the user completed a recording. Its first twelve seconds are sampled in `04-living-material-native-sequence.png`: liquid channels continue changing while the completed state remains visible. No recording was started or discarded by the assistant for this check.
- Fixed-rotation offscreen fixtures at material phases 2 and 6 visibly bend and redistribute the approved S-shaped channels without changing the outline. The reproducible fixture script now includes independent-flow comparisons and an optional animation export.
- Read-only integration review found no blocking issue in tangent displacement bounds, alpha isolation, motion gating, or the completion-state clock. Physical-device performance remains unmeasured. This is procedural material flow, not fluid physics.

## Follow-up: real 3D and expanding speech ripples

The user explicitly selected real 3D with the closest possible appearance to the approved material. The default renderer is now `blob3dShader.ts`. It evaluates an orthographic ray/sphere hit, surface normals, rotating object-space material, fixed lighting and one approximate refracted interior hit. It is an implicit 3D surface, not a mesh or path-traced glass simulation. The old 2.5D shader remains as reference code only.

- Speech onsets launch expanding soft-green rings; their radius grows while opacity falls, and expired rings disappear. Storage is limited to three rings, lifetime 900 ms, minimum interval 300 ms.
- Ring onset sensitivity is time-normalized. A new slow-attack regression catches a real 60/120 Hz mismatch and verifies it is fixed.
- At maximum input the sphere radius expands at most 1.5%, with at most 0.35% axis deformation. Idle rotates without a periodic contour wobble.
- Typecheck passed. All 52 tests passed, including exact shader compilation/rendering, material change across rotation angles with a stable alpha silhouette, circular bounds at voice peak, outward ring travel/fade, no edge clipping, and pixel-identical Reduced Motion outputs.
- iOS JS/Hermes export passed after integrating the new renderer. No new native dependencies or Blender assets were introduced.
- Native iPhone 17 Pro Simulator rendered the new material. `04-3d-idle.png` and `3d-voice-demo.mp4` capture the running app. The video contains user-driven microphone start/stop while the assistant observed; it records the screen, not microphone audio. `3d-native-sequence.png` samples that video and includes one empty trailing tile because only eleven sampled frames fit the recording.
- `3d-native-ripples.png` samples twelve consecutive native frames at 4 fps during that capture. These show speech-triggered rings expanding and fading around the rotating, circular blob. Evidence files are under `.impeccable/review/`.
- An independent read-only integration review found no blocking renderer or ripple lifecycle issues. This is a scoped review of this refinement, not whole-app or physical-device approval.
- `node scripts/render-blob-3d.cjs` reproduces eight offscreen rotation, voice and reduced-motion fixtures. This is functional evidence, not a physical-device performance benchmark.
- No claim of native frame-rate, thermals or battery validation. The visible material preserves the approved image's character but necessarily interprets unseen sides and baked highlights.

## Follow-up: subtle speech pulse

The user confirmed the prototype works and requested only a small speech pulse and slightly faster beat response. The existing material, layout, idle motion, and other states are preserved.

- Audio attack/release changed from 80/250 ms to 45/190 ms. Polling and the noise gate are unchanged.
- Rising speech adds up to 2.2% extra scale and a soft halo accent. A 160 ms baseline separates new accents from sustained volume; the pulse releases over 160 ms without a periodic oscillator.
- Pulse state resets outside active listening and with Reduced Motion. No new dependency or public prop is required.
- `npm run typecheck` passed; `npm test` passed all 34 tests, including CPU rendering of the exact shipped SkSL. Render tests check bounded silhouette growth, no canvas clipping, and pixel-identical results with pulse on/off for reduced-motion and non-listening states.
- `npm run export:ios` passed after the runtime edits.
- The updated app hot-reloaded and rendered on iPhone 17 Pro Simulator without a compile/runtime error. Capture: `.impeccable/review/03-pulse-tweak-native-runtime.png`. The Mac is now accessible and the old onboarding sheet is no longer present.
- A read-only independent source review found no issue in pulse gating, worklet captures, reset behavior, or public API compatibility. This is a scoped integration review, not a whole-screen design approval.
- The user's existing one-second recording was left intact. No new microphone session was started for this tweak; the user's live speech feel remains the next subjective check. Physical-device performance is still unmeasured.

The original-build record below is retained as history; its locked-Mac blocker describes that earlier check, not current host access.

## Passed

| Check | Evidence |
| --- | --- |
| TypeScript | `npm run typecheck`, exit 0 |
| Audio logic | `npm test`, 21 tests passed; includes denial, duplicate taps, cancel during permission/preparation, background interruption, native stop failure, media reset, cleanup retry, and disposal |
| Expo compatibility | `npx expo-doctor`, 21/21 checks passed |
| Dependency advisory check | `npm audit`, zero reported vulnerabilities at check time |
| iOS JS production export | `npm run export:ios`, exit 0; Hermes bundle and five assets exported to ignored `dist/` |
| Local development server | `http://127.0.0.1:8087/status` returned `packager-status:running`; IPv4-first Node DNS avoids localhost resolving to an IPv6-only listener |
| Native runtime loads | Expo Go SDK 57 on iPhone 17 Pro, iOS 26.5, renders the Sprout screen and approved orb without a red-screen runtime error |
| Preview routing | Developer-only `state=listeningActive` link changed the title/state in the native runtime; cannot start a microphone |
| Shader compile | CanvasKit compilation of the same SkSL succeeded for idle, active, processing, and success samples; this is supplementary, not a native performance measurement |

## Verification blocked

The host Mac locked while testing. Computer-use tools cannot operate the Simulator until the user unlocks it. The Expo Go first-run developer-menu sheet is still covering the lower viewport.

Existing screenshots in `.impeccable/review/` show the running app **with that sheet covering it**. They are runtime evidence only, not valid full-screen visual-review captures. No claim of final visual-review approval or successful microphone testing is made.

An independent default-agent reviewer substituted for the unavailable specialized Impeccable reviewer. Its verdict was `recapture`: replace `01-idle.png` and `02-listening.png` after dismissing the sheet, then run the full review. The orb, status, and primary action must all be visible. Final design-system documentation is deferred until that review and any corrections are complete.

Required next checks after unlock:

1. Dismiss the Expo Go onboarding sheet. Capture idle, active, processing, success, error, disabled, and reduced-motion views without overlays.
2. Tap Play the full sequence, stop it, select every state, and use the energy slider.
3. Switch to Microphone, tap to speak, handle the system permission prompt, observe the real meter, finish, and discard. Confirm no audio remains after discard.
4. Test a background interruption and restart. Confirm recording does not resume automatically.
5. Check large Dynamic Type and VoiceOver labels/focus. Capture final iPhone viewport for an independent native review.

## Not claimed

- No signed `.ipa`, standalone compiled Xcode app, or TestFlight build. Expo Go is the tested native host; `export:ios` exports JS/assets, not an installable app.
- No physical-iPhone frame-rate, thermal, battery, audio-route, or interruption testing yet.
- No Android, tablet, or web support validation.
- No AI backend, transcription, audio playback, speech synthesis, or upload.
- Temporary audio is hook-owned until reset, new recording, cancellation, or unmount. Abrupt OS termination can leave an app-cache file for the OS to reclaim; no promise of crash-proof deletion.

## Dependency note

The scoped `xcode > uuid` override pins 11.1.1 to address the advisory reported for the inherited older uuid package. The xcode UUID-generation call was checked with the CommonJS API. This is not a claim that a standalone native build has been compiled.
