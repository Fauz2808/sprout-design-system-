# Sprout Component Generator

A tiny Figma plugin that scaffolds the first five components from `Component-Gaps.md`:

- **Avatar** — 5 sizes (xs 20 / sm 32 / md 40 / lg 52 / xl 64) as a single variant set
- **IconButton** — 2 sizes × 3 states (default / pressed / disabled) = 6 variants
- **Header / Standard** — 56h, back icon + centered title + right action
- **Header / User** — 75h, back icon + avatar + name/status + overflow menu
- **Header / Event Preview** — 91h, back + event thumbnail + title/date + Directions CTA

These are **scaffolds**, not polished components. Expect to:

1. Swap icon placeholders for real icon instances (Phosphor / your icon library).
2. Swap Avatar fill for an Image fill or nested Avatar instance.
3. Bind spacing / radius / colors to your variables from `Size-Scale.md` + your token library.
4. Split overloaded variants into separate sets if you prefer (e.g. break Header / Standard out by `leftSlot = back | close | none`).

The intention is to shortcut the annoying 20-minute "create component, name it, set auto-layout, add slots" ceremony so you can spend your time on the stuff that actually needs design judgment.

---

## Install (one time)

1. Open **Figma Desktop** → Menu → **Plugins → Development → Import plugin from manifest…**
2. Select `/figma-components/manifest.json`
3. The plugin `Sprout Component Generator` appears under `Plugins → Development`.

## Run

1. Open the Sprout file — ideally navigate to an **empty page** (create one called `Generated — Components` so they don't collide with existing work).
2. Run **Plugins → Development → Sprout Component Generator**.
3. Click the component you want, or `Generate all components` for everything.
4. The plugin scrolls/zooms to what it made. `Cmd/Ctrl+Z` undoes.

## What gets placed where

- All component sets are placed near the center of your current viewport, left-to-right with 80px gaps.
- If the row gets too wide it wraps to a new row. They don't overlap.
- Each is a proper `ComponentSet` (or `Component` for Header variants — one frame per style rather than one big set, because the three Header types have genuinely different heights).

## After generation — the real work

**Avatar**: rebind `width`/`height` of each variant to the matching token (e.g. `size/avatar-xs`, `size/avatar-sm`, etc). Set the fill to an Image fill, or replace the ellipse with an `Image` node or nested Avatar instance.

**IconButton**: swap the icon placeholder for an Icon component instance. Consider adding `icon` as an exposed instance swap property.

**Headers**: the left / right slots are intentionally frames (not instances) so you can swap for different content per screen. Turn them into instance-swap slots by:
1. Create one IconButton instance inside the slot
2. Right-click → `Create component` if needed
3. Expose the swap in the Header's component properties

## Files

| File | What |
|---|---|
| `manifest.json` | Figma plugin manifest (dynamic-page mode) |
| `code.js` | Plugin logic — creates nodes, variants, auto-layout |
| `ui.html` | Plugin UI — button per component |

## Safety

- Plugin makes a **single undoable action per click** — `Cmd/Ctrl+Z` rolls back.
- Never modifies existing layers. Only creates new ones.
- No network access (manifest declares `"allowedDomains": ["none"]`).

## If something goes wrong

- **"Missing text style" errors** — the plugin uses Inter Regular/Medium/Semi Bold. If your file doesn't have Inter loaded, open any Inter text once and re-run.
- **Components placed on top of old work** — undo, move to an empty page, re-run.
- **Nothing happens** — check the dev console (Plugins → Development → Show/Hide console) for the error. The plugin posts errors back into the UI panel as well.
