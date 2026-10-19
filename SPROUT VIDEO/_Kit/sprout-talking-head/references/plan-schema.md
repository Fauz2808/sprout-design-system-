# plan.json

Written by the planning page (`planning.html`, "Save plan.json") or by `tools/storyboard.py apply` from the Figma
storyboard, read by `tools/scaffold.py`. One file per
project, next to `words.json`. A plan is only valid for the transcript it was made from: its lines must cover
every word of `words.json`, in order, exactly once (the scaffold refuses anything else).

```json
{
  "schema": "sprout-talking-head/plan@1",
  "source": {"footage": "assets/clip.mp4", "words": "words.json", "duration": 37.51},
  "style": {
    "speaker_label": "ARTHUR BROOKS",
    "opening_zoom": true,
    "emphasis_plate": "sage",
    "cutaway_bg": "paper",
    "face": {"x": 0.517, "y": 0.30}
  },
  "notes": "Overall direction for Claude",
  "lines": [
    {
      "id": "L021",
      "start": 9.3, "end": 12.6,
      "text": "Now, that's important because it means you need to enjoy your life",
      "word_ids": ["w21", "...", "w32"],
      "scene": "full",
      "emphasis": ["w30", "w31", "w32"],
      "bg": "paper",
      "pip": true,
      "plan": "Full, text-centric: ENJOY / your life. plates, paper bloom below"
    }
  ],
  "saved": "2026-10-19T05:18:29"
}
```

| Field | Meaning |
|---|---|
| `style.speaker_label` | Top-left name on the footage; empty for none. Hidden while a panel covers the top. |
| `style.opening_zoom` | 100 → 118 → 112% push in the first 1.35 s. |
| `style.emphasis_plate` | Plate behind the serif line of a styled phrase: `sage`, `cream` (reversed), `ink`. |
| `style.cutaway_bg` | Default panel for half and full scenes: `paper` or `ink`. |
| `style.face` | Face centre as a fraction of the frame. Reframes half-screen footage and the speaker circle; also the zoom origin. |
| `lines[].id` | `L` + the first word's number. Stable when other lines are merged or split; names the scene fragment `scenes/<id>.html`. |
| `lines[].scene` | `captions`, `captions-ui`, `half`, `full` (see visual-guide.md §3). |
| `lines[].emphasis` | Word ids. On `captions` lines, each contiguous run becomes a styled phrase that replaces the ordinary caption. On other lines they show in Playfair italic inside the caption. |
| `lines[].bg` | `paper` or `ink` for half and full; `null` otherwise. |
| `lines[].pip` | Speaker circle on a full scene. |
| `lines[].plan` | Free text: what the scene shows. The brief for the fragment. |
| `lines[].sketch` | Optional. Path of Ahmad's layout sketch from the Figma storyboard (`storyboard/sketches/<id>.png`). The scaffold puts it in the placeholder brief; follow it when building the scene. |
| `from` | Optional. `figma storyboard` when the plan was written by `storyboard.py apply`. |

A line's scene runs from its first word (time 0 for the first line) until 80 ms before the next line starts, so a
pause after a sentence keeps that sentence's picture.
