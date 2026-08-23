# Sprout: Figma → React Native, 100% design accuracy

**Goal:** slice UI from Figma into React Native at 100% design accuracy, on a product that is redesigned continuously.
**Status:** Phase 0 ✅ · Phase 1 ✅ · Phase A ✅ · Phase B ✅ · Phase C next
**Last updated:** 2026-08-23

---

## Context

Sprout's design lives in one Figma file (`EhpRiGZ5eJnBb132X9zewg`). Ahmad is the only designer; the RN app belongs to Mohit and Ahmad cannot push to it. Three compounding problems:

1. **Everything downstream of Figma was hand-copied**, so the design system was described in four places and generated in none.
2. **The screens have no componentization.** Reusable cards are copy-pasted, not instances, and layers/frames are largely unnamed. This is the accuracy blocker: a slicer reading an unnamed raw frame must *infer* structure, and inference is where fidelity leaks.
3. **The product is alive.** Ahmad's words: *"we always improvising, retouching, redesign, reframing — almost everything we design."* So this cannot be a one-time migration. Re-running has to be cheap, and staleness has to be detectable.

The intended outcome is not "a correct port once". It's a pipeline where Figma is the only authored source, every downstream artifact is generated, and accuracy is a gate that fails loudly rather than a thing people try hard at.

### Ahmad's four asks, in dependency order

| Asked | Actually is | Phase |
|---|---|---|
| Upgrade the CLAUDE.md so this knowledge persists | the anchor — nothing else survives a session boundary without it | **A** ✅ |
| Reference how Atlassian/Uber *document and implement* their systems | the standard, and the docs bar | 1 ✅ / **F** |
| Rename layers and screens, then build master components + instances | the accuracy unlock and the bulk of the work | **C**, **D** |
| 100% Figma→code accuracy | the **output** of the above, enforced as a gate | **G** |

Decisions: 1:1 handoff · system before screens · full design-system rebuild · StyleSheet + `theme.ts` · **full Atlassian-style token naming** · modes structured-for-later · **layered CLAUDE.md** (parent + design-system repo) · **componentize by extracting from real screens** · **slicing order: Onboarding (areas 1+3) → Registration (2+4+5+6) → Home (7+8) → rest** · **docs = generated site published as an Artifact**.

---

## Where things stand

**Done and verified:** all 153 Figma variables renamed to `color/text/subtle`, `elevation/surface/raised`, `space/16`; collections are `Primitives`/`Semantic`/`Scale` with modes scoped to the alias tier only; semantic layer confirmed 100% aliased with zero raw hex and zero dangling aliases; `CONVENTIONS.md` written; `tokens/.figma-sync.json` → `build-tokens.mjs` → DTCG + CSS + typed TS + legacy `tokens.css` + skill mirror, with sanity gates and a `tokens:check` guard wired into CI (push + pull_request); `theme.ts` rebuilt as a thin adapter, all 68 token paths used in `src/` resolve, typechecks clean; layered `CLAUDE.md` in both repos; `/learn`'s path bug fixed; memory repaired; a visual-regression baseline captured for the Core 14's representative stories.

**The drift this replaced** (history, not open work): `theme.ts` had `content.secondary` at `#818898` against Figma's `#7d715e`, `content.tertiary` wrong, three tokens missing outright, `radius.full` at 9999 vs 99999 — and the two big ones:

- **14 of 15 text styles had the wrong line-height.** Figma authors line-height as a *percentage*; the hand-written file guessed pixels. h2 was 32 against 36, p1 was 24 against 27.2. Only h4 was right. Line-height drives vertical rhythm, so every text block in every port was mis-spaced. This is the best single explanation for "ports look off" found so far.
- **The entire `shadows` block was fabricated** — an `sm/md/lg/brand` ladder at opacity 0.06/0.10/0.14/0.28 against Figma's four real effect styles at 0.05/0.2/0.03/0.03, with no brand-tinted shadow existing at all.

### Hard constraints (verified, not assumed)

