# Sprout / Room for family life

A separate Reach-inspired option. The earlier versions are untouched.

Run from this folder:

```sh
python3 -m http.server 8794
```

Preview: http://127.0.0.1:8794/

The design uses a photographic meadow hero, an interactive mom-hand phone mockup, selectable app screens, a horizontal family-moments accordion, and a sticky product narrative. The moments accordion keeps one card expanded and opens cards on hover, focus, or click. In the stacked mobile layout, the card whose heading enters the center band of the viewport expands automatically while scrolling. Selecting Daily Brief, Events, or Chat moves a second hand to the matching in-app navigation point and changes the screen at contact. On mobile the narrative uses explicit feature links instead of scroll-driven selection. CSS scroll-timeline parallax is progressive enhancement; unsupported browsers keep the static scene. Reduced-motion preferences cancel active animations.

The editorial headings are new; product capabilities, UI exports, store destinations, and family imagery come from the existing Sprout work. The closing landscape is a project-specific generated asset with a different composition from the hero meadow. No invented metrics or testimonials are included. This is a local concept, not a deployed release.

Validation:

```sh
node --test review/*.test.cjs
node --check script.js
```

See DESIGN.md for visual decisions and review/DELIVERY-GATE.md for verification evidence.
