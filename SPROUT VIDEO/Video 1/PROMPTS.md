# ARCHIVED UI-FIRST PROMPT PACK

The approved production direction is now AI-first. Use `AI-FIRST-PROMPTS.md` for all new generations. This file remains as an archive of the earlier UI-first approach and the approved Scene 11 prompt.

# SPROUT — "Finally." — Generation Prompts

Copy-paste prompts for the gaps flagged in `SCENE-BREAKDOWN.md`. Two kinds:
1. **Photoreal image-gen** (needed once — Scene 11) — for whatever tool made your Emma/David/Liam character sheets (filenames suggest ChatGPT image-gen / Sora).
2. **Img2video motion prompts** — for animating the static PNGs in `mockups/` and the Scene 11 still once you have it (Sora, Kling, Seedance, Runway — whatever you used for the two existing 10s clips).

Keep every prompt anchored to the same style line used in your own character sheets so nothing drifts: **"Premium family technology commercial, photorealistic, soft natural lighting, warm neutral palette, editorial commercial photography, shallow depth of field."**

---

## 1. Scene 11 — "Calm, coffee-in-hand mom" (REQUIRED — the one true gap)

**GENERATION GATE: OPEN.** The 12-scene 9:16 animatic is now complete. Generate this scene in two passes: first an approved 9:16 keyframe, then a five-second image-to-video clip. Do not generate the UI scenes with a video model.

This is the emotional mirror of the Scene 2 chaos shot. It needs to read as *the same woman*, just resolved. If your tool supports reference/character-lock images, attach `Generated_Image_July_30,_2026_202607312032.jpeg` (Emma's solo character sheet — front portrait, side profile, expressions) as face reference, plus `(2).jpeg` (the Emma/David comparison sheet) if you want a second angle. If it doesn't, use the full written description below — it's lifted directly from your own Emma character sheet so she stays consistent.

**Prompt:**

> Premium family technology commercial, photorealistic. EMMA — realistic 35-year-old American suburban mother, shoulder-length brown wavy hair, friendly approachable face, natural makeup, wearing a soft oatmeal-beige knit sweater. She is standing in a sunlit kitchen, morning light coming through a window behind her, holding a ceramic coffee mug in one hand and her phone in the other, glancing at the phone screen with a calm, faintly amused, unbothered smile — the opposite energy of someone overwhelmed. Warm neutral palette: cream walls, light wood counters, soft golden-hour light. Shallow depth of field, background softly blurred. Shot on a 35mm lens feel, editorial commercial photography style, no text overlays, no logos in frame. Slow, quiet, contented mood — this is the "after" to a "before" where she was drowning in notifications.

**Negative/avoid:** no stress expression, no phone screen text legible/readable, no other people in frame, no busy background clutter, don't put a Sprout logo anywhere in this shot (it stays purely lifestyle — logo comes back in Scene 12).

**Variant if you want her sitting instead of standing:** replace "standing in a sunlit kitchen... holding a ceramic coffee mug" with "seated at a kitchen island, both hands around a ceramic coffee mug, phone resting face-up on the counter next to her, glancing down at it."

### Approved production direction

Use these references in this order:

1. `../Generated_Image_July_30,_2026_202607312032.jpeg` as Emma identity reference.
2. `../Mother_overwhelmed_by_parenting_…_202607312033.mp4` as the before-state environment and wardrobe reference, if the model accepts a video reference.

Generate a vertical keyframe first. Emma must be alone, seated at the kitchen island with coffee and phone, wearing the same oatmeal sweater. Keep the phone screen blank for a controlled notification overlay in the edit.

### Scene 11 image-to-video prompt

> The same Emma from the supplied identity reference sits comfortably at a warm, sunlit kitchen island, wearing the same oatmeal-beige knit sweater. She holds a ceramic coffee mug loosely in one hand while her smartphone rests face-up beside her. The phone gives two small notification vibrations. Emma glances down, reads the screen, her shoulders relax, and she gives a quiet, genuine smile of relief. One continuous natural action, restrained acting, no dialogue and no lip movement. Premium family-technology commercial, realistic skin and hands, warm neutral home, soft morning window light, shallow depth of field. Mostly locked medium shot with an extremely slow push-in. Keep the phone display plain and unreadable for screen replacement in editing.

**Motion negative:** no generated text, no floating notifications, no holograms, no camera orbit, no dramatic grin, no laughter, no extra people, no wardrobe change, no deformed fingers, no warped mug, no sudden head movement, no lip sync.

**Delivery:** one five-second vertical clip. Preserve at least ten percent clean space above and below Emma for social safe zones. Export without generated music or dialogue.

---

## 2. Img2video motion prompts (animate the built stills)

Each of these takes one of the PNGs in `mockups/` (or Scene 11 once generated) as the first frame. Keep moves small — these are UI/graphic inserts, not action shots, so a hand-holding-a-phone level of stillness reads as more "real" than a big dolly move.

**Scene 1 — `scene01-numbers-chat.png`**
> Static phone screen, subtle handheld micro-movement as if someone is holding the phone and reading it, very slight vertical parallax, no scrolling, 3-4 seconds, calm/neutral energy, slightly anxious stillness.

**Scene 2 — `scene02-chaos-thread.png`**
> Phone screen with a group chat, camera holds mostly still but with a nervous, slightly faster micro-shake than scene 1, as if the person holding it is agitated, new message bubbles could pulse/appear if your tool supports UI animation, 3-4 seconds, tense energy.

**Scene 4 — `scene04-logo-reveal.png`**
> Clean cream background with centered clover logo and wordmark. Logo settles in with a soft scale-up from 92% to 100% and a gentle fade-in, wordmark fades in half a beat after the mark, no camera movement, calm and minimal, soft ambient light shift only, 2-3 seconds.

**Scene 6 — `scene06-profile-directory.png`**
> Phone screen showing a grid of family profile cards, slow vertical scroll drift as if a thumb is gently scrolling through the directory, 3-4 seconds, warm confident energy.

**Scene 7 — `scene07-calendar-reminder.png`**
> Phone lock screen with a notification banner sliding down from the top edge and settling, subtle bounce-and-settle physics, otherwise camera static, 2-3 seconds.

**Scene 9 — `scene09-friends-going.png`**
> Phone screen showing an activity/camp card with a row of avatars, tiny attention-grab pulse on the "RSVP" button, otherwise static hold, 3 seconds, upbeat energy.

**Scene 10 — `scene10-update-fanout.png`**
> Phone screen, message bubble already posted, small checkmarks on the recipient avatar row animating in one after another left to right as if delivery confirmations are landing in real time, 3 seconds.

**Scene 12 — `scene12-end-card.png`**
> Clean cream end card, logo and text already in frame, near-imperceptible slow zoom-in (102% over the full duration), calm hold, 3-4 seconds, this is the frame that sits under the final VO line and URL — needs to stay legible and still.

---

## 3. Scene 8 — iMessage / WhatsApp comparison (pending your call)

Not prompted here because it's a 3-icon infographic comparison, not a photoreal or character scene — AI image-gen tends to render app-icon logos and UI chrome badly/inaccurately (trademarked icons, wrong wordmarks). Recommend building this one directly as a motion graphic (three cards: iMessage bubble breaking green/SMS with an Android silhouette crossed out → WhatsApp icon with a "no community" crossed-out badge → Sprout clover with a checkmark), same cream/green brand tokens as everything else. If you want, tell me and I'll build it as a 9th HTML mockup like the others — happy to, just didn't want to guess at exact wording without you confirming you want a literal iMessage/WhatsApp likeness on screen (trademark-sensitive) versus a genericized "green bubble / other chat app" version.
