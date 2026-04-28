# Canonical Component Families

How the messy names in the current file fold into a clean family tree. This is the rationale behind the rename map.

---

## 1. Avatar family

One component, size variants. The file currently uses three different names for the same concept.

| New name | Old name(s) | Size | Where it's used |
|---|---|---|---|
| `Avatar / sm` | `Avatar Container` | 40×40 | Chat, inline member rows |
| `Avatar / md` | `Profile Picture` | 42×42 | Club member lists |
| `Avatar / lg` | `Profile Picture` | 52×52 | Memories comments, clubs search |
| `Avatar / xl` | `Avatar Container` | 64×64 | Onboarding profile upload |
| `Avatar / with-badge` | `Indicator and Badge` | 55–70×39–43 | Clubs live-status ring |

**Recommended Figma variant set:**
- Property: `size` — `sm / md / lg / xl`
- Property: `badge` — `none / online / camera / plus / count`

---

## 2. IconButton family

The circular/square icon-only button. Currently sprayed under many names.

| New name | Old name(s) | Size | Icon it carries |
|---|---|---|---|
| `IconButton / profile` | `Profile and Hamburger Menu` | 32×32 | avatar / hamburger |
| `IconButton / search` | `Search bar` | 40×40 | search glyph |
| `IconButton / mic` | `Mic` | 34×34 | microphone |
| `IconButton / icon` | `Button` (32×32 frames) | 32×32 | various |

**Recommended variant set:**
- Property: `size` — `sm (32) / md (40)`
- Property: `icon` — slot (swap the inner icon instance)
- Property: `state` — `default / pressed / disabled`

---

## 3. Chip family

Short, pill-shaped labels with optional icon or count. Two physical sizes exist today.

| New name | Old name(s) | Size | Use |
|---|---|---|---|
| `Chip / md` | `Chips` | ~185×28 | Filter chip |
| `Chip / xs` | `Chips` (short) | 38–40×19 | Inline count / reply count |
| `Chip / club` | `Social Club` | 116×32 | Club tag in Memories |

**Recommended variant set:**
- Property: `size` — `xs / md`
- Property: `variant` — `filter / count / tag / club`
- Property: `selected` — `true / false`
- Property: `removable` — `true / false`

---

## 4. UserMeta family

Two-line text composition of name + secondary info. The file stores it under three near-identical names.

| New name | Old name | What the second line shows |
|---|---|---|
| `UserMeta / title` | `Name and Title` | Role / relationship |
| `UserMeta / time` | `Name and Time` | Timestamp |
| `UserMeta / tag` | `Name and Tag` | Club / category tag |

**Recommended variant set:**
- Property: `secondaryType` — `title / time / tag`
- Property: `weight` — `regular / bold`
- Property: `align` — `left / center`

---

## 5. Header family

Top of screen. Two related frames today.

| New name | Old name | Size | What it is |
|---|---|---|---|
| `Header / with-indicator` | `Header` | 393×96 | Outer wrapper (status indicator + title bar) |
| `Header / bar` | `Header` (inner) | 393×56 | Title bar alone (back + title + action) |

The outer should be the primary component; the bar is an internal piece of it. Keeping both names makes nesting explicit.

**Recommended variant set (on `Header / bar`):**
- Property: `leftAction` — `back / close / none`
- Property: `rightAction` — slot (0–2 icon buttons)
- Property: `variant` — `default / transparent / dark`

---

## 6. Bottom CTA family

Fixed bottom CTA holder. One concept, two heights.

| New name | Old name | Size | Use |
|---|---|---|---|
| `Bottom CTA / default` | `Bottom Button` | 393×118 | Single CTA |
| `Bottom CTA / expanded` | `Bottom Button` (tall) | 393×375 | CTA + keyboard-safe space / secondary content |

**Recommended variant set:**
- Property: `size` — `default / expanded`
- Property: `buttons` — `1 / 2`
- Property: `variant` — `solid / elevated / transparent`

---

## 7. ListRow family

Tappable rows in lists. Multiple old names map to density variants of one component.

| New name | Old name | Size | Use |
|---|---|---|---|
| `ListRow / member` | `Member Row` | 393×98 | Members / comments |
| `ListRow / detailed` | `Table cell` | 361×72 | Park/Playground detail |
| `SettingsRow` | `List Menu` | 329×63 | Profile + Manage Club (icon + label + chevron) |

(`SettingsRow` stays separate because its structure is different — it's icon-first and has a chevron, not a multi-line metadata row.)

---

## 8. Sheet / Dialog family

Bottom sheet vs. centered confirmation. Keep them as two components.

| New name | Old name | Size | Use |
|---|---|---|---|
| `Sheet` | `Pop Up Modal` | 393×608 / 393×728 | Bottom sheet with drag handle |
| `Dialog` | `Dialogue Box` | 320–361 × 175–314 | Centered confirmation (leave club, remove member, etc.) |

---

## 9. Search vs Compose

Two distinct components even though they look similar.

| New name | Old name | Size | What's different |
|---|---|---|---|
| `SearchField / full` | `Search Container` | 393×36 | Search input with icon |
| `ChatComposer` | `Search and Compose` | 361×36 | Same input styling, but with trailing send/mic action in chat |

---

## 10. Section primitives

Text layout blocks that are currently named by content rather than role.

| New name | Old name | Use |
|---|---|---|
| `SectionHeader` | `Title and Desc` | Big title + description pair at top of forms/sections |
| `EmptyState` | `Empty State Content` | Illustration + title + body + CTA when a list is empty |
| `NotificationRow` | `Notification Block` | Single notification entry in Notifications list |

---

## Patterns left for manual review

These repeat enough to be flagged but need hands-on triage before renaming:

- **`Row`** (117 occurrences, huge size variance) — used generically across Create Event, AI Assist, etc. Walk screen-by-screen and give each distinct row a specific name.
- **`Comment`** (78 occurrences) — same layer name used for both a single comment and a container of comments. Split into `Comment` (single) and `CommentThread` (container).
- **`Button`** (frames, not instances) — most are already renamed by the script (32×32 → `IconButton / icon`; 361×147 → `Form Action Group`), but a handful of other sizes exist. Review what's left after the first pass.
- **`Switch`** — two very different sizes (52×52 and 120×120). The 120×120 is likely a different element entirely; split manually.
- **`Saas co`** — not a component; it's imported illustration metadata. Replace with design-system icons and delete the leftover frames.
- **`Mask group`** — auto-generated by Figma when you clip an image; ignore. Don't rename.

---

## Summary of the rename pass

| Family | Renames |
|---|---:|
| UserMeta | 296 |
| Chip | 115 |
| Section / EmptyState / ListRow / NotificationRow / SettingsRow | 109 |
| Avatar | 103 |
| IconButton | 84 |
| Header | 82 |
| Bottom CTA | 75 |
| Button frame cleanup → IconButton / Form Action Group | 21 |
| Sheet + Dialog | 13 |
| SearchField + ChatComposer | 8 |
| **Total** | **906** |
