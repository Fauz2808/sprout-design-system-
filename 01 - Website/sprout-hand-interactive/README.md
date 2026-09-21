# Sprout: hand interaction variation

An isolated copy of `sprout-bevel-side-by-side`, with an interactive hand-held phone in the hero. The source website, deployed Vercel project, and Figma frames are unchanged.

Preview: http://127.0.0.1:8792/

Run with `python3 -m http.server 8792 --bind 127.0.0.1` from this directory.

Select Daily Brief, Events, or Chat to preview Sprout's existing screens. The tapping hand approaches the visible control, presses, and retracts while the screen changes. Clicks are interruptible, and the last request wins. Keyboard arrows, Home, and End work. Reduced motion changes the screen without animating the hand.

All three updated screenshots share the same bottom navigation. The hand taps Daily Brief, Events, or Chat directly, with no intermediate screen.

## Files

- `hand-preview.css`: variation layout and device-screen alignment.
- `hand-preview.js`: feature selection and tap choreography.
- `assets/hand-mom-iphone-17-pro-max.png`: active silver iPhone 17 Pro Max mockup held by a smaller, slimmer mother's hand.
- `assets/hand-iphone-17-pro-max.png`: previous larger-hand variation, retained as an option.
- `assets/IPHONE-17-PROMPT.md`: generation prompt, method, and Apple device reference.
- `assets/daily-brief-updated.png`: supplied Daily Brief screenshot from Figma node `12397-208689`, used by the hero and download section.
- `assets/events-updated.png`: supplied Events screenshot from Figma node `12398-208962`.
- `assets/chat-updated.png`: supplied Chat screenshot from Figma node `12398-209125`.
- `assets/hand-mom-tap.png`: active matching mother's tap-hand layer.
- `assets/hand-tap.png`: previous larger tap-hand layer, retained as an option.
- `assets/HAND-ASSET-PROMPTS.json`: complete prompts and generation method.
- `review/interaction.test.cjs`: seven behavior tests. Run `node --test review/interaction.test.cjs`.

## Changes from the current design

The hero's floating cards are replaced by the held phone and three feature controls. New copy is limited to “Take a look inside” and the short feature captions. Existing Sprout imagery, screens, brand colors, CTA links, and remaining page sections are retained. The hands are AI-generated photo assets animated as separate 2D layers; this is a product presentation, not a live embedded app or a 3D hand rig.

Reference: https://x.com/PrajwalTomar_/status/2100230252182360313

## Verification

Browser checks at widths 320, 390, 768, 1024, and 1440 found no page-level horizontal overflow, no overlap between hero copy and phone screen, and no phone-screen overflow beyond the hero. Inspected desktop/mobile screenshots and the tap animation. Confirmed rapid feature switching and keyboard selection in the browser. Seven controller tests passed, including image errors, interrupted animations, and reduced-motion preference changes. The source hash manifest verifies that the original option was left intact.

## Viewport revision, September 17

The desktop hero now uses viewport height, with the headline locked to “Your family life,” / “connected.” The silver phone, Dynamic Island, full screen, CTA, and feature tabs fit in the first viewport. DOM bounds checked at 1024×768, 1280×720, 1366×768, 1440×810, 1440×900, and 1920×1080. Mobile keeps a readable stacked layout with scrolling. Desktop viewports below 672px high also allow scrolling instead of clipping the controls.

The latest Daily Brief asset is an unchanged copy of the user attachment, showing one completed task, carpool, and the day's timeline. Initial load and feature selection both use it. Seven interaction tests passed after the asset update. Source hashes confirm the original option is unchanged.

The Morning and After school panels in the family-day section reuse `daily-brief-updated.png` and `events-updated.png`. This keeps the secondary product walkthrough in sync with the hero previews.

The “Keep every conversation close” product card also reuses `chat-updated.png`, so every Chat preview now shows the same circles and direct-message interface.

Events and Chat also use unchanged user attachments. Tap targets follow the shared navigation at 13.7%, 34.9%, and 68.2% of screen width, at 91.4% of screen height. The active menu and displayed screen now commit together at fingertip contact, 230 ms after selection; a light pressed state provides immediate feedback while the hand approaches. The complete hand gesture is 640 ms and remains interruptible. Nine controller tests cover synchronization, corrected coordinates, rapid changes, image errors, keyboard use, and reduced motion.

## Scroll motion

`scroll-motion.js` and `scroll-motion.css` turn the family-day walkthrough into three full-width scenes. On desktop, the panel pins in the viewport while vertical scrolling moves Morning, After school, and Weekend horizontally. Each scene has a dwell range so its complete copy-and-phone composition remains visible before the next transition. Clicking or using the keyboard on a tab seeks its chapter. On mobile, the same scenes become a native horizontal swipe carousel with scroll snap and synchronized tabs. The hero hand, product phones, and memory background use small opposing translations for depth, with no phone rotation or scroll interception. The existing hero tap interaction remains independent.

Pinning and parallax run only above 900px wide and at least 680px high. Smaller viewports and reduced-motion preferences retain the ordinary layout and manual tabs. Preference changes are supported live. Updates use one queued animation frame per scroll event batch, with no perpetual render loop or added animation dependencies. `node --test review/scroll-motion.test.cjs` covers chapter boundaries, reverse scrolling, manual navigation, responsive fallback, and live reduced-motion changes.
