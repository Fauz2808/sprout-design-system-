# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Parents (primarily of young/school-age kids) looking to meet other local parents and find things to do with their family. They're navigating the isolation of modern parenting — the job is "help me find my people and our people's weekend plans, near where we actually live."

## Product Purpose

Sprout is a mobile app (iOS, currently) that helps parents discover local events (playdates, park meetups, sports leagues, school-group activities), join parent clubs around shared interests, and build real friendships with other families in their neighborhood. The marketing site (`01 - Website/sprout-landing.html`) exists to convert visitors into App Store downloads.

## Positioning

Hyper-local, real-world matching: Sprout connects parents to people and plans within their actual neighborhood/school radius, not a generic online group. This is the mechanism Facebook Parent Groups, Nextdoor, and Meetup don't replicate — those are broad, noisy, and not built around family-specific, walkable-distance matching.

## Operating Context

- Live production site (joinsprout.co) is a separate React/Vite SPA — not this HTML file.
- Sprout's own workflow (see project memory `sprout-design-workflow-two-speed`): HTML prototypes are the disposable/canonical *design* exploration layer; validated designs get handed off 1:1 to engineering (not built by Ahmad directly in the app repo). `01 - Website/sprout-landing.html` is that design source of truth for the marketing page — it should be built to full craft/handoff quality, not treated as a rough sketch.
- Benchmark reference for this redesign: folk.app (folk.com CRM) — a B2B SaaS product, cited for its *technique*, not its category or literal palette.

## Capabilities and Constraints

- App is currently iOS only ("Now Available on iOS" badge is accurate per user confirmation).
- No Android app yet — do not imply cross-platform availability.

## Brand Commitments

- Existing visual identity is established and confirmed durable: warm cream/green editorial palette (`--cream #f4f1ea`, `--green #186338`, `--green-bold #1e3e2b`, `--sage #d0dacf`), Playfair Display (display/serif) + Inter (body), full-bleed rounded cards, soft organic blob accents. This redesign inherits and refines this world — it does not replace it with folk.app's monochrome B2B look.
- Name "Sprout", logo, and tone (warm, editorial, community-first) are fixed.

## Evidence on Hand

- Stats ("2,000+ families connected", "50+ cities", "10,000+ events created") — confirmed real/current by user, safe to keep and feature prominently as proof.
- Testimonial quotes on the current page — confirmed real, safe to keep/feature.
- Product screenshots referenced from `Sprout UI Design Screen/PNG Format/` — real app UI, not mockups.

## Product Principles

1. Prove the mechanism, don't just claim it — lead with real local activity (actual event/club moments), not generic lifestyle framing.
2. Cut every line of copy that restates rather than adds — benefit-first, no filler between the hook and the proof.
3. Typographic hierarchy and whitespace carry the "premium/considered" read that a warm palette alone doesn't guarantee.
4. Every proof point (stats, testimonials, screenshots) earns its section — no decorative filler sections.
5. Warmth is the brand's differentiator versus folk.app's category (consumer trust > B2B efficiency) — restraint techniques get borrowed, coldness does not.

## Accessibility & Inclusion

No specific requirement established beyond standard web accessibility (semantic structure, contrast, keyboard/focus states) — apply as baseline craft.
