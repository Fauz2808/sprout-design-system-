# Room Parent Portal — Walkthrough Video Brief

**For:** Tony Martin
**Purpose:** The "coming soon" walkthrough video slotted into the roomparent.com hero (dashboard screenshot → video thumbnail with play button, per the 2026-09-09 call) and the `video-walkthrough` section of [roomparent-com-landing-v2.html](roomparent-com-landing-v2.html).
**Hard constraint:** **2:00 max, no exceptions.** Per Ahmad on the 2026-09-09 call: "very compact, very quick, easy to understand" — if a beat doesn't survive the timer, cut the beat, not the timer.
**Format:** Screen recording of the real portal (`room-parent-portal-redesign/index.html` — the actual product, not a mockup) with voiceover. No talking-head needed — the product should carry the video, matching the "this is the actual portal, real UI" framing already used on the landing page.
**Audience:** A room parent who has 2 minutes between drop-off and their next task. They're skeptical of one more tool. They need to see it's simple and free before anything else.

---

## Timing budget (120s total)

| # | Beat | Time | Screen |
|---|------|------|--------|
| 1 | Hook | 0:00–0:08 (8s) | Dashboard, static |
| 2 | Sign in | 0:08–0:18 (10s) | Phone + OTP sign-in |
| 3 | Dashboard overview | 0:18–0:30 (12s) | Dashboard |
| 4 | Calendar | 0:30–0:46 (16s) | Calendar |
| 5 | School-wide lunch menu | 0:46–1:00 (14s) | Lunch Menu |
| 6 | AI-drafted emails | 1:00–1:16 (16s) | Compose Email |
| 7 | Volunteer sign-ups | 1:16–1:30 (14s) | Sign-Ups |
| 8 | Fundraising tracker | 1:30–1:44 (14s) | Fundraising |
| 9 | Close / CTA | 1:44–2:00 (16s) | Dashboard → Sign-in CTA |

Six product beats (4–9), matching the exact six features already promised on the landing page's "How it works" tabs and Core Features list — the video should feel like proof of what the site already claims, not a separate pitch.

---

## Scene-by-scene script

### 1. Hook — 0:00–0:08
**Screen:** Dashboard, held static for a beat before anything moves.
**VO:**
> "This is everything a room parent needs. One place. Free. No new app for your families to download."

### 2. Sign in — 0:08–0:18
**Screen:** Phone number entry → OTP code → straight into the dashboard. No password screen, no account-creation form.
**VO:**
> "You sign in with just your phone number — no password to remember, no account to set up."

### 3. Dashboard overview — 0:18–0:30
**Screen:** Slow pan/scroll down the dashboard, letting the calendar preview, quick stats, and nav land on screen without dwelling.
**VO:**
> "Everything for your class lives right here — calendar, lunch menu, emails, sign-ups, and your class fund, all in one dashboard."

### 4. Calendar — 0:30–0:46
**Screen:** Calendar view. Click one event to show the invite-vs-calendar-only toggle.
**VO:**
> "Add an event, and choose per event — send a full invite with RSVPs, or just drop it on the calendar. Your call, every time."

### 5. School-wide lunch menu — 0:46–1:00
**Screen:** Lunch Menu (master view). Edit one item, cut to a class dashboard showing the same change already reflected.
**VO:**
> "Update the lunch menu once, at the school level — every classroom sees it instantly. Nobody re-types it twice."

### 6. AI-drafted emails — 1:00–1:16
**Screen:** Compose Email. Click generate, show the draft populate pulling from calendar content, then the send action.
**VO:**
> "Need to email the class? One click drafts it for you, pulled straight from what's already on your calendar. Edit if you want, or just send."

### 7. Volunteer sign-ups — 1:16–1:30
**Screen:** Sign-Ups. Show a slot being filled — emphasize no login/account gate on the parent-facing side.
**VO:**
> "Sign-ups work from a link — parents can claim a slot whether or not they're even on Sprout. No account needed."

### 8. Fundraising tracker — 1:30–1:44
**Screen:** Fundraising. Show the donations-by-reason and expenses-by-event donut charts, same fundraiser name/color in both.
**VO:**
> "And your class fund — every donation and every expense, tracked and color-coded, so you always know exactly where it stands."

### 9. Close / CTA — 1:44–2:00
**Screen:** Cut back to the full dashboard, then to the sign-in screen with the "Sign In to Your Portal" button visible.
**VO:**
> "That's the whole job, in one place — free, for every room parent. Sign in at roomparent.com and get started."

**On-screen end card (no VO, silent beat, last ~2s):** `roomparent.com` + `Sign In to Your Portal`

---

## Production notes

- **Real UI only.** Every shot is a screen recording of the actual `room-parent-portal-redesign/index.html`, not a re-created mockup — matches the "Real UI" / "actual portal, doing the actual work" framing already on the landing page. Don't fake data that isn't already the file's own seed data (fictional names only, per the repo's existing convention).
- **No fabricated urgency or stats.** Same hard rule as the landing page copy — this product hasn't launched publicly. Nothing like "join 2,000 room parents."
- **Cut order if it runs long:** if 2:00 is tight in the edit, drop beat 7 (Sign-ups) first, then beat 8 (Fundraising) — Calendar, Lunch Menu, and AI email are the three Ahmad called out as most load-bearing when describing the site's structure on the 2026-09-09 call. Never cut beat 1, 2, or 9 — hook, sign-in simplicity, and the CTA are what make this a *conversion* video and not just a feature tour.
- **Captions on by default.** Assume sound-off viewing (parent scrolling one-handed) — VO lines above should also work as burned-in captions verbatim.
