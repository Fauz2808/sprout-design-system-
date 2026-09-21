# Sprout website redesign system

This document describes the implementation in `index.html`, `styles.css`, and `script.js`. It is a design handoff for a new direction, not a Figma fidelity certification. Independent review is ongoing.

## Direction and content

Borrow Bevel's spacious composition, compact floating navigation, large product imagery, and deliberate section pacing. Keep Sprout's family context, green identity, Playfair Display headlines, and real app screens. The broad family photograph creates warmth; the adjacent product screen explains what Sprout does.

The page progresses from connection to feature exploration, Daily Brief, event planning, one-tap registration, trust, the founding story, and app download. Content comes from the live Sprout site with disclosed editorial changes. See [CONTENT-CHANGES.md](./CONTENT-CHANGES.md). The family photograph is an existing AI-generated concept, not documentary evidence of Sprout customers. See [asset provenance](./assets/PROVENANCE.md).

## Tokens

| CSS token | Value | Purpose |
|---|---|---|
| `--paper` | `#f6f7f2` | Main warm white canvas |
| `--cream` | `#f4f1ea` | Established brand cream and footer |
| `--white` | `#ffffff` | Navigation, selected tab, and registration surface |
| `--sage` | `#e7eddf` | Hero image field |
| `--green` | `#186338` | Primary controls and italic emphasis |
| `--forest` | `#183e2b` | Daily Brief section |
| `--ink` | `#203d2b` | Main text |
| `--muted` | `#576354` | Supporting text |
| `--line` | `#d8dfd1` | Quiet dividers |
| `--blue` | `#e8f0f3` | Event planning image field |
| `--shadow` | `0 22px 55px rgba(19,43,28,.16)` | Product image depth |
| `--ease` | `cubic-bezier(.16,1,.3,1)` | State and hover easing |

Feature-specific background shades stay within sage, blue, and warm sand families. The dark section uses pale green emphasis and light body text. Do not import Bevel's health terminology, metrics, or product claims.

## Type and spacing

Playfair Display, weight 500, serves headlines, with italic phrases for emphasis. Inter serves navigation, body copy, disclosures, and buttons. `assets/fonts.css` currently imports Google Fonts; Georgia and sans-serif are fallbacks. Fonts remain external after the self-hosting download was canceled.

- Hero: `clamp(49px, 5.75vw, 80px)`, line-height 1.09. Mobile uses `clamp(39px, 7.4vw, 55px)` and line-height 1.14.
- Section headings: generally 40–60px desktop and 38–41px mobile, with line-height 1.14.
- Main body: generally 14–17px, line-height 1.65. Large editorial introductions use 18–22px. Metadata and secondary labels are smaller.
- Content wrapper: maximum 1184px, with 40px desktop side gutters. Gutters become 32px at 1050px and 18px at 760px.
- Typical section spacing: 112px vertically, reduced to 75px on mobile. Individual transitions use 58–132px for pacing.
- Main image and feature surfaces: 14–18px radii. Controls use pill shapes; phone crops use 23–36px radii.

## Components and behavior

| Component | Implementation |
|---|---|
| Navigation | Fixed 640px floating capsule. Above 30px scroll, it moves from 20px to 12px top offset and gains shadow. Mobile replaces text links with a menu toggle. |
| Main CTA | Solid brand green, minimum height 52px, with color feedback, a 3px arrow shift on hover, and a small press scale. Download actions lead to the store-choice section. |
| Hero | Centered headline above a wide photo, with a real Sprout screenshot positioned on the right. Mobile reduces and repositions the screen overlay. |
| Feature explorer | Three manual tabs: Discover, Community, and Stay connected. Each presents one text-and-product panel. Hidden panels are removed from display. |
| Daily Brief | Native `details` elements. Opening a topic closes its siblings, including in browsers without native named disclosure support. |
| One-tap preview | A reversible client-side state change. The button shows confirmation and can reset. It collects no profile information and submits no registration. |
| Saved details | Native disclosure listing supported profile fields. |
| Download | Official App Store and Google Play badge assets with external destinations. |

## Responsive layout

Breakpoints are 1440px, 1050px, and 760px. At 1050px, columns remain but gaps, typography, and product imagery reduce. At 760px, feature panels, Daily Brief, registration, trust, and story sections stack. Event planning puts its text before its image on mobile. The hero retains its photographic context with a smaller screen overlay. The registration comparison compresses the illustrated repeated form while retaining the active preview.

## Motion and accessibility

Motion communicates interactions: 200–350ms control and navigation feedback, a 420ms feature-panel entrance, a 300ms disclosure indicator turn, and a 500ms registration confirmation. There is no autoplay carousel, parallax, or scroll-jacking. `prefers-reduced-motion` disables animations, transitions, and smooth scrolling.

Implemented accessibility behavior includes semantic landmarks, one H1, named sections, a skip link, visible focus outlines, descriptive product image alternatives, and native button/disclosure controls. Tabs expose selected state and support Left/Right, Home, and End keys with roving focus. The mobile menu locks body scrolling, makes main/footer inert, traps keyboard focus within the header, closes on Escape, restores focus on dismissal, and cleans up when the viewport becomes desktop. Registration results use a polite live status region.

These are implementation descriptions, not a claim that accessibility or responsive checks have passed. Review findings and any remaining limitations belong in the review record before engineering adopts the design.
