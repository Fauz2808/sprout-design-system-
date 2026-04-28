# Sprout Component Gaps

Cross-referencing the **13 components** already built on the Components page (`2:6772`) against the **47 candidates** identified in `Componentization-Candidates.md`.

---

## ✅ Already built — nice work

| Component | Variants | Notes |
|---|---|---|
| **Button** | **128** (Type × Size × State × IconOnly) | Primary / Secondary / Tertiary / Destructive × L / M / S / XS × Default / Hover / Focused / Disabled × Icon-only true/false. Best in the system. |
| **Input Form** | 10 (State × Size) | Normal / Focused / Filled / Disable / Error × Large / Medium. Plus a second "Input Form 1" set — likely an older duplicate to merge. |
| **Text Area** | 4 (State) | Default / Focused / Filled / Error. |
| **Indicator** | 2 (Type) | Status Bar + Home Indicator — covers iOS system chrome. |
| **Navigation Bar** | 5 (Type) | Home / Memories / AI Assist / Chat / Clubs — bottom tab nav tokens. |
| **Shimmering New** | 3 (State) | Skeleton / loading state. |
| **Pulse Button** | 4 (Property 1) | Custom animated CTA. |
| **Typing Bar** | 2 (Property 1) | Chat typing indicator. |
| **Chat Illustration** | 1 | Empty-chat hero image. |
| **Parent Role Selection** | 4 (Type) | Mom / Dad / Guardian / Step Parent (onboarding). |
| **Kids Gender** | 6 (Type × State) | Boy / Girl / Other × Default / Active (onboarding). |
| **Tab Bar** | 2 (Type) | Discover / My Events (in-screen tabs). |
| **Event meta chips** | 4 (standalone frames) | Distance (Compass + miles), Price (Ticket + entry), Time (Clock + hours), Rating (Star + score). Not yet a component — should become `EventMeta`. |

Plus `Annotation / Label` which is design-system documentation, not an app component.

---

## ❌ Still to build — 23 gaps

Ordered by **impact** (occurrences × screens × system leverage). Pick them top-to-bottom.

### Tier 1 — Global skeleton (build these first, they appear on almost every screen)

| # | Component | Occurrences | Screens | Why it's #N |
|---|---|---:|---:|---|
| 1 | **Header** | 243 | 133 | Every app screen has one. Drift here propagates everywhere. |
| 2 | **Bottom CTA** (fixed bottom button holder) | 84 | 71 | Most action screens. Safe-area + button composition. |
| 3 | **Avatar** (xs / sm / md / lg / xl) | 263 | 34 | Chat, clubs, memories, onboarding, profile. Highest reuse of any visual element. |
| 4 | **IconButton** (sm / md) | 103+ | 30+ | Search trigger, menu, mic, profile-open, chat actions. Your Button has Icon-Only variants but they're sized for text buttons, not the standalone 32/40 circular actions. |

### Tier 2 — Content primitives (content screens hinge on these)

| # | Component | Occurrences | Screens | Why |
|---|---|---:|---:|---|
| 5 | **UserMeta** (name + title / time / tag) | 296 | 20+ | Already the #1 item by raw volume. Used in every chat row, comment, member row, list row. |
| 6 | **Chip** (xs / md, variants: filter / count / tag / club) | 105 | 18 | Filter bars, inline counts, club tags, reply counts. |
| 7 | **Event Card** (compact / default) | 16 | 2 (high within-screen reuse) | Discover + My Events depend on it. |
| 8 | **ListRow / Member Row** | 24 | 11 | Clubs members, comments, park details. |
| 9 | **SettingsRow** (List Menu) | 6 | 2 | Profile + Manage Club — icon + label + chevron. |

### Tier 3 — Layout & feedback

| # | Component | Occurrences | Screens | Why |
|---|---|---:|---:|---|
| 10 | **SectionHeader** (Title + Desc) | 46 | 33 | Every form / section intro. |
| 11 | **EmptyState** | 10 | 10 | Empty inboxes, empty clubs, empty memories. |
| 12 | **ProgressLine** (onboarding step dots) | 128 | 27 | Every onboarding screen. |
| 13 | **NotificationRow** | 22 | 2 (Notifications list) | One row style, many entries. |

### Tier 4 — Chat + Memories

| # | Component | Occurrences | Screens | Why |
|---|---|---:|---:|---|
| 14 | **ChatBubble** | 47 | 7 | Core chat element. |
| 15 | **ChatMessageRow** (avatar + bubble wrapper) | 83 | 13 | Wraps bubble with avatar + timestamp. |
| 16 | **ChatListRow** (chat home preview) | 52 | 4 | Chat list home page. |
| 17 | **Comment** | 38 | 7 | Memory comment cards. |
| 18 | **CommentThread** container | 78 | 8 | Split from Comment (same old name today). |
| 19 | **ChatComposer** (text input + send/mic) | 5 | 5 | Distinct from Typing Bar; this is the composer at the bottom of chat threads. |

### Tier 5 — Sheets & pickers

| # | Component | Occurrences | Screens | Why |
|---|---|---:|---:|---|
| 20 | **Sheet** (bottom sheet) | 9 | 9 | All bottom-sheet modals. |
| 21 | **Dialog** (centered confirm) | 4 | 4 | Leave club, remove member, destructive confirms. |
| 22 | **DatePicker** | 11 | 11 | Event creation, date filters. |
| 23 | **Calendar** (inline grid) | 8 | extracted from DatePicker | Shared base for DatePicker + standalone. |

---

## Small / optional additions

- **Badge** (notification count dot) — 21 occurrences, three sizes.
- **Switch** (toggle) — 7 occurrences, verify the 120×120 one is a toggle or something else.
- **SearchField** — only 3 occurrences; worth it if search becomes more prominent, otherwise skip.
- **EventMeta** — compose the four existing meta chips (Distance / Price / Time / Rating) into one `EventMeta` component with a `kind` prop.

---

## Recommended build order (next four sessions)

**Session 1 — Header + Bottom CTA** — biggest ROI. Headers especially show up on 133 screens; once this is a component you can swap every existing Header instance in minutes.

**Session 2 — Avatar + IconButton** — the two primitives that compose into almost every content component later (UserMeta, ListRow, ChatMessageRow all depend on Avatar).

**Session 3 — UserMeta + Chip + ListRow** — content skeleton. With these three plus Avatar and IconButton, 70% of your screens can be rebuilt from components.

**Session 4 — Event Card + SectionHeader + EmptyState + ProgressLine** — finishes the Home / Onboarding / Empty-state coverage.

Chat, Comments, Sheets, Dialogs, DatePicker = later sessions, lower priority because they're confined to specific areas of the app.

---

## What I need from you to build these

For each component, I'll walk you through:

1. **Frame setup** — exact size, auto-layout direction, padding.
2. **Variable bindings** — width/height/radius/padding bound to tokens from `Size-Scale.md`.
3. **Variant set** — which properties and which values per property.
4. **Slots** — where to nest instances of other components (e.g. Header nests IconButton).
5. **Swap existing instances** — after the component is built, how to point old frames at the new component.

We go one at a time. When you're ready, say the name (or say "start with the top one") and I'll produce the build sheet for that component.
