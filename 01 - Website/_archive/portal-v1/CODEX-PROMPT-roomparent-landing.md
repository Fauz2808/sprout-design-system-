# Prompt for Codex — Rebuild & Elevate the roomparent.com Landing Page

Paste everything below this line into Codex as one prompt.

---

## What you're building

A marketing/landing page for **roomparent.com** — a free, all-in-one web tool for elementary school "room parents" (the volunteer parent who runs a classroom's calendar, lunch menu, parent emails, sign-ups, and fundraising). This is a **Sprout** product (Sprout is a parent-community mobile app), but roomparent.com is a standalone web tool that works whether or not the visitor's school uses Sprout at all.

You are rebuilding an existing first-draft page with a real UI/UX upgrade pass — not just re-implementing it as-is. Treat the current draft as a functional skeleton that proves the content works; your job is to make it look and feel like a page a real design team shipped.

## Origin — why this page exists (verbatim from the founder, Tony Martin, in a team meeting)

> "we're gonna have our website's just gonna highlight all the things that we do for room parents... It's like the header is gonna be like all in one tools for room parents... I guarantee you, like, I'll be able to share that with all the room parents at Kiker, and then they're gonna send it, like, to their friends at other schools... we just wanna make a nice elegant website similar to what we have on Sprout. But it's all just the room parent stuff."

Two things that follow directly from this:
1. **The visual system should match Sprout's own real marketing site** (see reference file below) — this is a deliberate brand-consistency requirement, not a suggestion.
2. **This page is meant to be forwarded parent-to-parent, school-to-school.** It needs to read well as a shared link (implies real Open Graph / social-preview meta tags matter) and needs to work for someone whose school has never heard of Sprout.

## Reference files — read these before writing any code

If you have file access to this repo, read them in this order. If you don't, the essential content is summarized in this prompt below, but reading the real files will get you a far more accurate result.

1. **`01 - Website/sprout-landing.html`** — Sprout's real, shipped marketing site. This is the exact visual system to match: design tokens, nav behavior, hero layout, stats strip, tabbed "how it works" feature showcase, bento feature grid, "why us" card grid, testimonials, FAQ accordion, final CTA, footer. Match its polish level, its animation patterns (scroll-reveal via IntersectionObserver, animated stat counters, auto-rotating tabs with a progress bar), and its typographic voice. Do not invent a new visual language — extend this one.
2. **`01 - Website/room-parent-portal.html`** — the actual product this page is marketing. This is a large single-file web app (dashboard, calendar, school-wide lunch menu, AI-drafted compose-email, volunteer sign-ups, donation/expense tracking with a donut-chart visualization, room-parent access management, a links page, and a phone+OTP sign-in flow with a new-user onboarding branch). Read this to get **real feature names, real copy voice, and real UI patterns** — every mockup on the landing page should be recognizably "the real product," not a generic SaaS illustration. It's deployed live at `room-parent-portal.vercel.app`, and the landing page's CTA must link to it (`./room-parent-portal.html` relative path, or the live URL if you're not colocating files).
3. **`01 - Website/roomparent-com-landing.html`** — my first-pass build. This is the baseline to improve on, not a locked spec. It proves out the content and section structure; assume its visual execution is mediocre and needs a real design pass.

## Design tokens — non-negotiable, copy exactly

```css
--cream:       #f4f1ea;
--cream-mid:   #eae6db;
--cream-deep:  #dbd5c8;
--green:       #186338;
--green-bold:  #1e3e2b;
--green-xbold: #0f2218;
--green-light: #e2e9e3;
--green-mid:   #77b691;
--sage:        #d0dacf;
--text:        #2a2e25;
--text-mid:    #4d525b;
--text-muted:  #818898;
--white:       #ffffff;
--amber:       #c08a2d;
--amber-light: #fbf0d8;
```

Typography: **Playfair Display** (serif — headings, display numbers, button labels in the wider Sprout system, italic for quotes/emphasis) + **Inter** (sans — body copy, UI chrome, labels). Load both via Google Fonts. Radii: 6/12/20/32px steps plus a full/pill radius. Icons: emoji is the established convention in this codebase for marketing pages (not an icon font) — keep using it, it's intentional and on-brand, not a placeholder.

## Content structure — preserve this information architecture

Each section's *job* is fixed; you have full latitude on execution.

1. **Nav** — logo/wordmark ("Room Parent" or similar, clearly a Sprout product), links to in-page anchors, primary CTA = **"Sign In"** linking to the portal.
2. **Hero** — headline built around "all-in-one tools for room parents." Sub-copy: no more spreadsheets, group texts, or guessing who paid for what. Primary CTA = **"Sign In to Your Portal"** (not "Download the App" — there is no app to download, this is a web tool). Secondary CTA = scroll to the how-it-works section. Visual: **this is a desktop web dashboard, not a phone app** — the hero visual should read as a browser window / desktop screen, not a phone mockup (my draft used a browser-chrome frame with rounded traffic-light dots; feel free to execute this better, but don't switch to a phone metaphor, it would misrepresent the product).
3. **Stats strip** — do NOT fabricate large adoption numbers ("2,000+ families") the way Sprout's own consumer marketing does — this product hasn't launched publicly yet. Use honest, small, specific framing instead (my draft used things like "8 parents in one class, one place," "$0 cost to room parents, ever," "1 login, every class," "Any school — with or without Sprout"). Feel free to find better honest framings, just don't invent adoption metrics.
4. **"How it works" — tabbed feature showcase** — 5-6 tabs, each a real feature of room-parent-portal.html, each with its own mini-mockup in the display panel: **Class Calendar, School-Wide Lunch Menu, AI-Drafted Emails, Volunteer Sign-Ups, Fundraising Tracker** (donut chart — reuse the exact per-category color-consistency behavior from the real product: the same category/event name is always the same color across every chart it appears in, e.g. a specific fundraiser name shown in both "Donations by Reason" and "Expenses by Event" must be the same color in both — this was a real bug fixed in the source product, don't regress it visually).
5. **Bento feature grid** — 7 cards is what my draft used; adjust count/sizing for visual rhythm as you see fit, but keep the underlying feature set: (a) per-event invite-vs-calendar-only mode toggle, (b) room parent access management (grant/revoke per class), (c) AI email drafting, (d) sign-ups that don't require an account, (e) fundraising tracking with the donut charts, (f) a wide trust/positioning card ("free, works at any school, parents need zero setup, your class's data only"), (g) multi-class support (one login, switch between classes if you're room parent for more than one).
6. **"Why" section** — 4 cards: zero setup required for parents, works at any school (no Sprout partnership needed), class-scoped data privacy (master-level info like the lunch menu is intentionally shared; everything else is not), free forever.
7. **Social proof — founder quote, NOT fabricated testimonials.** This is a hard constraint, explained below. Attribute a quote to **Tony Martin, Sprout's founder, who is himself the room parent for his daughter's class at Kiker Elementary** — this is true and it's a real, named, identifiable person on the team, which is categorically different from inventing anonymous "real parent" reviews for a product that hasn't shipped.
8. **FAQ accordion** — real, specific questions: is it free / do parents need to download anything / does my school need Sprout / can I be room parent for multiple classes / who can see our class's data / what happens if I hand off to next year's room parent.
9. **Final CTA** — restate the emotional hook, "Sign In to Your Portal" button.
10. **Footer** — product links (how it works, features, sign in), company (link to the main Sprout app), legal (privacy, terms), tagline.

## Hard constraints — do not violate these

- **Never fabricate customer testimonials or reviews presented as genuine.** roomparent.com has not launched. Anonymous "real parent" quotes would be misleading marketing copy. Use the founder-quote approach instead, or omit social proof entirely if you'd rather — do not invent fake customers.
- **Never surface real parent names, emails, phone numbers, or student data** even if you see them while reading `room-parent-portal.html`'s seed data — use clearly fictional placeholder names in any mockup (the source file already does this; follow the same convention).
- **Single self-contained HTML file.** No build step, no framework, no bundler — inline `<style>` and `<script>`, Google Fonts via `<link>`, this matches the rest of this codebase's convention for marketing/prototype pages. Do not introduce React/Vue/a CSS framework/npm dependencies.
- **CTA links must point to the real product** — `./room-parent-portal.html` if colocated, otherwise the live URL `https://room-parent-portal.vercel.app`.
- **Brand tokens are fixed** (see above) — this is not a "pick your own palette" exercise.

## Where to actually push the UI/UX upgrade

This is the part that matters most given the reason you're being asked to rebuild this instead of iterating on the existing draft. Concrete directions, not just "make it nicer":

1. **Higher-fidelity feature mockups.** My draft rebuilt each feature as a simplified, hand-drawn CSS approximation. Consider whether some of these should instead be real, scaled `<iframe>` embeds of the actual `room-parent-portal.html` (or precisely cropped/scaled recreations with pixel-accurate spacing pulled from that file's real CSS classes) — a visitor who can see the *actual* product, not an artist's impression of it, is a meaningfully stronger conversion signal for a tool aimed at a skeptical, busy audience.
2. **Motion and micro-interaction depth.** The current animation vocabulary (fade-up on load, IntersectionObserver reveal-on-scroll, animated counters, auto-rotating tabs with a linear progress bar) is a reasonable baseline — extend it: scroll-linked parallax on the decorative blobs/arcs, a more considered hover language on cards (not just translateY), a smoother/more physical easing curve library, and motion that respects `prefers-reduced-motion`.
3. **Typographic and spatial hierarchy.** Audit whether the current draft's rhythm (section padding, heading scale, line-length) reads as "considered editorial layout" or "template with content dropped in." Sprout's own site (`sprout-landing.html`) sets the bar here — match or exceed it.
4. **Responsive craft, not just breakpoints.** Go beyond collapsing the grid at 1024px/640px — check touch target sizing, whether the bento grid's information hierarchy survives single-column reflow, whether the tabbed showcase makes sense on mobile (probably needs a different interaction pattern than desktop tabs — a swipeable carousel, most likely).
5. **Accessibility.** Semantic landmarks, sufficient color contrast (check the cream-on-cream and green-on-dark-green combinations specifically), visible focus states on every interactive element, an accordion FAQ that's actually keyboard-operable and uses `aria-expanded`, decorative emoji marked `aria-hidden` where they're not conveying unique information.
6. **Meta/share readiness.** Add real `<title>`, `<meta name="description">`, and Open Graph tags (`og:title`, `og:description`, `og:image` if you generate or have access to a suitable image) — this page is explicitly designed to be forwarded parent-to-parent and school-to-school per the founder's own framing above, so how it looks as a shared link preview is part of the job, not an afterthought.
7. **A stronger point of view on the hero visual.** A browser-chrome mockup of the dashboard is the right idea; whether it's the strongest execution of that idea is worth a real second look — e.g., should it show a moment of the AI drafting an email live, or the fundraising thermometer mid-count, rather than a static resting state?

## Deliverable

One self-contained HTML file. Suggested filename: `roomparent-com-landing.html` (same as the draft, so it can directly replace it once reviewed) — but if you'd rather iterate without touching the existing draft until it's approved, save as `roomparent-com-landing-v2.html` in the same `01 - Website/` folder instead, and say so.

Before calling it done: verify in a real or headless browser that (a) the tabbed showcase auto-rotates and responds to clicks, (b) the FAQ accordion opens/closes and only one item is open at a time, (c) scroll-reveal animations actually fire (test with realistic scroll timing — fast programmatic scrolling can outrun an IntersectionObserver and produce a false "nothing renders" failure, which is not a bug, just a test artifact), (d) there are no console errors, (e) no image asset is broken, (f) the page is usable at a 375px-wide mobile viewport.
