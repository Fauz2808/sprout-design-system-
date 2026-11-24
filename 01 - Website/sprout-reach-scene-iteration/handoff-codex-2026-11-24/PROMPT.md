# Prompt to paste into Codex

Start Codex with `~/Sprout` as the working folder, reasoning effort **high**. Paste the block below as the first
message. For each new piece of feedback after that, use the short follow-up prompt at the bottom.

---

## First message

```
You are taking over the Sprout website v3 home page (home-v3.html) from another agent. I'm Ahmad, the designer.

Before you change anything:
1. Read ~/Sprout/AGENTS.md (repo rules, they win on conflict).
2. Read "01 - Website/sprout-reach-scene-iteration/handoff-codex-2026-11-24/HANDOFF-CODEX-2026-11-24.md" fully.
3. Look at the reference images in that folder's refs/: current/ is how the page looks now, figma/ is the Figma
   frames it follows. Tony's copy brief is refs/tony-copy-design-brief-2026-11-20.pdf.
4. Start the local server and run the page check from section 6 of the handoff. It must print "ok" before you start.

Then tell me, in 5 lines or less: that you've read it, the check result, and that you're ready for feedback.
Do not change any file in this first turn.

Rules that matter most:
- Change only what I ask for. Don't invent new UI, copy, sections or animation.
- Reuse existing classes, parts and images. If something I ask for needs a part or image that doesn't exist,
  stop and ask me instead of drawing a new one.
- All page copy is final (Tony's brief). Don't rewrite it.
- Don't commit, push or deploy. I review and deploy.
- Before saying DONE on any change, run the page check (it must print "ok") and compare the new screenshots with
  refs/current/.
```

---

## Each piece of feedback after that

```
Feedback F<n> for home-v3 (handoff: handoff-codex-2026-11-24/HANDOFF-CODEX-2026-11-24.md):

<paste what you want changed, plus a screenshot if you have one>

Write it up as F<n> in the handoff's "Feedback items" (Change / Reuse / Do not / Check) before you edit. Change only
that. Run the page check, compare with refs/current/, then report: status, files + lines changed, what you reused,
what you checked. If anything is unclear or needs a new part, ask me first.
```

---

## When you're happy with a batch

Codex doesn't deploy. Come back to Claude, or run this yourself from `~/Sprout`:

```bash
cd ~/Sprout/"01 - Website/sprout-reach-scene-iteration" && vercel deploy --prod --yes
```

Review link after deploy: https://sprout-reach-scene-iteration.vercel.app/home-v3.html
