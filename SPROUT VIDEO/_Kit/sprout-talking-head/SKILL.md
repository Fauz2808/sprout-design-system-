---
name: sprout-talking-head
description: Edit a talking-head or UGC clip into an on-brand Sprout Reel/TikTok (1080×1920) with Claude. The Sprout content brand kit (palette, type, captions, scene types, motion, sound) plus the pipeline: word-level transcript → planning page where the human picks one of four scene types per line (Captions, Captions + UI, Half, Full) and marks styled words → plan.json → HyperFrames scaffold with captions, layouts and transitions → Claude builds each scene fragment → render. Use when the user says: edit video Sprout, talking head, UGC Tony, reel/TikTok dari footage, /sprout-talking-head, planning page video, brand kit konten video, or hands over raw footage of a person talking. Not for faceless explainers or app-screen-only films (those use the Video N film engine in SPROUT VIDEO/).
---

# /sprout-talking-head

Sprout's method for turning footage of a person talking into a finished vertical video. Claude does the cutting
of time, the layout, the build, and the checks; the human decides what each sentence should look like. That split
is the whole point: taste goes in at the planning page, in about 15 minutes, instead of across five rounds of
revisions (Video 10 needed V1 to V5 before this kit existed).

Kit folder: `~/Sprout/SPROUT VIDEO/_Kit/sprout-talking-head/` (this skill is a symlink to it).

## Read first

- `references/brand-core.md`: colours, type, logo, icons, imagery, copy rules. Shared with carousels.
- `references/visual-guide.md`: captions, the four scene types and their exact layouts, scene content types,
  the three-object rule, motion. Look at `examples/arthur-v5/*.jpg` before building any scene.
