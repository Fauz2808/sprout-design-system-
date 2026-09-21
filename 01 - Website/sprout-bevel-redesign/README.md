# Sprout redesign preview

A responsive HTML design prototype inspired by Bevel's visual pacing and adapted to Sprout's parent-and-kids context. It includes a feature explorer, Daily Brief disclosures, a mobile menu, and a reversible one-tap registration demonstration.

## Preview

From this directory, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open [the local preview](http://127.0.0.1:4173/) in Chrome. Use another port if 4173 is already occupied. There is no dependency installation or build step.

## Files

- `index.html`: page structure, English copy, image references, store and legal links.
- `styles.css`: visual tokens, layout, responsive rules, and interaction states.
- `script.js`: mobile navigation, accessible feature tabs, disclosures, and the local registration demo.
- [DESIGN.md](./DESIGN.md): visual system and implementation handoff.
- [CONTENT-CHANGES.md](./CONTENT-CHANGES.md): content sources, copy edits, and proposed improvisations.
- [assets/PROVENANCE.md](./assets/PROVENANCE.md): image origins, including the existing AI-generated family photograph.
- `review/`: review material and evidence as it becomes available.

## Scope and current limitations

This is the HTML design exploration and handoff layer. The live Sprout website is a separate React/Vite application. No production deployment or Figma edits are part of this preview. Original Sprout files and incumbent landing assets are preserved.

The current Figma read timed out, so this preview does not claim parity with the supplied Figma node or the latest product UI. It uses available Sprout assets and live-site content evidence, with provenance recorded separately.

Google Fonts remains external by choice after the self-hosted download was canceled. An internet connection is needed for the intended font appearance; the page has fallback fonts. Product images are local. Store badges, legal links, and the contact link open external destinations or the visitor's mail application.

The registration interaction is explicitly a preview. It sends no registration, stores no family profile, and has no backend. Hidden feature panels require JavaScript to switch.

Independent finish review disposition: **SHIP the local review preview**. Desktop/mobile screenshots and the mobile menu correction passed the scoped review. See [QA.md](./QA.md) for browser checks, screenshot coverage, sampled contrast, and explicit audit limits. This is not a complete accessibility, performance, or Figma fidelity audit. Confirm the documented production copy decisions in [CONTENT-CHANGES.md](./CONTENT-CHANGES.md) before engineering adoption.
