# Cut test

Test bed for the kit's raw-footage cutting (`tools/transcribe.py`, `tools/cut.py`, `templates/cut-review.html`),
19 Oct 2026. `make_fixture.py` rebuilds `assets/raw.mp4` from the clean Arthur Brooks clip with an abandoned first
take, a second abandoned start, a doubled "and", and long silences; `expected.json` is the answer.

```bash
python3 make_fixture.py
python3 ../../_Kit/sprout-talking-head/tools/cut.py analyze . --raw assets/raw.mp4
open -a "Google Chrome" cut/review.html
python3 ../../_Kit/sprout-talking-head/tools/cut.py apply .
```

Result: 25.9 s raw → 16.3 s cut in 4 pieces; 13 words of earlier takes and 1 doubled word removed; the cut,
transcribed again, matches the clean script word for word. `out/cut-test.mp4` is the scaffolded captions-only
render with punch-ins at the 3 jump cuts (`out/joins.jpg` shows frames either side of each join).
Not for publication: third-party footage.
