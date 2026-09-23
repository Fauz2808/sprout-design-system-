# Delivery gate

2026-09-21. PASS for the new local concept and checks listed below.

## Hard gate

- Content PASS: existing Sprout product concepts and supplied UI assets; no invented testimonials, metrics, pricing, certifications, or people presented as customers.
- Asset integrity PASS: local asset test passes; browser inspection found no completed images with zero natural width. Screens retain their native aspect ratio.
- Navigation PASS: all internal anchors and ARIA target IDs resolve uniquely in the source test. Store links retain the supplied App Store and Google Play destinations. Legal and contact links retain existing Sprout destinations.
- Layout PASS: measured document width equals viewport width at 320, 390, 1024, 1280, and 1440 pixels. Desktop hero, mobile hero, gallery, product stage, and community compositions were inspected in browser.
- Text contrast PASS for measured areas: solid text pairs range from 5.38:1 to 9.55:1. Pixel sampling of the original meadow beneath hero small-text rectangles measured minimum 5.57:1 at 1280 and 5.78:1 at 1440 after repositioning. At 390 the unfiltered image sampling measured 4.98:1 for the eyebrow and 5.82:1 for body copy. Large title contrast was sampled above 3:1. This is scoped verification, not a complete WCAG certification.
- Keyboard PASS: hero ArrowRight moves focus from Daily Brief to Events and changes the screen at the end of the tap choreography; visible focus styles exist. The moments accordion supports arrow keys, Home, and End. The mobile menu has Escape dismissal in source. The menu is a navigation disclosure, not a modal or focus trap.
- States PASS: this static marketing concept has no data fetch or form state. Exactly one family-moment card stays expanded; its trigger and panel ARIA state update together. Content remains visible without animation.
- Runtime PASS: JavaScript syntax check passes. Browser console returned no warnings or errors in tested interactions.

## Purpose gate

- Hero PASS: an existing landscape photo supplies atmosphere without CSS gradients. Dark text sits in the sky area; secondary CTA has a solid surface for contrast. The phone-in-hand mockup replaces the two floating product cards and keeps one visual focus.
- Closing banner PASS: a separate generated landscape fills the section behind centered copy and store links. The optimized 1774 x 887 WebP loads at its native aspect ratio and does not reuse the hero image.
- Type PASS: lighter DM Sans reflects the reference's open, understated typography. Scale and whitespace establish hierarchy.
- Elevation PASS: shadows identify app objects and the floating navigation; ordinary sections remain flat.
- Cards PASS: the four panels express specific moments through a day, not generic feature icons. The real app visuals differ by feature.
- Motion PASS: entry reveals establish hierarchy, the pointing hand moves to the selected in-app navigation point, the screen commits at contact, moment imagery enters as its card expands, and sticky storytelling ties product screens to adjacent copy. No looping decorative motion or scroll hijacking.

## Liveliness

- Dials PASS: ENERGY 3 / RHYTHM 3 / MOTION 2, recorded before implementation in DESIGN.md.
- Rhythm PASS: immersive scene, horizontal accordion, sticky product narrative, two-column community photograph, and arch-shaped closing scene use different compositions.
- Identity PASS: green landscape, supplied clover logo, family content, and actual Sprout interfaces establish the product identity.
- Focal hierarchy PASS: hero headline and one mom-hand phone mockup; birthday invitation and to-do floating cards are absent from the hero; each product chapter has one screen; community centers on real family imagery.

## Craft and verification

- Hero tabs PASS: clicked Events and Chat on desktop and mobile; pointing-hand motion targets the corresponding phone navigation position and the screen source agrees with the selected tab after contact. Rapid Events-to-Chat input leaves Chat selected with no stale timer or busy state. Keyboard ArrowRight focuses Events from Daily Brief and loads the Events screen.
- Moments accordion PASS: the first card is the sole expanded default. Selecting the second card collapses the first and reveals the Events image; ArrowRight moves focus and expansion to the third card. At 390 pixels the same cards stack vertically, expand on tap or when their heading enters the center viewport band, and produce no horizontal overflow.
- Product selector PASS: Events and Chat switched the corresponding screen source and scene label. On mobile Events showed only the Events chapter; Chat and Daily Brief were also selected.
- Navigation PASS: Family life, The app, Community, Download app, and home links were exercised. Mobile menu opened, a feature link navigated and closed the menu.
- Reduced motion PASS: script tests verify no animation starts with reduced motion, existing animations cancel when preference changes, and a newer transition cancels its predecessor.
- Source tests PASS: assets, unique anchor/ARIA relationships, supplied store destinations, and core text colors.
- Mobile hand scene PASS: at 390 x 844 the hand, phone, and tabs remain inside the document width; measured overflow is 0 pixels. Chat selection loads the latest Chat export and clears the busy state.
- Validation result: 10 tests passed; script syntax check passed.

Limits: native-device frame timing and all browser engines were not profiled. Source UI exports limit the available detail; no synthetic upscaling is claimed. The mailto link was inspected, not used to send a message. No changes were deployed or committed.
