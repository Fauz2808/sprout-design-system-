# Sprout / Room for family life

A separate Reach-inspired option. The earlier versions are untouched.

Run from this folder:

```sh
python3 -m http.server 8794
```

Preview: http://127.0.0.1:8794/

The design uses a photographic meadow hero, an interactive mom-hand phone mockup, selectable app screens, a horizontal family-moments accordion, and a sticky product narrative. The moments accordion keeps one card expanded and opens cards on hover, focus, or click. In the stacked mobile layout, the card whose heading enters the center band of the viewport expands automatically while scrolling. Selecting Daily Brief, Chat, or Clubs moves a second hand to the matching in-app navigation point and changes the screen at contact. On mobile the narrative uses explicit feature links instead of scroll-driven selection. CSS scroll-timeline parallax is progressive enhancement; unsupported browsers keep the static scene. Reduced-motion preferences cancel active animations.

The editorial headings are new; product capabilities, UI exports, store destinations, and family imagery come from the existing Sprout work. The closing landscape is a project-specific generated asset with a different composition from the hero meadow. No invented metrics or testimonials are included. The linked Vercel project publishes this iteration for review.

**Website v2 (7 Oct), `home-v2.html`:** Tony's structure pass. Header about parents (5 options behind a "Review only"
pill, `?h=N`), then Daily Brief (pinned, scroll drives the brief), Class group chats, Member directory, Sprout Assist as
a carousel near the bottom, and the close with Share Sprout. No waitlist: the CTA is download. All screens are coded.
`home-v2-gp.css` is generated: run `review/sync-v2-gp.sh` after editing the `.gp` block in `assist-landing.css`.

**8 Oct (Tony's 9 points + standup), handed to Syed for React:** hero CTA is a school search (`SCHOOLS` in home-v2.js),
the Daily Brief copy is one real morning, class chats and directory are pinned (step copy swaps in place, never
slides), room parent strip, kids' privacy and inbox trust lines, Assist cut to a three-line teaser, FAQ, close
"The parents who matter most are already at drop-off." home-v2 no longer uses `home-v2-gp.css` (assist.html still
does). Handoff page for Syed: `handoff.html`; legal pages copied to `legal/`. Check: `node review/home-v2-shots.mjs`.

Validation:

```sh
node --test review/*.test.cjs
node --check script.js
```

See DESIGN.md for visual decisions and review/DELIVERY-GATE.md for verification evidence.
