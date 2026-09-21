# Sprout app — three items signed off on 17 September

For Syed and Mohit. Everything here was reviewed by Tony on the 17 Sep call and
approved without conditions. Nothing in this file is a proposal; it is what to
build. Three items, in the order they are cheapest to do.

Open the prototypes in a browser. They are self-contained HTML — no build, no
install, no server.

---

## 1 · Join button says the headcount and nothing else

**File:** `08 - Generated Screens/Home/daily-brief-carpool-and-join.html`
(panel 2, "Join tapped")

The RSVP sheet's primary button currently reads `Join — 2 of us`. Tony:

> "Just say join one… you can even say join five here. I don't think you need
> *of us*."

So the label is the word Join, a space, and the total headcount:

| Selection | Button reads |
|---|---|
| 1 parent, no kids | `Join 1` |
| 1 parent, 1 kid | `Join 2` |
| 2 parents, 3 kids | `Join 5` |

The number is `parents + kids checked`. **Never pluralise it, never append a
noun.** `Join 1` is correct; `Join 1 person`, `Join 1 of us` and `Joining 1` are
not. When the headcount is zero the button is disabled, not relabelled.

The sheet itself is unchanged — the parents stepper, the kid checkboxes, and the
summary line all stay exactly as they are. This is a one-string change.

**One thing to sanity-check while you are in there.** Tony said "it says two
right now" in a tone that suggested he expected 1. In the prototype's state, 1
parent plus Mia checked really is 2, and the summary line above the button says
"1 parent and 1 kid", so the number is right. If the real app can ever show a
count that does not match the selection above it, that is a bug worth finding
now — it is the likelier explanation for what he saw.

## 2 · To-dos collapse when you are done with them

**File:** `08 - Generated Screens/Home/daily-brief-homepage.html`
(tap the "Needs your attention" header)

Already built and already reviewed. Tony: *"That's a great idea."*

The section header is the toggle. Tapping it collapses the list and rotates the
chevron; tapping again expands it. The behaviour exists in the prototype — read
`.todo-head.collapsed` and `.todo-head.collapsed + .todo-list` in its stylesheet
for the exact transition.

Ahmad's reasoning, which Tony agreed with: once your to-dos are done you want the
rest of the brief, not a list of ticked boxes taking the top of the screen.

Two things the prototype does **not** decide, so decide them with Tony rather
than guessing:

- Whether the collapsed state persists across app launches, or resets each day.
- Whether the section auto-collapses when the last item is ticked, or always
  waits for a tap. The prototype only does the manual tap.

## 3 · Sprout Assist keeps the existing Sprout logo

No file, no change — this is a decision to record so it does not get reopened.

Ahmad had drawn a separate, more photographic mark for Sprout Assist. Tony liked
it and still said no:

> "I love the Sprout Assist with the little Sprout logo, it's awesome… I wanna
> keep it like kind of like the same logo as what we already have. Otherwise we
> have to maintain a different logo."

So AI Assist uses the existing Sprout mark. Do not ship a second mark, and do not
add a variant to the asset pipeline.
