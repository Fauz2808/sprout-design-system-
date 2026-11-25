# Handoff to Codex · App Store screenshots V.15 "People" · 24 Nov 2026

> **SUPERSEDED 25 Nov.** V.16–V.21 came after this file, and the current set is **V.22**
> (`screenshots-v22-people.html`, six slides, built on V.21; export `tools/export-v22.mjs`). Do not build on V.15.

Read first, in this order: repo `AGENTS.md`, this folder's `AGENTS.md`, then this file. If anything here conflicts with
`AGENTS.md`, `AGENTS.md` wins and you say so in your report.

## 1. Why this exists

Tony (CEO), 24 Nov: *"I really like the people element to the feel of the website. Could we make our app screenshots
pictures more like that."* The website hero is real parents at school drop-off with a soft dark green wash and the
headline on top. V.11 (the live store set) was tinted backgrounds with a phone. V.15 brings the people in.

Rounds so far, all in this folder:

| Version | File | Status |
|---|---|---|
| V.11 | `screenshots-v11-nine-slides.html` | Live in the store. Do not touch. |
| V.14 | `screenshots-v14-people-concepts.html` | 3 concepts (A photo on top, B photo card, C people opener). Ahmad picked **A**. |
| **V.15** | **`screenshots-v15-people.html`** | **Current.** Direction A, all 9 slides, in Figma. Waiting on Tony's review. |

Reference images of the current state (look at these before you change anything):
`exports/v15/1.png` … `9.png` (1290 x 2796) and `exports/v15/sheet.png` (all nine side by side).

## 2. The nine slides

| # | Headline (sage italic in *stars*) | Photo (`assets/people/`) | App piece |
|---|---|---|---|
| 1 | Your school's *parent community.* | `dropoff.webp` (website hero) | none |
| 2 | All your class details, in *one place.* | `picnic.webp` (website) | Class Tabs screen |
| 3 | Discover the names, faces, and stories of *all parents.* | `festival.webp` | Profile card |
| 4 | Wake up to your *family's brief.* | `morning.webp` | Daily Brief screen |
| 5 | School emails in, *your day out.* | `kitchen-phone.webp` | Gmail row + email + To-Do pieces |
| 6 | Take more *off your plate.* | `porch.webp` | Assist home (`assist-home-1119.png`) |
| 7 | Find events *your* kids will love | `storytime.webp` | Discover screen |
| 8 | Plan *important* moments | `birthday.webp` | Events screen |
| 9 | Invite the right *families,* in one tap | `pickup.webp` | Send Invites screen |

Copy is the V.11 Figma copy, character for character, except slide 6 (headline and subline rewritten 24 Nov because
the Assist home no longer has voice or chat). Do not "improve" copy.

## 3. How to make the common changes (use these recipes, do not invent new mechanisms)

All in `screenshots-v15-people.html`.

- **Move a photo's framing** (faces too high/low, wrong person centred): edit that slide's row in `PHOTOS` (~line 87).
  `background-position` moves it sideways (`'45% 0%'`); `[boxTop, boxHeight]` (cqw) moves where the sharp photo starts.
  Landscape photos start below the headline (boxTop 40-66) and fade in; portrait photos run full-bleed (negative boxTop).
- **Swap a photo**: put the file in `assets/people/` (WebP, >= 1290 px wide for portrait), change the row's file name
  in `PHOTOS`, then reframe. Do not generate or download photos yourself; Ahmad supplies them.
- **Change copy**: `COPY` (~line 100). Only when the task gives the exact words.
- **Gradient too strong/weak behind text**: pass keys as the 3rd argument of `photoSlide()` in `SLIDES` (~line 141),
  like `CANOPY` (~line 140). Keys are `[cqw from top, alpha]`. Keep alpha <= 0.6 and the curve eased.
- **Preview copy options without editing `COPY`**: set `window.__COPY_OVERRIDE = { slideIndex: [segments, sub] }`
  before load (puppeteer `evaluateOnNewDocument`). Used for the slide 6 headline options.

After any change run the export (`AGENTS.md` here) and look at the full-size PNG of every slide you touched.

## 4. Tasks

### Task 1 · Store sizes from V.15 (READY)

V.15 only exists at iPhone 6.9". Mohit needs every slot App Store Connect and Google Play ask for, the same set V.11 has
in `exports/v11/` (made by `tools/export-store-assets.mjs`).

**Change**
- `screenshots-v15-people.html`, the `q.has('export')` branch (~line 176): add `?device=ipad|play&cw=N`, ported from
  V.11 `screenshots-v11-nine-slides.html` lines 213-225, plus the `.frameless` CSS (V.11 lines 52-53).
