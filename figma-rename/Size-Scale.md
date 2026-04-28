# Size Scale

One shared `xs / sm / md / lg / xl` scale used across Avatar, IconButton, Button, and Chip. Every value here is already present in the current Figma file — so adopting the scale is a rename + variant-prop exercise, not a redesign.

## The scale

| Token | Pixels | Spacing (gap) | Corner radius | Font (label) |
|---|---|---|---|---|
| `size / xs` | 20 | 4 | full | 11 / 14 |
| `size / sm` | 32 | 6 | full | 12 / 16 |
| `size / md` | 40 | 8 | full | 14 / 20 |
| `size / lg` | 52 | 10 | full | 16 / 24 |
| `size / xl` | 64 | 12 | full | 18 / 26 |

`full` corner radius = perfectly round (`height / 2`). Use for pills and circular icons.

## Per-component mapping

### Avatar
Sizes observed: **40**, **42**, **52**, **64**. Standardize on the scale:

| Variant | Pixels | Notes |
|---|---|---|
| `Avatar / xs` | 20 | Reaction stack, dense metadata |
| `Avatar / sm` | 32 | Inline in text, chat threads |
| `Avatar / md` | 40 | Default in member lists and chat rows (use instead of 42 — too close to 40 to keep both) |
| `Avatar / lg` | 52 | Memories comments, Club search results |
| `Avatar / xl` | 64 | Onboarding profile upload, dialog centerpiece |

Recommendation: deprecate the 42×42 instances and move them to 40×40. 42 is not worth a dedicated token.

### IconButton
Sizes observed: **32**, **34**, **40**. Standardize:

| Variant | Box | Icon inside | Notes |
|---|---|---|---|
| `IconButton / sm` | 32×32 | 20×20 | Dense (top-right menu, chat actions) |
| `IconButton / md` | 40×40 | 24×24 | Default (header actions, search trigger) |

Recommendation: deprecate the 34×34 mic instance and move to 32×32 — it will match every other inline icon action.

### Button
Heights observed on primary buttons: **27**, **52**. Standardize:

| Variant | Height | Padding x | Typical use |
|---|---|---|---|
| `Button / sm` | 28 | 12 | Inline "Allow" in permission rows, small pills |
| `Button / md` | 40 | 16 | Secondary actions |
| `Button / lg` | 52 | 20 | Primary CTA, Bottom CTA |

Recommendation: keep the current 52-high primary CTA; promote 27-high to 28-high for token alignment.

### Chip
Heights observed: **19**, **28**, **32**. Standardize:

| Variant | Height | Padding x | Typical use |
|---|---|---|---|
| `Chip / xs` | 20 | 6 | Reply count, inline count |
| `Chip / md` | 28 | 10 | Filter chips, tag chips |
| `Chip / club` | 32 | 12 | Club badge (promote to standard `lg` if you want three tiers) |

Recommendation: rationalize to two tiers (`xs` and `md`) and demote `Chip / club` to a `variant: 'club'` on `Chip / md`.

### Radius

| Token | Value | Use |
|---|---|---|
| `radius / xs` | 4 | Chips (xs), small pills |
| `radius / sm` | 8 | Inputs, small cards |
| `radius / md` | 12 | Buttons, cards |
| `radius / lg` | 16 | Sheets, dialogs |
| `radius / full` | 9999 | Avatars, IconButtons, circular elements |

### Spacing

| Token | Value | Use |
|---|---|---|
| `space / 2xs` | 2 | Badge inner padding |
| `space / xs` | 4 | Between icon and label inline |
| `space / sm` | 8 | Between stacked siblings in a row |
| `space / md` | 12 | Between sections inside a card |
| `space / lg` | 16 | Screen horizontal gutter, between form fields |
| `space / xl` | 24 | Between major sections on a page |
| `space / 2xl` | 32 | Bottom safe-area, between pages of content |

Recommendation: the screen gutter in Sprout is already 16 (393 − 361 = 32, so 16 on each side). Adopt that as the canonical `space / lg` and use it as the page margin everywhere.

---

## Implementation path in Figma

1. **Create a Primitives variable collection** (Figma → Variables panel → New collection).
   - Add one variable per token above (`size / sm`, `radius / md`, `space / lg`, etc.).
2. **Create a Semantic collection** that references Primitives (e.g. `avatar.size.md → size / md`).
3. **Bind variables** to each component:
   - Avatar: width / height / corner radius from `avatar.size.*` and `radius.full`.
   - IconButton: same pattern.
   - Button: height from `button.size.*`, padding from `space.*`, radius from `radius.md`.
   - Chip: same.
4. **Create variant sets** using the same property names the rename map uses (`size: xs / sm / md / lg / xl`).
5. **Swap raw sizes for variables** on existing instances — Figma highlights unbound values in the Inspect panel so you can catch anything missed.

The `cc-figma-tokens` and `cc-figma-component` skills can generate these collections programmatically once the write MCP is available — until then this doc is the source of truth.
