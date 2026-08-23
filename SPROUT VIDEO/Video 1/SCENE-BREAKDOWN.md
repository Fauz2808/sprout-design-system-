# ARCHIVED UI-FIRST VERSION

The approved production direction is now AI-first. Use `AI-FIRST-SCENE-BREAKDOWN.md` as the current source of truth. This file remains as an archive of the earlier UI-first approach.

# SPROUT — "Finally." — Video 1 Scene Breakdown

Source: Tony's script, "SPROUT — Finally." 30–60 sec teaser.
Target runtime: 45s (cut to 30s or stretch to 60s per Tony's own notes — see bottom).

Legend for **Status**:
- ✅ READY — asset exists, use as-is
- 🔧 ADAPT — asset exists, needs a small edit (crop / retime / re-export)
- 🆕 BUILT — didn't exist, I built it this session → see `mockups/`
- 🎨 GENERATE — didn't exist, needs AI photoreal image/video gen → prompt in `PROMPTS.md`
- 🎙️ AUDIO — needs voiceover / music / SFX production, not visual

All existing assets referenced below live one folder up: `../` (i.e. `SPROUT VIDEO/`).

---

## SCENE 1 — Cold Open: "Who is this?"
**~0:00–0:04**

> VO/text: "Who is 512-304-...? Is that Mason's mom? Or Lily's?"

**Visual:** Phone screen, Messages app, conversation list where every contact is a raw phone number instead of a name.

**Status:** 🆕 BUILT → `mockups/scene01-numbers-chat.png`
Nothing in the existing asset pool showed this — all existing screenshots are the *Sprout* app itself, already fully-named. Built a stand-in "before Sprout" Messages inbox where every thread is a bare phone number, one thread flagged with a hand-drawn-style circle + "Mason's mom? Lily's?" annotation to literally illustrate the VO line.

**How to use it:** Feed this PNG as the first frame into your video-gen tool (img2video) with a slow push-in / slight parallax, OR screen-record a live phone mirroring this exact layout for a more "real" texture. Either way, the on-screen text callout is already baked into the still, so you just need subtle motion, not new copy.

---

## SCENE 2 — The Morning Panic
**~0:04–0:09**

> VO: "Wait — is today free dress or not?!" "Anyone?? ANYONE??"

**Visual:** the same chat, now open, messages piling up from unnamed numbers, unread badge climbing, "..." typing indicators stacking.

**Status:** 🆕 BUILT (UI) + ✅ READY (human reaction shot)
- UI insert → `mockups/scene02-chaos-thread.png` — chat thread with the exact "free dress" panic lines, timestamps seconds apart, badge count escalating.
- Human reaction footage already exists and is a strong match: **`../Mother_overwhelmed_by_parenting_….mp4`** (10s, 720×1280) — mom in her kitchen with a wall of floating notification bubbles. This is functionally the mood-board version of this exact beat. Cut it in as the "reaction" half of the scene, intercut with the phone-screen insert above.

**Edit note:** this is the one scene where you already have *both* halves (UI + human reaction) — it just needs cutting together, no new generation.

---

## SCENE 3 — Beat / Pause
**~0:09–0:10**

> (silence, no VO — the exhale before the turn)

**Visual:** hold on the mom's face, chaos audio drops out.

**Status:** 🆕 BUILT + ✅ READY → `mockups/scene03-turning-point.html`
The HTML now maps the final beat of `../Mother_overwhelmed_by_parenting_….mp4`, slows it slightly, and holds at the end. This remains a live-action edit, not an AI-generated UI scene.

---

## SCENE 4 — The Turn: "There's a better way" + Logo Reveal
**~0:10–0:13**

> VO: "There's a better way."
> (Sprout logo appears. Clean. Calm.)

**Visual:** hard cut from chaos to negative space, clover logo settles in, centered, on cream.

**Status:** 🆕 BUILT → `mockups/scene04-logo-reveal.png`
Built directly from your real logo asset (`../Sprout_Logo123.png_...jpeg`) composited on a clean cream (#f4f1ea) card with the "Sprout" wordmark in Playfair Display — matching your landing-page brand tokens exactly, not a re-generated logo. This still is your end-frame for the reveal; animate the clover in with a soft scale/fade in your edit tool (or see `PROMPTS.md` for a video-gen version if you want AI-generated logo-assembly motion instead).

---

## SCENE 5 — "Meet Sprout"
**~0:13–0:17**

> VO: "Meet Sprout. The app built for the village it actually takes to raise a kid."

**Visual:** app opening on a phone, tagline over it, or a hand holding a phone as the Sprout home screen loads in.

**Status:** 🆕 BUILT → `mockups/scene05-app-launch.html`
The app-launch scene now uses the real Daily briefing screenshot inside a clean phone frame with a controlled entrance. No AI generation is required.
Closest existing assets: `../7.1_-_Home_-_Daily_202607312032.jpeg` (daily briefing screen) or `../Generated_Image...(4).jpeg` (Emma + David looking at phone showing the ParentLink dashboard). Recommend: reuse the daily-briefing screen as the "reveal" frame, animated with a quick scale-up/fade-in (splash → home). No new photoreal generation needed — this is a motion/edit task on an existing still. If you want a literal splash-screen animation (clover → wordmark → home screen), that's a quick After Effects/CapCut build, not an AI-gen task.

---

## SCENE 6 — Feature Cut A: "Real profiles. Real names. Real faces."
**~0:17–0:20**

> VO: "Real profiles. Real names. Real faces — so you actually know who you're talking to."

**Visual:** a member directory / family profile grid — the direct payoff to Scene 1's anonymous-numbers problem.

**Status:** 🆕 BUILT → `mockups/scene06-profile-directory.png`
Composited from your **existing character portraits** — Emma, David, Sarah, and Mike crops pulled straight from `../Generated_Image...(2).jpeg` (the EMMA/DAVID/Sarah/Mike comparison sheet) — into a "Your Village" directory screen with real names + "whose parent" labels (Emma – Mason's mom, David – Lily's dad, Sarah – team photographer, Mike – team treasurer). This deliberately mirrors Scene 1's fake-numbers list, same layout, so the before/after reads instantly in the edit.

---

## SCENE 7 — Feature Cut B: Calendar sync / reminders
**~0:20–0:24**

> VO: "Upload your school calendar once. Sprout sends the whole group a reminder the morning before — free dress, library day, early pickup — handled."

**Visual:** calendar upload confirmation → push notification banner landing on lock screen.

**Status:** 🆕 BUILT → `mockups/scene07-calendar-reminder.png`
Built as an iOS-style lock-screen notification stack: "📅 School Calendar synced" confirmation card, then a Sprout push notification "Reminder: Free Dress Day tomorrow — no uniforms needed!" — using the Sprout clover as the app icon and matching your real notification content style from `../7.1_-_Home_-_Daily_202607312032.jpeg` (which already has this exact reminder pattern — "No School," "Pizza day" — just not as a push-notification banner). This is the missing "the reminder actually arrives" beat that the Daily screen alone doesn't show.

---

## SCENE 8 — Feature Cut C: "Built for all of you" (platform gap)
**~0:24–0:28**

> VO: "iMessage drops Android users. WhatsApp has zero community. Sprout was built for all of you."

**Visual:** comparison graphic — iMessage bubble breaking to green "SMS," WhatsApp icon crossed out, Sprout logo checked.

**Status:** 🆕 BUILT → `mockups/scene08-platform-comparison.png`
Three-row comparison card: iMessage and WhatsApp referenced by name (plain text label) with generic speech-bubble/chat glyphs — not Apple's or Meta's actual app icons/logos — each crossed out, then Sprout's real clover logo checked. Keeps the exact comparison the VO makes without using anyone else's trademarked mark.

---

## SCENE 9 — Feature Cut D: "Find families, playdates, camps"
**~0:28–0:33**

> VO: "Find families with the same interests. Set up playdates. See which camps and sports teams your kids' friends are signing up for."

**Visual:** discover feed of activities/parks + a social-proof "friends going" screen.

**Status:** ✅ READY (partial) + 🆕 BUILT (the specific "friends going" beat)
- `../7.1_-_Home_-_Discover_202607312032.jpeg` already nails the general "find activities/parks/invitations" half of this line — use as-is.
- The specific "see which camps your kids' friends are signing up for" line has no existing visual (Discover shows activities generically, not friend-overlap) → built `mockups/scene09-friends-going.png`, a camp/team card with a stacked avatar row ("Mason, Lily + 1 more are going") and an RSVP button, using your real character faces again for continuity.
- Bonus supporting still: `../Generated_Image...(6).jpeg` (family in living room, soccer team parents hanging out) works as cutaway B-roll for "community" if you want a third shot in this beat.

---

## SCENE 10 — Feature Cut E: "One organized parent updates the group"
**~0:33–0:37**

> VO: "One organized parent updates the group — everyone benefits."

**Visual:** one parent posts an update, it fans out and is marked delivered/seen by everyone.

**Status:** 🆕 BUILT → `mockups/scene10-update-fanout.png`
Built as a message-composer card from Mike (established as "Team Treasurer" in your character sheet, `../Generated_Image...(2).jpeg`) posting "📌 Practice moved to 5:30pm Thursday" with a "Delivered to everyone in Little Shots ⚽" confirmation and a row of recipient avatars ticked green. Reuses Mike's existing character design so it stays consistent with Scene 6/9's cast rather than introducing a new unnamed parent.

---

## SCENE 11 — Resolution: Calm, coffee-in-hand mom
**~0:37–0:41**

> VO: "Less chaos. More community." (slow zoom on a calm mom, coffee in hand, checking her phone)

**Visual:** the emotional mirror of Scene 2 — same mom, now unbothered, warm morning light, coffee mug.

**Status:** 🆕 BUILT ANIMATIC + 🎨 GENERATE FINAL → `mockups/scene11-calm-resolution.html`
The animatic currently uses `../Mother_and_child_in_kitchen_….mp4` as a timing stand-in. Generate the final calm-coffee Emma shot only after the UI animatic is locked to the final VO.
Your Emma reference sheets (`../Generated_Image_July_30,_2026_202607312032.jpeg` — the Emma solo sheet, no suffix — plus `(2).jpeg` and `(4).jpeg`) are all **studio grey-background** portraits — none show her in a lifestyle/kitchen setting with coffee. This is the most important missing shot in the whole script because it's the emotional payoff the VO explicitly calls for, and it needs to visually rhyme with the chaos shot in Scene 2 (same woman, same kind of kitchen space, opposite emotional state). Ready-to-paste prompt in `PROMPTS.md` — built to lock Emma's face/hair/build from her existing character sheet so she reads as the *same person* from Scene 2.

---

## SCENE 12 — End Card / CTA
**~0:41–0:45 (or /0:41–0:60 if stretched)**

> VO/text: "Sprout. Finally, a group chat that actually works." — joinsprout.co

**Visual:** logo hold, tagline, URL, clean.

**Status:** 🆕 BUILT → `mockups/scene12-end-card.png`
Your existing hero comp (`../Generated_Image...(3).jpeg`, "SPROUT / Family Technology / The Village for Parents") is beautiful but too busy for a 3–4 second end card — it's got a full lifestyle photo, three lines of headline, and a second tagline all competing for a beat that only has a few seconds. Built a stripped-down version: cream background, clover + wordmark, the exact closing line from the script in Playfair italic, and `joinsprout.co` in Inter underneath — same brand tokens as your landing page, nothing new to design, just simplified for the time you'll actually have on screen.

---

## What's already in the folder but NOT used in Video 1

Flagging so nothing gets lost — these exist and are good work, they just don't map to a beat in *this* script:

- **David (dad) full character sheet** — no dad-focused line in this script. Save for Video 2 if Tony's next script includes him.
- **Liam (kid) full character sheet** — same, no kid-POV beat here.
- **`../Mother_and_child_in_kitchen_….mp4`** — nice footage, but nothing in this script calls for a mother+child moment specifically (the script is solo-mom → community, not solo-mom → her-own-kid). Hold for Video 2 or as generic warm B-roll if you need a cutaway.
- **Full "SPROUT Family Technology / Village for Parents" hero comp** (`../Generated_Image...(3).jpeg`) and the **"family in living room" comp** (`../Generated_Image...(6).jpeg`) — both great, but too dense/long a beat for a 45–60s teaser. Good candidates for a longer-form Video 2 or for static social posts.

---

## Summary — what YOU still need to actually produce

1. **Scene 11 "calm coffee mom"** — the one true photoreal AI-gen you still need to run. Prompt is in `PROMPTS.md`, paste into whatever tool made your Emma sheets (looks like it was Sora/ChatGPT image-gen from the filenames).
2. **Motion/animation on the built stills** — every 🆕 BUILT PNG in `mockups/` (Scenes 1, 2, 4, 6, 7, 8, 9, 10, 12 — 9 total) is a static frame. You'll animate these the same way you'd animate Scene 4's logo reveal: img2video (Kling/Seedance/Sora) for subtle push-ins, or a straight Ken-Burns pan in your edit tool if you don't want to spend gen credits on UI screens.
3. **Voiceover** — see `VO-SCRIPT.md`, clean read, ready for you or a TTS voice (MiniMax/ElevenLabs) to record against.
4. **Music + SFX** — chaotic/tense bed for Scenes 1–3, warm/uplifting bed from Scene 4 on, notification-ding SFX piling up in Scene 2, soft whoosh/chime on the Scene 4 logo reveal.
5. **Final assembly** — cutting all of the above together with on-screen text captions (Reels/TikTok are watched muted) — build one caption template (Playfair Display headline / Inter body, brand green on cream) and reuse it across every VO line rather than hand-styling each one.

Tony's own runtime note stands: cut Scene 8 (iMessage/WhatsApp) + Scene 9's camps/sports line to hit 30s tight, or add a testimonial beat / a second mom moment after Scene 11 to stretch to 60s.