- `tools/export-v15.mjs`: add `--device iphone63|ipad|play` (one browser, one page at a time; this Mac has 8 GB),
  writing `exports/v15/iphone-6.3/NN.png`, `exports/v15/ipad-13/NN.png`, `exports/v15/google-play/phone/NN.png`.
- Then a zip `exports/v15/Sprout Store Assets V.15.zip` with folders `iphone-6.9/` (the existing 1-9, renamed `01`-`09`),
  `iphone-6.3/`, `ipad-13/`, `google-play/`.

**Decided (do not reopen)**
- iPhone 6.3": 1206 x 2622. Same layout, it is the same aspect; just `w`/`h`.
- iPad 13": 2064 x 2752. Google Play: 1080 x 1920. **Frameless** (no phone bezel): Apple rejects iPhone frames in iPad
  shots, Play wants the app, not the device. V.11 did the same.
- On the wider iPad/Play canvas the **photo, blur and gradient fill the whole canvas** (rule: never a solid band, so
  V.11's plain tint at the sides is NOT allowed here). The headline + app column stays centred at `cw` (iPad 1460,
  Play 886, V.11's values). Gradient keys convert to the same fraction of canvas height.
- Google Play allows 8: drop slide 9 (Invites), as V.11 did.
- Every PNG RGB, no alpha (App Store rejects alpha). `export-store-assets.mjs` line ~68 shows the conversion.
- Header / search / feature-graphic art is NOT part of V.15. Do not regenerate it.

**Reuse**: V.11 device branch and `.frameless` CSS; `export-store-assets.mjs` structure; `photoSlide()` layers.

**Do not**: change the 6.9" output, `PHOTOS`, `COPY`, or the gradient keys; add new layout for iPad (no two-column,
no extra copy, no device frame); touch Figma.

**Check**
- `exports/v15/sheet.png` is pixel-identical before and after (6.9" unchanged). Compare with an md5 of `1.png`-`9.png`.
- Open every iPad and Play slide at full size: photo across the full width, no band or seam, faces between headline
  and app and not cut, nothing clipped at the edges, text readable.
- Sizes and mode: a Python/PIL loop printing `size` and `mode` for every PNG in the three folders.

**If stuck** (for example faces collide with the headline on the iPad canvas and the only fix would be a new layout):
stop, put screenshots in your report, write the question under Open questions below. Do not invent a layout.

### Task 2 · nothing else yet

Do not start other work in this folder. New tasks come from Ahmad in a new section here.

## 5. Open questions (Ahmad decides, Codex does not)

1. Slides 7-9 photos are 864 x 1536 (Figma AI), stretched ~1.5x on the slide. Soft but acceptable behind the gradient
   and phone. A sharper take is worth it if Tony approves V.15. Codex cannot generate images.
2. Slides 2 and 3 sublines contain an em dash ("Chat, calendar, updates, and key links for every class — no more
   digging…", "See who's who — every parent…"). Repo rule says no em dashes in copy; store rule says Figma copy
   char for char. Left as is until Ahmad says.
3. V.15 has no motion. V.11 slide 1 had a moving orbit used as the App Preview video. Is there a V.15 App Preview?
4. Tony has not reviewed V.15 yet. Nothing goes to Mohit before that.

## 6. Figma sync (Ahmad or Claude, not Codex)

Figma copy: Sprout Design (Prod) `EhpRiGZ5eJnBb132X9zewg`, App Screenshot page `338:21544`, section `16617:26814`,
frame `16616:26814`, slides `16616:26821` (1) … `16616:26946` (9). Each slide = `Background` frame (Photo blur,
Photo > Fade (mask) + Image, Gradient), all editable, then the text and phone layers from the HTML capture.

- Photo framing or gradient changed in the HTML: run
  `python3 "08 - Generated Screens/App Store/tools/figma-v15-backgrounds.py" > /tmp/v15-bg.js` and execute the output
  with the Figma MCP `use_figma`. It reads `PHOTOS` and the keys from the HTML, so Figma matches. New photo: upload it
  into that slide's Image rect with `upload_assets`, copy the hash into Photo blur, add it to `HASHES` in the script.
  **The rebuild replaces every Background frame; a crop done by hand in Figma is lost.** Move hand edits into the HTML first.
- Copy changed: edit the text layer in Figma directly (slide 6 headline is `16616:26908`, subline `16616:26910`).
- Phones/pieces changed: re-capture (`export-v15.mjs --plates`, then `?figma` with the capture script). Rarely needed.

## 7. Report format (per task)

DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT, then: files and lines changed, parts reused, commands run,
paths of the PNGs you looked at, md5 check result, "Figma sync needed: slides …" (or none), open questions added.
