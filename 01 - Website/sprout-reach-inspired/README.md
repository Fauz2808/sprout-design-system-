# Sprout: Family Loop Concept

This is a standalone Sprout landing-page variation inspired by Reach's cinematic composition, floating product interfaces, and guided content rhythm. It does not modify the existing `sprout-bevel-side-by-side` or `sprout-hand-interactive` versions.

## Run locally

```bash
python3 -m http.server 8793
```

Open `http://127.0.0.1:8793/`.

## Design choices

- The visual motif is a family loop that links Daily Brief, Events, Chat, and community moments.
- All product images and copy describe existing Sprout concepts.
- The feature tabs support pointer and keyboard input.
- The mobile navigation traps focus while open and closes with Escape.
- Motion is disabled when `prefers-reduced-motion` is active.

## Validation

```bash
node --test review/*.test.cjs
node --check script.js
```

The latest layout and interaction verification is recorded in `review/DELIVERY-GATE.md`.
