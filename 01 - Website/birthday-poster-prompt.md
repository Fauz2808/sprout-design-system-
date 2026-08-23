# Birthday Poster — AI Image Prompt

Reference for the **luxury editorial birthday cover** style (the premium "AI style" covers in the Sprout birthday flow — giant 3D number + child portrait + florals/balloons).

## Reference image
A young girl (age 6) sitting inside a giant 3D number **"6"** cutout, surrounded by pastel flowers (blush roses, hydrangea) and matte cream/gold balloons, warm beige backdrop, soft sunlight. Header in gold script: **"HAPPY Birthday TO YOU"**. Footer: **"SIX & FABULOUS · LET THE ADVENTURE BEGIN"**.

## Base prompt (v1 — text baked in by AI)
> Luxury birthday portrait poster design featuring a young child sitting inside a giant three-dimensional number "6" cutout frame, surrounded by elegant pastel flowers and matte balloons. Warm beige background, soft natural sunlight, premium editorial photography, fine art portrait, realistic skin texture, high-end birthday photoshoot, sophisticated composition, subtle shadows, minimal luxury aesthetic, photobook cover design, shallow depth of field, professional studio lighting, ultra detailed, 8k quality.

## ⭐ Refined prompt (v2 — TEXT-FREE, scene only)
**Why:** AI-rendered text is inconsistent across covers (kerning/fonts drift, misspellings, can't localize). Generate the *scene only*, then add the typography as a clean overlay layer (see `birthday-poster-overlay.html`). Leave empty space top & bottom for that text.

> Luxury fine-art birthday portrait poster. A [AGE]-year-old [girl/boy] seated inside a giant three-dimensional number "[N]" sculpture that doubles as a cozy nook, surrounded by elegant [PALETTE] flowers (roses, hydrangea, lilac) and matte [PALETTE] balloons. Warm beige studio backdrop, soft directional sunlight with gentle leaf shadows. Editorial photobook-cover composition with **generous clean negative space at the top and bottom for text**, child sharply in focus with realistic skin texture, shallow depth of field, premium studio lighting, refined minimal luxury aesthetic, sophisticated warm color grading, ultra detailed, 8k.

**Negative / avoid:** `no text, no letters, no words, no captions, no numbers-as-text, no watermark, no logo; natural hands and correct proportions, no extra fingers, no distorted face.`

**Consistency tips:** keep the same backdrop + lighting line across every age; only change the number, child, palette & theme. Aspect ratio **2:3 (portrait)**.

## Variations to explore (fill in / iterate)
- **Number** — swap "6" for the child's actual age
- **Palette** — blush/gold (current) · sage & cream · dusty blue · terracotta · lavender
- **Theme** — floral (current) · woodland · celestial/stars · safari · ballet
- **Gender-neutral / boy** versions
- **Copy** — "HAPPY Birthday TO YOU" + a tagline (e.g. "SIX & FABULOUS")

## Status
- Ahmad generating variations in ChatGPT.
- **Next:** Ahmad to share his Figma version → then iterate on variations together.
