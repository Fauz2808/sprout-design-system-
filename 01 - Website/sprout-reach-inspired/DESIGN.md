# Sprout Reach-inspired direction

Updated: 2026-09-21

## Design read

Sprout connects parents with their family's people and plans. This separate variation takes Reach's photographic storytelling and product-led section rhythm, adapted to Sprout's green identity and supplied app screens.

- ENERGY 3: a clear headline, natural family photography, and three readable product previews.
- RHYTHM 3: split hero, compact process sequence, interactive product stage, community scene, privacy details, and closing download panel.
- MOTION 2: one-time entrances, short interruptible tab transitions, and restrained desktop scroll parallax.

## Visual decisions

- Pale sage behind hero copy provides stable readability without a photo overlay or gradient.
- Natural photography occupies its own area so it does not compete with the headline.
- Sprout green identifies download actions and selected features.
- Hanken Grotesk supports the compact, friendly typography; heading size scales down on small screens.
- Three upright product previews use separate horizontal positions and preserve their original aspect ratio.
- The family-loop sequence connects daily organization, nearby plans, and conversations through content order rather than extra decorative labels.
- Community cards use normal grid flow to prevent accidental overlap.
- Rounded section corners and phone frames establish hierarchy; ordinary text rows stay flat.
- The small loop photograph uses the existing 1536 x 1024 source instead of a 133 x 147 thumbnail.

## Interaction decisions

Feature selection updates the screen, copy, label, and ARIA state together. A new selection cancels the previous transition. Animations use opacity and transforms; content remains visible when animation is unavailable. Desktop parallax uses CSS scroll timelines where supported and falls back to a static layout. Reduced motion disables nonessential motion, including transitions already running.

## Content boundaries

Existing Sprout copy, links, and supplied product imagery are retained. No testimonials, metrics, or certifications are invented. The Daily Brief and Events source screens remain 393 x 852; changing CSS does not create additional image detail.