- `references/sound-guide.md`: when a sound is allowed, levels, the SFX library.
- `references/plan-schema.md`: what the planning page saves.
- `docs/storyboard-figma.md`: the Figma storyboard (Ahmad's guide to editing, syncing and customising it).

## Workflow

Make the project folder first: `SPROUT VIDEO/Video N - <Name>/`, footage in `assets/`. Never edit the raw clip
in place.

**1. Transcript.** A word-level transcript is the backbone (captions, timing, the plan).
```bash
python3 "SPROUT VIDEO/_Kit/sprout-talking-head/tools/transcribe.py" "SPROUT VIDEO/Video N - Name/assets/raw.mp4"
```
Default engine: local whisper.cpp (`whisper-cli`, model `~/.cache/whisper/ggml-small.bin`), free, about 4 s for a
40 s clip. It runs with DTW token timing (needs `-nfa`, flash attention off) and a verbatim prompt so "um" and
restarts survive; then word edges are corrected from the audio envelope (DTW starts words late after a pause).
`--engine scribe` uses ElevenLabs Scribe instead (best timing, spends credits; the "Sprout Video" key is capped).
Any of Scribe JSON, Whisper JSON, or a plain word list works downstream. Read it back against the audio before
planning: a wrong word becomes a wrong caption, and dotted (low-confidence) words in the review page are the
first suspects.

**1b. Cut the raw footage.** Phone recordings arrive with dead air, "um"s and second tries.
```bash
python3 "SPROUT VIDEO/_Kit/sprout-talking-head/tools/cut.py" analyze "SPROUT VIDEO/Video N - Name" --raw assets/raw.mp4
python3 "SPROUT VIDEO/_Kit/sprout-talking-head/tools/cut.py" apply "SPROUT VIDEO/Video N - Name"
```
`analyze` transcribes if needed and proposes cuts by rule: fillers go; a doubled small word ("and, and") loses its
first copy, but "really, really" stays; a take that restarts after a pause loses the earlier attempt (the last
take is kept); pauses longer than 0.45 s shrink to about 0.24 s. Open `cut/review.html` in Chrome: struck words
are cut, "Play the cut" previews the result on the raw clip, a click keeps or cuts a word, "Save edl.json" into
`cut/`. Claude can also edit `cut/edl.json` directly (each word's `keep`). Which take sounds better is judgement:
the rules only know which came last. `apply` renders `assets/raw-cut.mp4` (both picture and sound cut at the
same frame-aligned instants, 8 ms fades at each join, keyframe every second), writes the retimed `words.json`
(sentences re-capitalised), and `cut/report.json` with every jump cut. The scaffold then alternates a 7%
punch-in at each jump cut on the face, so it reads as a second camera. Plan with `plan_page.py` as usual: it
picks `-cut` footage first.

**2. Plan (the human's step).**
```bash
python3 "SPROUT VIDEO/_Kit/sprout-talking-head/tools/plan_page.py" "SPROUT VIDEO/Video N - Name" --words transcript.json --title "Name"
```
If the clip's keyframes are more than ~1 s apart (phone and podcast exports often are), this also writes
`assets/<clip>-edit.mp4` with a keyframe every second and plans against it: HyperFrames seeks every frame, and a
sparse clip freezes in the speaker circle and renders about 7× slower (Arthur: 7 min → 57 s).
Open `planning.html` in Chrome (`open -a "Google Chrome" <path>`; it works from `file://`). Per line: play it,
pick a scene type, click words for a styled phrase, write what the scene shows. Shift-click a word to split a
line; "Merge with next line" joins two. Set the face point on the video, the plate colour, the speaker label.
The rhythm strip and percentages show the balance against the guide. "Save plan.json" into the project folder.
If asked to draft the plan, write a `plan.json` following visual-guide §3 rhythm rules, rebuild the page (it
loads an existing plan.json), and let the human change it. Never skip the human pass.

**2b. Plan in Figma instead (Ahmad's preferred surface).** Same plan, edited as a storyboard on the Figma page
"Video Story Board" (file and page in `tools/figma/figma.json`): footage still | `SB / Card` | free 9:16 sketch per
line, plus an `SB / Video Header`. Full guide for the human: `docs/storyboard-figma.md`. Claude's procedure:
- *Generate:* `storyboard.py spec <project> --title "Video N · Name"`, then run the output of
  `storyboard.py code <project> components` (once per file; idempotent) and `code <project> generate` through
  use_figma. Write `{file_key, page_id, section_id, footage}` from the result to `<project>/storyboard/figma.json`.
  Thumbnails: `upload_assets` with `count` = lines and `nodeIds` = the footage rect ids in order, save its output
  to a scratch JSON, then `storyboard.py upload <project> <that.json>`. Never paste images as base64.
- *Sync:* run `code <project> read` through use_figma, save the result as `<project>/storyboard/figma-export.json`,
  download each listed `sketch_node` with `get_screenshot` (URL, not base64) + curl into `storyboard/sketches/<id>.png`,
  then `storyboard.py apply <project> <project>/storyboard/figma-export.json` and report its change list.
- Generate replaces that project's section: sync before ever regenerating. Splitting a line happens in planning.html.

**3. Scaffold.**
```bash
python3 "SPROUT VIDEO/_Kit/sprout-talking-head/tools/scaffold.py" "SPROUT VIDEO/Video N - Name"
cd "SPROUT VIDEO/Video N - Name" && npm run check
```
This writes the generated `index.html` (footage, opening zoom, every scene's layout and transition, all captions
and styled phrases), a placeholder fragment per cutaway line in `scenes/`, `captions.srt`, `cues.json`, and
`scaffold-report.json`. The speaker circle and the half-screen window follow the face: Apple Vision
(`tools/face.swift`) measures the face every 0.5 s, smoothed, cached in `.face-track.json`; the plan's face
point is only the fallback. Render the animatic (`npm run render -- --output out/animatic.mp4 --quality draft
--workers 2`) when the rhythm needs a look before anything is built.

**4. Build scenes (Claude's step).** For each placeholder in `scaffold-report.json`:
- Read the line, its plan text, the scene type's slot (visual-guide §3), and the matching example frame.
- **List the assets you need before building** (a screenshot, a photo, a paper object to generate, a Sprout
  screen by Figma nodeId) and ask for the ones you cannot make. Generated paper objects follow brand-core
  imagery; Sprout UI is rebuilt from Figma, never generated.
- Replace the placeholder file with the scene: `<style>` scoped to `#<id>`, markup for the slot, and a
  `<script type="text/scene">` using `tl`, `T0`, `DUR`, `q()`, `qa()`, `word('w31').start`. Time arrivals to
  the spoken word. Add `<!-- cue w31 pop note -->` lines for the sounds the scene makes.
- Only edit `scenes/*.html` and `plan.json`. Never edit `index.html`: re-run the scaffold.
- Re-run scaffold + `npm run check` after each scene. Fix every error; review warnings.

**5. Sound.** Follow `references/sound-guide.md`. `cues.json` lists every event with a suggested sound. Mix with
the Video 9 `tools/mix.py` pattern (stems + −14 LUFS master). For a dialogue-only delivery (no music or SFX yet),
master the render instead: `python3 tools/master.py out/<name>.mp4` (60 Hz high-pass, loudnorm, gain trim and a
latency-compensated limiter; −14 LUFS, true peak under −1.5 dBTP; picture copied, never re-encoded). Run it once
on a fresh render, not repeatedly on its own output.

**6. Verify and hand over.** `npm run check`, render (`--quality delivery --workers 2` on this 8 GB Mac), then
check the file (0 decode errors with `ffmpeg -v error -i <mp4> -f null -`, frame count, audio offset 0 ms against
the source), extract one frame per script line at its strongest moment (ffmpeg) and look at them: face covered? text inside
x 72–972 / y 162–1659? caption and styled phrase never doubled? Send the MP4 and a contact sheet. A scene is not
done until Ahmad has watched it.

## Rules that keep it working

- One line = one scene type. If a sentence needs two pictures, split the line on the planning page.
- Every spoken word is captioned exactly once; the scaffold asserts it.
- `scenes/<id>.html` survives every scaffold run. If a line is merged or split, the report lists orphaned
  fragments: rename or delete them deliberately, never silently.
- Deterministic only: no `Math.random`, `Date.now`, network fetches, or infinite loops in a scene.
- English copy, no emojis, no em dashes in on-screen text.

## Status

Built 19 Oct 2026 and tested end-to-end on the Video 10 Arthur Brooks clip (`Video 10 - Happiness Test/kit-test/`):
13 lines, 7 built scenes (2 captions + UI, 2 half, 3 full), 3 styled phrases, delivery render in 78 s at
1080 × 1920, dialogue mastered. That folder is the worked example: its `scenes/*.html` show every scene type.
E2 cutting (transcribe.py + cut.py) built 19 Oct and tested on `Video 10 - Happiness Test/cut-test/`: a 25.9 s
fake raw (`make_fixture.py`: two abandoned takes, a stutter, long pauses) cuts to 16.3 s, and re-transcribing the
result matches the clean script word for word; a flash/beep test clip confirms picture and sound stay in sync to
the millisecond across joins. Not tested yet on real phone footage from Tony.
Not built yet: E4 SFX library gaps (risers, hits, long whooshes).
