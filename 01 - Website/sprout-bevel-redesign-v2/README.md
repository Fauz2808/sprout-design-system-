# Sprout Bevel direction V2

This folder contains the new Sprout redesign based directly on the visual principles observed on [Bevel](https://www.bevel.health/). The earlier Bevel interpretation and Neighborhood Noticeboard direction remain unchanged in their own folders.

## Preview

From this directory, run:

```sh
python3 -m http.server 8790 --bind 127.0.0.1
```

Then open [http://127.0.0.1:8790/](http://127.0.0.1:8790/). There is no build step or package installation.

## Files

- `index.html`: semantic structure, English product copy, local product imagery, store links, and legal links.
- `styles.css`: Bevel-led visual system, responsive composition, interaction states, and reduced-motion support.
- `script.js`: accessible mobile navigation, family-day tabs, profile preview, and entry motion.
- `DESIGN.md`: visual reasoning and implementation handoff.
- `CONTENT-CHANGES.md`: content sources, new editorial lines, and decisions required before production.
- `QA.md`: checks completed for this prototype.
- `assets/PROVENANCE.md`: origin of the imagery.

## Scope

This is a local HTML prototype. It does not change the live Sprout website, the Figma file, or either previous redesign option. The profile interaction is a local preview and sends no data.

Instrument Sans is loaded from Google Fonts. The page falls back to system sans-serif fonts when the font request is unavailable.
