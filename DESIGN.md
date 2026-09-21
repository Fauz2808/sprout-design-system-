# Sprout Website Design System

## Scope

This document governs `01 - Website/sprout-landing.html`. Room Parent is a separate standalone product and must not influence Sprout's copy, design, screenshots, or product claims.

The live website at `joinsprout.co` is the content source of truth. Its navigation, headings, body copy, feature list, trust statements, store links, CTA, and footer must remain verbatim unless the product owner explicitly approves copy changes.

## Direction

The approved direction follows the existing Room Parent portal family: calm, product-led, and trustworthy. The marketing page should feel like the same Sprout ecosystem, with a stronger storytelling scale than the portal but the same visual grammar: cream canvas, deep green anchors, Playfair headlines, Inter interface text, white surfaces, thin borders, and restrained shadows.

Craftwork was used only to study pacing and product storytelling. It is not the visual source of truth.

## Visual signature

- Playfair Display headlines paired with Inter interface text.
- Cream as the base, botanical green as the anchor, with green-light, blue, and paper surfaces used sparingly.
- Real Sprout screens are the primary visual proof.
- Product screens sit inside familiar rounded shells, cards, and soft green fields.
- Thin beige borders, 14–16px radii, and soft shadows create the shared portal feel.
- Alternating full-width sections create rhythm, but surfaces remain restrained and functional.

## Tokens

| Token | Value | Use |
|---|---:|---|
| `--cream` | `#f4f1ea` | Main background |
| `--paper` | `#ffffff` | Card and form surfaces |
| `--green` | `#186338` | Brand anchor, footer, primary controls |
| `--green-2` | `#2b7b4c` | Supporting brand accent |
| `--lime` | `#e2e9e3` | Light green product surface |
| `--peach` | `#fbf9f4` | Warm neutral section surface |
| `--blue` | `#e3edf5` | Cool supporting surface |
| `--sage` | `#e2e9e3` | Registration surface |
| `--ink` | `#1e3e2b` | Primary text and borders |
| `--muted` | `#7d715e` | Supporting text |

## Typography

- Display: Playfair Display, weights 500–700.
- Interface and body: Inter, weights 400–700.
- Hero and major section headings use generous line-height and restrained tracking.
- Body copy uses comfortable line-height between 1.5 and 1.65.
- Labels may be uppercase only when short and structural.
- Never introduce a third typeface or a new font system.

## Layout

- Desktop content width: `min(1320px, 100vw - 64px)`.
- Major sections use 110–130px vertical padding.
- Hero, feature stories, and moments use asymmetric two-column layouts.
- Feature stories alternate a text half and a quiet product visual half.
- Product images may rotate up to two degrees and use a restrained offset shadow.
- Mobile stacks every major layout in the original content order.
- No horizontal page overflow is permitted at 390px or above.

## Components

### Header

Fixed cream navigation with logo, Features, About, and one Download App action. At 780px and below, use the full-screen green-light menu. Background content must become inert while the menu is open.

### Store buttons

Use the exact official App Store and Google Play assets from `01 - Website/sprout-live-assets/`. Keep the confirmed live destinations unchanged.

### Product screens

Use real Sprout UI from `01 - Website/sprout-live-assets/`. Phone shells are CSS framing only. Screens must remain legible and cannot be replaced with generic device mockups.

### Feature stories

Each live feature gets one full-width story block. Keep its label, heading, body, and supporting copy together. Visual styling may change; content may not be shortened or rewritten.

### Registration comparison

Keep the complete “usual way” and “Sprout way” comparison. The contrast between paper and lime communicates the benefit without additional copy.

## Motion

- Use motion only for state changes, hover feedback, and header behavior.
- No auto-scrolling marquees, autoplay carousels, parallax, or scroll-jacking.
- Respect `prefers-reduced-motion`.

## Accessibility

- Preserve landmarks, heading order, skip link, alt text, keyboard focus, and 44px minimum controls.
- Mobile menu supports Escape, focus return, resize cleanup, body scroll lock, and inert background content.
- Do not use color alone for state.
- Maintain readable contrast on every color field.

## Content lock

The copy snapshot used for this design is stored at `.impeccable/research/joinsprout.json`. Automated review checks the rendered page against the live strings. Existing punctuation, including em dashes and the double hyphen in the Discover paragraph, is deliberate because the website copy is locked.

## Anti-patterns

- Quiet luxury, generic SaaS minimalism, or long stretches of empty cream.
- Bento dashboards and repeated rounded feature cards.
- Fake testimonials, invented statistics, or new product claims.
- Extra CTA language not present on the live website.
- Stock photography replacing real product UI.
- Decorative gradients, glass effects, neon colors, poster-like color collisions, and excessive pills.
- Room Parent references of any kind.
