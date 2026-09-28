# Sprout Thinking Orb · FE handover

This folder is the complete, dependency-free handover for Sprout's animated AI Blob.

## Files

- `thinking-orb.js` — production adapter exposed as `window.SproutThinkingOrb`.
- `index.html` — interactive preview for all supported states.
- `preview.gif` — GitHub-safe visual preview generated from the HTML demo.
- `vendor/THINKING-ORBS-LICENSE` — required upstream MIT notice.

## Quick integration

```html
<canvas class="sprout-thinking-orb" aria-hidden="true"></canvas>
<script src="/path/to/thinking-orb.js"></script>
<script>
  const canvas = document.querySelector(".sprout-thinking-orb");
  const orb = window.SproutThinkingOrb.create(canvas, {
    state: "working",
    theme: "light",
    speed: 1,
  });

  orb.play();
  orb.setState("listening");
  orb.pause();
</script>
```

The canvas is authored at the upstream 64 px preset. Size it with CSS:

```css
.sprout-thinking-orb {
  width: 64px;
  height: 64px;
  display: block;
}
```

## API

### `SproutThinkingOrb.create(canvas, config)`

Config:

- `state`: `"working"`, `"listening"`, or `"composing"`.
- `theme`: `"light"` by default; `"dark"` reverses the depth ramp for dark surfaces.
- `speed`: optional numeric multiplier. Default: `1`.

Returns:

- `play()` — start animation.
- `pause()` — stop animation without clearing the current frame.
- `setState(state)` — switch geometry without rebuilding the canvas.
- `draw()` — render one frame manually.

Aliases kept for the current prototype:

- `listeningActive` → `listening`
- `listeningQuiet` → `listening`
- `processing` → `composing`

## Runtime behavior

- Caps device pixel ratio at `2`.
- Pauses automatically outside the viewport and while the browser tab is hidden.
- Renders a stable still frame when `prefers-reduced-motion: reduce` is active.
- Adds `role="img"` and an accessible label matching the active state.
- Uses no microphone, audio, network request, package runtime, or framework dependency.

## Brand mapping

The upstream grayscale depth ramp maps to:

| Depth | Sprout token | Hex |
| --- | --- | --- |
| Near | Brand/700 | `#1E3E2B` |
| Mid-near | Brand/500 | `#186338` |
| Mid-far | Brand/300 | `#579A74` |
| Far | Brand/50 | `#E2E9E3` |

## Source and license

Adapted from [RareFormLabs/thinking-orbs v0.1.1](https://github.com/RareFormLabs/thinking-orbs). Upstream copyright © 2026 Jakub Antalik. MIT license included in `vendor/THINKING-ORBS-LICENSE`.

