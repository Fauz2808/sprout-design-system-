# QA report

Tested on 14 September 2026 using the local server at `http://127.0.0.1:8789/`.

## Passed checks

- Desktop visual review at 1280px across hero, week, Daily Brief, community, chat, memories, family profile, trust, and download.
- Mobile visual review at 390px across hero, week, Daily Brief, community, and family profile.
- Page width matched the viewport at 1280px and 390px. The school directory has intentional contained horizontal scrolling on mobile.
- Mobile menu opens, moves focus to its first link, makes main/footer inert, closes with Escape, and returns focus to the menu button.
- Schedule tabs update their content. ArrowRight and Home were exercised successfully; Left, Right, Home, and End use the same roving `tabindex` handler.
- One-tap preview changes its button, title, visible style, and live status. The state can be reset.
- Disclosure content opens with a native `details` element.
- Browser console returned no warnings or errors.
- App store badges were converted from oversized raster-backed SVGs to 2x PNGs, reducing their combined transfer size from about 1.3 MB to about 60 KB.
- JavaScript passed `node --check`.
- Static HTML audit found one `h1`, no duplicate IDs, no broken local hash links, no missing local assets, and no images without an `alt` attribute.
- Computed desktop geometry found no section overlap from hero through download.
- Copy scan found no em dash and none of the anti-slop filler terms checked.
- Reduced-motion rules remove reveal and transition motion.

## Contrast samples

| Foreground | Background | Ratio | WCAG normal text |
|---|---|---:|---|
| `#173427` | `#f6efdf` | 11.77:1 | Pass |
| `#fffdf8` | `#173d2b` | 11.88:1 | Pass |
| `#173427` | `#efc85d` | 8.41:1 | Pass |
| `#173427` | `#b8dbe2` | 9.16:1 | Pass |
| `#173427` | `#9cdda5` | 8.54:1 | Pass |
| `#5c695f` | `#f6efdf` | 5.03:1 | Pass |
| `#a83222` | `#f6efdf` | 5.83:1 | Pass |

Ratios were calculated with the checker supplied by the installed anti-slop human skill.

## Limits

- This is a prototype review, not a full WCAG 2.2 audit with assistive technology.
- External legal pages, store listings, and mail links were not activated during QA.
- Google Fonts can fall back when the network is unavailable.
- Product behavior and moderation claims were not verified against a live account or backend.
- The supplied Figma node was not used as a pixel parity target for this new visual direction.
