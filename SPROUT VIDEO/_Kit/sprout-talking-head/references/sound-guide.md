# Sound guide: Sprout talking-head edits

You are the sound designer for a Sprout video. The voice is the product; everything else exists to make the
picture feel physical and to help a parent follow the idea. Sprout sounds calmer than a "viral editor" edit:
fewer, softer sounds, each one tied to something the viewer can see.

## Philosophy

1. **Sound follows motion.** Every effect belongs to a visible action: a card lands, a panel slides, a tick
   appears. No action, no sound. Before placing anything, list every on-screen event with its time (the
   scaffold writes them to `cues.json`; scene fragments add their own).
2. **The voice wins.** No effect, riser, or music swell sits on a stressed word. Punchlines get silence around
   them, not a hit on top.
3. **Restraint.** About one effect per 1.5–3 seconds of video on average. Captions appearing are silent.
4. **Material, not sci-fi.** Sprout's world is paper and phones: paper slides, soft taps, gentle UI ticks. No
   laser, glitch, cinematic boom, or record scratch.

## Three families

| Family | Sounds | Used on |
|---|---|---|
| **Movement** | whooshes (short, long, textured paper) | panels sliding, scene changes, camera pushes, objects travelling |
| **Texture** | taps, pops, clicks, paper touches, UI ticks, message sounds | things appearing, landing, being checked, cards settling |
| **Tension** | soft risers and soft hits | the build into a key reveal and the landing of it; once or twice per video at most |

## Placement

- **Whoosh:** starts 2–4 frames before the movement and peaks at its fastest point. Length matches the move
  (short ≤ 250 ms moves, long for full-screen entries).
- **Tap, pop, click:** on the exact frame of contact or appearance. A staggered group of three items gets three
  sounds only if they are ≥ 120 ms apart; otherwise one.
- **UI sounds:** only on Sprout UI actions (tick, send, notification). Success sound for a completed task, never
  for a generic reveal.
- **Riser:** ends exactly on the reveal frame; 0.8–2 s long; fades in from silence. Followed by a soft hit or
  by nothing.
- **Never** within 150 ms of the stressed syllable of a punchline. Duck or drop the effect instead.

Default cues per scene type (the scaffold suggests these in `cues.json`; adjust by ear):

| Event | Suggested |
|---|---|
| Opening zoom | short whoosh, low level |
| Styled phrase reveal | soft pop or nothing (max every other one) |
| Captions + UI enter | soft tap; the UI's own action (tick, send) gets its UI sound |
| Half screen enter | short whoosh |
| Full screen enter | long or textured whoosh; a soft hit only for the most important reveal |
| Full screen exit back to face | short whoosh, quieter than the entry |
| End card | gather or ding |

## Levels (before the final master)

| Layer | Level |
|---|---|
| Voice | −17 LUFS integrated, dry, centred; 60 Hz high-pass |
| Music bed between lines | about −21 to −22 LUFS; ducked a further ~8 dB under the voice from the voice envelope (fast attack, slow release) |
| Whooshes | peaks around −20 to −16 dBFS |
| Taps, pops, UI | peaks around −22 to −16 dBFS |
| Hits | peaks up to −12 dBFS, never above the voice's peaks |
| Final master | −14 LUFS integrated, −1.5 dBTP (two-pass loudnorm), keep every stem |

The engine for this already exists: `SPROUT VIDEO/Video 9 - Pajama Day/tools/mix.py` (cue list → stems →
master). Copy it into the project and point its cue table at `cues.json`.

Music: instrumental only, no vocals, no drops; warm, soft piano or plucks around 80–100 BPM. The music dips
nearly to silence under a punchline and comes back after it. Source: ElevenLabs Music (rights cleared on our
account) or a locally composed bed (Video 10 `compose_audio.py`). Never a commercial song.

## Library

`assets/sfx/` holds the current library (ElevenLabs SFX, generated on Sprout's account, from Video 9).

| Need (checklist) | Have | File |
|---|---|---|
| Whoosh, short | yes | `whoosh.mp3` (pitch up 1.05–1.2 for shorter) |
| Whoosh, long | missing | |
| Whoosh, textured paper | missing | |
| Tap / soft click | yes | `tap.mp3` |
| Pop | yes | `pop.mp3` (rate 1.3 for a tick) |
| Paper touch / card land | missing | (`msg.mp3` at rate 0.95 works as a stand-in) |
| UI tick / success | yes | `msg.mp3` at rate 1.2, `ding.mp3` |
| UI send | yes | `send.mp3` |
| UI fail (soft) | missing | |
| Soft riser × 2 | missing | |
| Soft hit × 2 | missing | |
| Gather / end card | yes | `gather.mp3` |

Fill the gaps with ElevenLabs SFX (`tools/el.py` from Video 9) once the API key cap is raised, then add each file
here with what it is for. Name files by use, not by mood (`whoosh-long.mp3`, `riser-soft-1.mp3`).
