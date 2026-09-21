# Sprout redesign direction

## Direction

**Neighborhood Noticeboard** turns the landing page into a warm, useful view of family life around school, activities, and local plans. It combines Maggie's approachable community tone, Partiful's social energy, and Bevel's confidence in showing the product. None of their branding, copy, assets, or product claims are reused.

The design thesis is simple: Sprout should feel like the place where a family's week comes together, not a generic app feature catalog.

## Story order

1. Establish the emotional promise and show the real product immediately.
2. Let visitors explore a concrete example week.
3. Explain the Daily Brief as a practical morning benefit.
4. Connect school and grade directories to real parent relationships.
5. Show how an invite becomes a conversation and then a memory.
6. Demonstrate the saved family profile without pretending to submit a form.
7. Address trust before the final download decision.

This sequence makes the product feel connected. It avoids the old pattern of placing six equal feature cards under a hero.

## Visual system

| Token | Value | Purpose |
|---|---:|---|
| Paper | `#f6efdf` | Warm default canvas |
| Forest | `#173d2b` | Primary text, controls, and community section |
| Sun | `#efc85d` | Daily Brief and schedule emphasis |
| Coral | `#df7053` | Social moments and editorial emphasis |
| Mint | `#9cdda5` | Community accents |
| Blue | `#b8dbe2` | Calm utility and saved profile section |
| Display | Fraunces 600/700 | Human editorial headlines |
| Interface | DM Sans 400/500/600 | Navigation, body copy, and controls |

The page uses mostly square or lightly rounded surfaces. Rounding signals an actual phone, button, ticket, or profile object. It is not used as a default decoration for every section.

The single image gradient is a functional scrim on the hero photograph. The caption also has a solid forest backing so its contrast does not depend on the image.

## Composition

- The hero is a split editorial spread with a documentary family image, real Sprout home screen, and an invitation taken from the product UI.
- The week is an interactive schedule board rather than a feature card.
- Daily Brief uses a tall sunrise arch because the feature is tied to morning routine.
- Community uses a dark field and a horizontally scrollable school directory on mobile.
- Conversation, memories, and registration each use a different layout because they answer different questions.
- Trust has one large, plain visual mark and specific claims from the existing website.

The expressive dial is `E2`, rounding is `R3`, and motion is `M2`: warm and recognizable, restrained surface rounding, and short state-based motion.

## Interactions

- Schedule tabs support click, Left/Right arrows, Home, and End. Selection updates the event without moving the page.
- The mobile menu moves focus into the first link, traps Tab within the menu, closes with Escape, and makes page content inert while open.
- The saved profile demonstration changes to a clearly labeled preview completion state. A second click resets it.
- Product sections reveal once as they enter the viewport. `prefers-reduced-motion` removes the reveal and tab transition.
- Buttons lift by two pixels on hover and settle on press. No continuous decorative animation is used.

## Responsive behavior

- At 800px and below, navigation collapses to an accessible menu.
- Split sections become ordered single-column stories. Conversation copy appears before its screenshot on mobile.
- The school directory becomes a contained horizontal rail with snap points. The page itself does not scroll sideways.
- Schedule content becomes a stacked list below 544px.
- Store badges stack at narrow phone widths.
- Touch targets are at least 44px high.

## Accessibility decisions

- One `h1` and sequential section headings.
- Real buttons for schedule controls and the one-tap preview.
- Visible focus treatment with a dark red inner ring and white outer ring.
- Decorative SVGs are hidden from assistive technology.
- Every informative image has descriptive alternative text. Brand images paired with visible text use empty alternative text.
- Status changes in the saved profile demo are announced with `aria-live`.
- Tested color pairs range from 5.03:1 to 11.88:1 for normal text.

## Engineering handoff

The prototype is dependency-free and can be migrated section by section into the current React application. Keep the semantic elements and ARIA state changes. Replace only the static schedule object and preview state when real product data or routes are available.

Before production, self-host approved font files, optimize the largest screenshots to the final display sizes, add analytics only after event names are agreed, and resolve the content issues in `CONTENT-CHANGES.md`.
