# Sprout Figma Rename Kit

Everything you need to apply **906 canonical renames** to the Sprout Figma file in one undoable pass, plus the design-system decisions that the renames encode.

## What's in this folder

| File | Purpose |
|---|---|
| `manifest.json` | Figma plugin manifest — points to `code.js` and `ui.html` |
| `code.js` | Plugin backend — resolves node IDs, applies renames |
| `ui.html` | Plugin UI — paste JSON, click Preview, click Apply |
| `rename-map.json` | The payload you paste into the plugin (906 entries) |
| `rename-map.csv` | Same data in spreadsheet form — for review before applying |
| `rename-map-audit.json` | Full audit trail (old name, new name, size, screen, rule) |
| `Canonical-Families.md` | The 10 component families and how old names fold into them |
| `Size-Scale.md` | Shared `xs / sm / md / lg / xl` scale and token plan |

## Workflow overview

1. Review `rename-map.csv` in Excel / Numbers / Google Sheets. Filter by `rule` column, spot-check a few rows per rule.
2. Install the plugin in Figma Desktop.
3. Run the plugin against the Sprout file. Preview → Apply.
4. Everything applies in a single undoable action (Cmd/Ctrl+Z reverts all 906 at once).
5. Adopt the size scale from `Size-Scale.md` as a follow-up pass (variables + variant sets).

## Install the plugin (one-time, ~2 min)

The plugin is unpublished — you import the manifest as a local development plugin.

1. Open **Figma Desktop** (plugin import is not available in the browser).
2. Open any file (the Sprout file is fine).
3. Menu: **Plugins → Development → Import plugin from manifest…**
4. In the file picker, select `manifest.json` from this folder.
5. The plugin **Sprout Batch Renamer** is now installed under Plugins → Development.

If you don't see the Development submenu, enable it under **Figma → Preferences → Allow plugin development**.

## Run the plugin

1. Open the Sprout file (`Sprout Design (Prod)`).
2. Menu: **Plugins → Development → Sprout Batch Renamer**.
3. A panel opens on the right.
4. Open `rename-map.json` in any text editor, **select all, copy**, and **paste** it into the textarea.
5. Click **Preview**. You should see:
   - ~906 will rename (first run)
   - 0 already correct
   - 0 missing (if missing > 0, see troubleshooting below)
6. Click **Apply**. Confirm the dialog.
7. Done. The Figma notification shows `Renamed N layers`.

## Verify the rename

- Open the **Layers panel** and spot-check a few screens:
  - `Members of Club` → rows should now show `Avatar / md` (42×42) and `Avatar / lg` (52×52), not `Profile Picture`.
  - Chat screen → circular buttons should show `IconButton / sm` (32) and `IconButton / md` (40), not `Button` or `Search bar`.
  - Any screen with a name + timestamp → should show `UserMeta / time` instead of `Name and Time`.
- Open the **Assets panel** — component instances keep their connection; only layer names change. No instance detachments.

If anything looks wrong, **Cmd/Ctrl+Z** in the Figma canvas reverts the entire batch.

## Troubleshooting

**"N missing" in the preview:**
- Node IDs are per-file. If this map was generated against a different branch or fork, IDs won't resolve. Use the file at the URL `https://www.figma.com/design/EhpRiGZ5eJnBb132X9zewg/Sprout-Design--Prod-` — that's the one the map was built from.
- Missing entries are skipped silently on Apply; they won't block the rest.

**"Already correct" count is high after the first run:**
- Expected if you re-run the plugin. Anything already at its target name is left alone.

**Plugin won't load / manifest error:**
- Confirm `code.js`, `ui.html`, and `manifest.json` are all in the same folder and unchanged.
- Figma will report the specific error in the bottom-left; fix the referenced field and re-import.

**Apply hangs or seems slow:**
- 906 renames typically take 5–15 seconds. The UI shows the result when done. Don't click Apply twice.

## What the rename map actually does

Rolled up by rule (matches `rename-map.csv` → `rule` column):

| Rule | Count | Effect |
|---|---:|---|
| `name-and-*` → `UserMeta / *` | 296 | Collapses three name-variants into one family |
| `chips` → `Chip / md` or `/ xs` | 115 | Standardizes chip family |
| `layout` → `SectionHeader / EmptyState / ListRow / NotificationRow / SettingsRow` | 109 | Groups content layout primitives |
| `profile-picture` / `avatar-container` → `Avatar / sm\|md\|lg\|xl` | 103 | Single Avatar family with size variants |
| `icon-buttons` → `IconButton / sm\|md\|mic\|profile` | 84 | Single IconButton family |
| `header` → `Header / with-indicator` or `/ bar` | 82 | Nested header components named |
| `bottom-button` → `Bottom CTA / default\|expanded` | 75 | Bottom CTA family |
| `button-frames` → `IconButton / icon` or `Form Action Group` | 21 | Cleans up ambiguously-named button frames |
| `sheet-dialog` → `Sheet` or `Dialog` | 13 | Splits pop-up from dialogue box |
| `search-compose` → `SearchField / full` or `ChatComposer` | 8 | Distinguishes search from chat input |
| **Total** | **906** | |

## After the rename — next steps

Renaming layers is the prep pass. The second pass is turning these into real Figma components with variant sets and tokens:

1. Adopt the size scale (`Size-Scale.md`) by creating a **Primitives** variable collection in Figma.
2. Create a **Semantic** collection that references Primitives (e.g. `avatar.size.md → size / md`).
3. Convert the top families into component sets:
   - Avatar → single component, `size = sm | md | lg | xl`, `badge = none | online | camera | plus | count`
   - IconButton → single component, `size = sm | md`, `icon = slot`, `state = default | pressed | disabled`
   - Chip → single component, `size = xs | md`, `variant = filter | count | tag | club`, `selected`, `removable`
4. Bind width / height / corner radius / padding to variables instead of raw numbers.
5. Run a final pass to replace old instances with the new canonical components.

The `cc-figma-tokens` and `cc-figma-component` skills can do step 1–4 programmatically once a Figma write MCP is available. Until then the plugin in this folder is the closest thing.

## Safety

- Plugin has `networkAccess: "none"` — it doesn't call out to the internet.
- Only side effect is setting `node.name` on the listed IDs. No geometry / hierarchy / instance relationships are touched.
- Everything is captured in one undoable action (Cmd/Ctrl+Z reverts all 906).
- If you want an even safer workflow: **Duplicate the Sprout file first** (File → Duplicate), run the plugin on the copy, diff in Figma's version history, then apply to the live file.