- **Code Connect unavailable** — needs Organization/Enterprise; Sprout's team is **pro**.
- **Variables REST API unavailable** — Enterprise-gated, 403s. The **Desktop Bridge is the only programmatic path to Variables.**
- **No Figma branching** on Pro → rebuild in-place; version history + `figma_diff_versions` is the safety net. Baseline `2390483209270090205` recorded.
- `figma_export_tokens`' formatters are unusable here (slugify collection names into token paths, emit `[data-theme="mode-1"]` for single-mode collections, and cache reads through `refreshCache`). Its DTCG round-trip metadata is still preserved — `sprout.tokens.json` uses it.

---

## Phase A — Learning mode and the instruction layer ✅

- Fixed `/learn`'s hardcoded memory path (was pointed at AI Brand Guide's project regardless of which project it ran in) and its step 5 target (a project CLAUDE.md that didn't exist).
- Created `Sprout/CLAUDE.md` (product, people, Figma page map, the address-by-nodeId rule, Decision Log, anti-patterns, living-product section) and `04 - Design System & Storybook/CLAUDE.md` (the pipeline contract — sync boundary, gates, plan-tier constraints, the typography/shadow facts).
- Rewrote `sprout-design-tokens-pipeline.md` rather than extending it (its central claim and 14 of 15 line-heights were wrong — extending would have preserved the errors). Surgically reversed three other stale decisions. Added new memory for the rebuild decision. Fixed both `MEMORY.md` index defects.

## Phase B — Close the token loop ✅

1. `tokens.css` and the skill mirror (`~/.claude/skills/sprout-screen/assets/tokens.css`) are now generated from `.figma-sync.json`, byte-identical to each other, all 15 line-heights correct, shadows expressing Figma's spread as an explicit 4th `box-shadow` value.
2. Fixed the skill's hand-edited assets: `components.html`'s fabricated shadow (`12.5px`/`.14`) and off-token page colour; `figma-push-recipe.md`'s shadow alpha (was writing the fabrication *back into* Figma) and its token cheat-sheet; `template.html`'s wrong line-heights, undefined `var(--shadow)`/`var(--shadow-sm)` (silently resolved to nothing), and 4 off-token hexes; `SKILL.md`'s stale token line, including removing the now-backwards "never use `#818898`" warning.
3. `Input.tsx`/`TextArea.tsx`'s `placeholderColor: '#818898'` now imports from generated tokens — confirmed identical resolved value, a no-visual-change refactor. (Each file's other raw-hex `FIGMA` constants are intentionally untouched; full migration is Phase E, not this fix.)
4. Fixed `handoff/sprout-design-handoff.html`, which had swapped `content.secondary`/`content.tertiary`'s documented hex values — it was handing Mohit the wrong colours.
5. Renamed the 4 inconsistent Figma text styles (`Caption / 1|2|3`, `Paragraph / 2`) to match the other 11.
6. `tokens:check` now runs in CI on push and pull_request, before the Storybook build; the deploy job is guarded to push-only.
7. Captured a visual-regression baseline (`visual-baseline/`, 7 components, representative multi-state stories) with a `--compare` mode, verified in both directions (fresh run = no diff, tampered file = caught, exit 1).

**Note on the plan's original verification wording:** it named `--color-text-subtle` as what `tokens.css` should contain — that string actually lives in `tokens.generated.css` (new vocabulary); the legacy `tokens.css` correctly uses `--content-secondary` etc. (old vocabulary, for the ~125 HTML prototypes). Both are generated, both verified correct; the check just spans two files instead of one.

## Phase C — Figma naming hygiene (per flow, not globally)

Ahmad's order — naming before components — is right, because a component promoted out of unnamed layers inherits the mess. But naming all ~333 frames up front is waste when only one flow is in play, so this runs **scoped to the flow being worked**.

Per flow: role-name every layer (`Rectangle 12` → `Divider`, `Frame 481` → `Container`); resolve duplicate frame names, keeping the highest-nodeId canonical; rename or delete integer-named frames; auto-layout anything absolutely positioned. Fix the shipped typos as encountered (`Birhtday`, `Notifcation`, `No Event in lcation`, `2.4- Verify`).

Note **names are not identifiers in this file** — `9.3 - Park…Past Events` appears ~22×, `7.1 - Home - Discover Events` ~19×. Every tool addresses frames by nodeId regardless.

## Phase D — Master components by extraction

Evidence-driven, per flow:

1. **Audit** — fingerprint repeated structures across the flow's frames (same child shape, fills, spacing). Structure-based, so it works before naming is complete.
2. **Rank** — occurrence count. **≥3× across screens ⇒ component.** Once ⇒ stays local. Report the ranked list before building anything.
3. **Extract bottom-up** — atoms before molecules. `Avatar` must exist before `ListRow` contains it, or the extraction nests raw layers.
4. **Build to `CONVENTIONS.md`** — named variant properties (`Variant=Primary, Size=Large`, never slash-encoded), auto-layout throughout, every fill/space/radius bound to a `Semantic` or `Scale` variable, role-named layers identical across variants, description filled in (it feeds both the docs and the slicer).
5. **Swap** — replace copy-pasted originals with instances, overrides preserved.
6. **Lint** — `figma_lint_design`: zero hardcoded colours, zero detached components, zero default names.

Target is the **Core 14** — the 7 existing RN components plus Card, ListRow, Chip, FilterChip, Avatar, Checkbox/Radio/Toggle, TabBar — but the audit decides order and may add. Components 8–12 are what the ~125 HTML prototypes lean on hardest and have **no Figma equivalent at all**; that gap is why round-trips lose fidelity.

**Also here:** collapse the 4 nodes named "Button" to the one real set (`8514:92114`); promote `Input Form & Text Area` (`32:1018`) from a plain frame into real `Input` + `TextArea` sets; delete `Container` ×4 and `Frame 48096346`; archive the stale `Generated Components` page (`1899:68024`, a duplicated-twice AI artifact from a prior session).

**Retire legacy Styles without breaking anything:** bind each of the 79 FILL styles to its matching primitive rather than deleting it. Deleting detaches ~14k frames; binding keeps old screens rendering *and* makes them resolve to a variable. Retired as an authoring surface, kept as a compatibility layer.

## Phase E — RN parity and the component map

`figma_check_design_parity` per component (Figma nodeId + code spec from source) → parity score and fix items for both sides; iterate until clean. Closes a loop that has never existed: nothing currently verifies an RN component against its Figma source.

Also migrates the **25 primitive-level `colors` imports onto `semanticColors`**, and finishes what Phase B started narrowly on `Input`/`TextArea`: the rest of each component's raw-hex `FIGMA` constant object onto generated tokens. Today `semanticColors` has 1 import site against `colors`'s 25 — components bypass the semantic layer entirely, so a semantic token change doesn't propagate. This is what makes the tier architecture real rather than decorative.

Then the **component map**: Code Connect can't publish on Pro, but the 7 `figma-code-connect/*.figma.tsx` files already encode nodeId + prop mappings. Parse them into `component-map.json` (`nodeId → { component, path, variantPropMap }`), extend to all Core 14, and keep the `.figma.tsx` files as authored source so a future Organization upgrade publishes with zero rework.

## Phase F — Documentation site (the Atlassian/Polaris bar)

Generated from tokens + component map + Figma screenshots, published as a shareable Artifact. Zero hand-maintenance, regenerated on every sync — which is the only way docs survive a living product.

Per-component page follows the industry-standard template: **Overview → Anatomy (labelled diagram) → Variants & states (including loading, error, disabled, empty, overflow) → Props (values + defaults) → When to use *and when not to* → Accessibility (keyboard, screen reader, contrast) → Code → Related components.** Good docs answer four questions: what it looks like, when to use it, how it behaves, how to implement it.

Plus foundations pages for the token tiers — including `Scale`, since spacing and radius need documenting as much as colour.

## Phase G — Slicing with the accuracy gate

`/sprout-slice`, addressing frames by **nodeId**. Reads `figma_get_design_system_kit` + `get_design_context` + `get_screenshot`; reverse-maps hexes to semantic token names; resolves component instances through `component-map.json` to emit `<Card>` rather than `<View>`; emits `src/screens/<Area>/<Screen>.tsx` with StyleSheet, generated tokens, and real Phosphor paths.

**The gate, per `CONVENTIONS.md` §4:**
- **Structural accuracy — 100%, enforced.** Every colour, space, radius, font size and line height traces to a token. Zero literal hex, zero eyeballed numbers, zero hand-drawn icons. Machine-checkable, so there's no reason to accept less.
- **Visual accuracy — perceptual diff under a stated threshold.** Figma's text renderer and React Native's don't hint glyphs identically, so a diff never reads 0.00%. A literal pixel target would get waived the first time it failed. Uber's precedent: Base Web screens every component through visual regression on each commit — pixel-perfection is achieved by machinery, not discipline. `scripts/capture-visual-baseline.mjs --compare` (Phase B) is the seed of this; it's byte-exact today and needs a real perceptual threshold before it's the actual gate.

Order: **Onboarding (areas 1+3)** → **Registration (2+4+5+6)** → **Home (7+8)** → remaining areas. Each pass gets cheaper as the component library accumulates.

Storybook stays retired as a hand-maintained catalog; it's reused only as a **headless render target** with throwaway generated stories.

## Phase H — Living-product machinery

Woven into G, not bolted on after — without it, slicing 300 screens produces 300 artifacts nobody can tell are stale.

- **Provenance ledger** — every sliced screen records the Figma nodeId *and* the Figma version it came from.
- **Staleness report** — compare each recorded version against current Figma; output "these N screens changed in Figma since they were sliced". This is what makes a redesigned product tractable.
- **Visual regression per commit** — the Uber pattern. `scripts/capture-visual-baseline.mjs` (Phase B) is the mechanism; wiring it into the CI workflow that already runs `tokens:check` is the remaining step.

---

## Verification

| Phase | Check | Status |
|---|---|---|
| A | `/learn` writes to the Sprout memory path, not ABG. Both CLAUDE.md files load in their directories. No memory file still claims `tokens.css` is authoritative or lists a wrong line-height. | ✅ |
| B | `tokens:build` emits `tokens.css` + the skill mirror (legacy vocabulary) and `tokens.generated.css` (new vocabulary, contains `--color-text-subtle`); `.p1` is line-height 27.2 in both `tokens.css` copies. `grep -r "12.5px\|a:0.14"` across the skill returns only my own explanatory comments. The two named production bypasses (`Input.tsx`/`TextArea.tsx`) are fixed; unflagged `.stories.tsx` demo hardcodes and doc-comments are untouched by design (Phase E's job). | ✅ |
| C | Zero `Rectangle N`/`Frame N`/integer names in the flow's scope; no duplicate frame names in scope. | — |
| D | `figma_lint_design` on scoped frames: zero hardcoded colours, zero detached components. Every ≥3× pattern is an instance, not a copy. `figma_diff_versions` vs baseline shows only intended change. | — |
| E | `figma_check_design_parity` passes for all Core 14; `colors` import count falls as `semanticColors` rises; `component-map.json` resolves every Core 14 nodeId. | — |
| F | Every Core 14 component has all 8 template sections; docs regenerate from a clean checkout with no hand edits. | — |
| G | Structural gate passes; perceptual diff under threshold; Ahmad confirms in Chrome before it's called done. | — |
| H | Staleness report correctly flags a screen after a deliberate Figma edit. | — |

## Deferred

- **Light/Dark modes** — structured for later (mode named, codegen mode-aware), not built. The ~231 duplicate "Light Mode" frames stay; collapsing them into a real variable mode is the follow-up that pays for itself.
- **The ~125 HTML prototypes** — 102 contained stale values and each inlines its own `:root`, so none picked up the Phase B token fix automatically. Migrating them to link generated `tokens.css` is its own cleanup.
- **`Design Tokens.json`** (root) — pre-rename dump, superseded; archive.
- **npm package handoff** — kept possible by the architecture, not done.
- **Code Connect publish** — blocked by plan tier.

## Note on scope

The **component** layer genuinely needed a rebuild. The **token** layer did not — its three-tier architecture in Figma was already ~80% aligned with Atlassian and needed automation plus a rename, not redesign. Saying so keeps the project honest about where the remaining cost actually is: Phases C and D, in Figma, on ~333 frames.
