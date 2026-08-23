# Sprout — project instructions

Work-style rules live in `~/.claude/CLAUDE.md` and apply here too. This file is
only what's specific to Sprout.

## Tentang Project

Sprout is a parent-community app for school groups — events, clubs, chat, class
calendar, memories. iOS + Android, React Native. Currently in PMF: Tony gathers
rapid parent feedback and direction changes often.

**Brand:** warm cream `#f4f1ea`, brand green `#186338`, Playfair Display (display
+ **button labels**) × Inter (body). Icons are [Phosphor](https://phosphoricons.com/)
via `phosphor-react-native` — never hand-drawn substitutes.

**People**
| Who | Role | Consequence for us |
|---|---|---|
| Ahmad | sole UI/UX designer; the bridge from Tony's feedback to engineering | every design decision routes through one person, so tooling has to compensate for there being no design team |
| Tony Martin | CEO; writes ad scripts, gathers parent feedback | direction shifts arrive as conversation, not tickets |
| Mohit Rai | owns the RN repo, releases, OAuth | **Ahmad cannot push to the RN repo.** Handoff is 1:1. |
| Syed Tauret | implements in RN | consumes the handoff |

**The RN app source is not in this repo.** This repo is design assets + the
design system. Generated RN code lands in `04 - Design System & Storybook/` as
the handoff artifact for Mohit to take.

### Repo layout

Numbered top-level folders. The two that matter most:

- **`04 - Design System & Storybook/`** — the design system. **Its own nested git
  repo** with a *different* remote (`sprout-design-system`, no trailing hyphen)
  from the parent (`sprout-design-system-`, with one). Any cross-cutting change
  straddles two repos; commit both.
- **`08 - Generated Screens/`** — ~125 self-contained HTML prototypes, the explore
  loop's output.

Others: `01 - Website`, `02 - App Design`, `03 - App Marketplace Screenshots`,
`05 - Social Media`, `06 - Figma Plugins`, `07 - Design Guide`, `09 - Logo`,
`10–13` explorations, `15 - UI Design Example`.

### Figma

File `EhpRiGZ5eJnBb132X9zewg` — "Sprout Design (Prod)". Pages:

| Page | nodeId | What |
|---|---|---|
| 🎨 ・ Design (Prod) | `0:1` | live iOS/Android screens, ~333 frames, 21 numbered feature areas |
| Landing Page | `252:13655` | marketing site, 3 pages × 3 breakpoints |
| ↪︎ Style (Color and Text) | `2:6771` | text + effect styles |
| ↪︎ Components | `2:6772` | component library |
| ↪︎ Icon | `2:6773` | partial Phosphor mirror |

**Never port from:** `🗑️ Archive` (`2:6776`), `Exploration Page` (`142:8499`),
`Generated Components` (`1899:68024` — a stale AI artifact, generated twice),
Summer Camp V.1/V.2 (`9730:123008`, `9730:124457` — unresolved parallel explorations).

## Konvensi & Preferensi Kerja

- **Address Figma frames by nodeId, never by name.** Names are not identifiers in
  this file: `9.3 - Park…Past Events` appears ~22×, `7.1 - Home - Discover Events`
  ~19×. A name lookup silently returns the wrong frame.
- **Two-speed workflow.** *Explore* = disposable HTML prototypes in
  `08 - Generated Screens/<Area>/` for same-day feedback (skill: `/sprout-screen`).
  *Commit* = only validated designs, handed to Mohit 1:1. In PMF most ideas get
  thrown away, so keep the explore loop cheap.
- **Review in Chrome, flows horizontal.** `open -a "Google Chrome" "<abs path>"`.
  Multi-screen flows go side by side, one state per phone — Ahmad reviews at a
  glance, not by clicking through.
- **Never declare a design-fidelity port "done"/"beres" before Ahmad confirms it
  against Figma.**
- **Present concept directions before writing redesign code.** 2–3 structurally
  distinct options, get a pick. Never execute a redesign from a one-line brief.
- Design-system work has its own rules — see
  `04 - Design System & Storybook/CLAUDE.md`, which auto-loads in that folder.

## Keputusan Penting (Decision Log)

- **2026-08-23 — Full design-system rebuild, reversing the July "no cleanup during
  PMF" call.** *Why:* the screens have zero componentization (reusable cards are
  copy-pasted, not instances) and that is the actual blocker on Figma→code accuracy.
  A slicer reading unnamed raw frames has to infer structure, and inference is
  where fidelity leaks. *How to apply:* naming → master components → instances →
  then slice. Naming is scoped per flow, not done globally up front.
- **2026-08-23 — Adopt Atlassian-style token naming.** All 153 Figma variables
  renamed (`color/text/subtle`, `elevation/surface/raised`, `space/16`); collections
  are `Primitives`/`Semantic`/`Scale`. *Why:* Sprout's taxonomy was already ~80%
  aligned with Atlassian; formalising it costs little and makes the system legible
  to anyone hired later. Full spec in `04 …/CONVENTIONS.md`.
- **2026-08-23 — Slicing order: Onboarding (areas 1+3) → Registration (2+4+5+6) →
  Home (7+8) → rest.**
- **2026-08-23 — "100% accuracy" is defined operationally, not aspirationally.**
  Structural accuracy 100% and machine-enforced; visual accuracy as a perceptual
  diff under a stated threshold. *Why:* Figma and React Native don't hint glyphs
  identically, so a literal pixel target would be waived the first time it failed.
  Uber's Base Web does this with per-commit visual regression — machinery, not
  discipline.
- **2026-07-13 — Storybook retired as a design tool** (26 components / 33 stories
  went dormant; too much maintenance for a solo designer). Kept only as a headless
  render target for automated verification. Do not hand-maintain stories.
- **2026-07-13 — HTML is the source of truth for screens; Figma is the source of
  truth for the system** (tokens + components). Screens are not born or iterated
  in Figma.

## Jangan Lakukan (Anti-patterns)

- **Don't trust a frozen export.** `14 - Sprout UI Design Directory` once held 183
  SVG (770 MB) + 183 PNG of Figma screens; they went stale and gave false
  confidence — you end up designing against an outdated look. Deleted 2026-07-13.
  Reference renders must be generated on demand from live Figma.
- **Don't hand-edit a generated file.** Anything under
  `04 …/tokens/` other than `.figma-sync.json` and `theme.ts` is output.
- **Don't ship testing scaffolding as real UI.** A debug control added to demo two
  states (the subgroup switcher) is not a feature. Prove state with a script, or
  label it visibly as a testing aid.
- **Don't recreate competitor logos** in comparison material. Plain text name only.
- **Don't surface real parent rosters, emails, or student info** in a prototype,
  even when the source material contains them.
- **Don't `git clean`/`checkout` casually here.** This repo has repeatedly held
  100+ files that existed nowhere else. Check `git status` first.

## Living product

Sprout is redesigned continuously — Ahmad: *"we always improvising, retouching,
redesign, reframing, almost everything we design."* Consequences that override
any instinct toward one-time migrations:

1. **Prefer re-runnable pipelines to correct one-offs.** If a thing can't be
   regenerated cheaply, it will be stale within a month.
2. **Staleness must be detectable, not remembered.** Sliced screens record the
   Figma version they came from so "what changed since?" is a report.
3. **Migrate lazily, on touch.** A screen enters the pipeline when feedback
   touches it. Big-bang migration of all ~333 frames is the PMF over-investment trap.
