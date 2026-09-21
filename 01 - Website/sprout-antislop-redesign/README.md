# Sprout anti-slop redesign

This folder contains a separate responsive redesign of the Sprout landing page. The earlier Bevel-led option remains unchanged in `../sprout-bevel-redesign/`.

## Preview

From this directory, run:

```sh
python3 -m http.server 8789 --bind 127.0.0.1
```

Then open [http://127.0.0.1:8789/](http://127.0.0.1:8789/). There is no build step and no package installation.

## Files

- `index.html`: semantic page structure, final English copy, product imagery, app store links, and legal links.
- `styles.css`: visual tokens, responsive layout, focus states, and motion preferences.
- `script.js`: mobile navigation, accessible schedule tabs, one-tap preview, and reveal motion.
- `DESIGN.md`: direction, design system, interactions, and engineering handoff.
- `CONTENT-CHANGES.md`: source mapping, copy improvisations, and production decisions that still need an owner.
- `QA.md`: completed checks and their limits.
- `assets/PROVENANCE.md`: source of every image in the prototype.
- `visual-direction-shortlist.md`: the three directions reviewed before this option was built.

## Scope

This is a local HTML prototype. It does not modify the live React/Vite website, the supplied Figma file, or the earlier redesign. The one-tap control is a reversible local demonstration. It collects and sends no information.

The intended typography uses Google Fonts and needs an internet connection. Local fallbacks are included. All product images are local.
