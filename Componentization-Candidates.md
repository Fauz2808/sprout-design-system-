# Componentization Candidates — Sprout App

**Figma file:** Sprout Design (Prod) · root node `1744:66932`
**Scope:** All 173 screens in the ordered flow (splash → onboarding → home → chat → clubs → events → memories → profile → live activities → updates).
**Threshold:** Anything repeated **2+ times** across screens that is currently built as an ad-hoc `<frame>` and is **not** already a `<instance>` of a component.
**Method:** Full-tree scan of Figma metadata (5,313 non-root frames), grouped by layer name, size banded, and cross-referenced against screens.

---

## TL;DR — Top 10 to componentize first

Sorted by impact (occurrences × unique screens × system leverage):

| # | Pattern | Occurrences | Screens | Why it matters |
|---|---|---|---|---|
| 1 | **Header** (top nav + title) | 243 | 133 | Global pattern — drift here scales to every screen |
| 2 | **Bottom Button** (fixed bottom CTA) | 84 | 71 | Appears on most action screens; safe-area + button composition |
| 3 | **Button Container** (inline CTA wrapper) | 110 | 80 | Form and dialog action rows |
| 4 | **Input / Input Form Container** | 140 | 51 | Form field — label + input + helper |
| 5 | **Tab Section + Tab bar** | 54 | 14+ | Home/Chat/Clubs/Memories main nav |
| 6 | **Profile Picture / Avatar Container** | 195 | 34 | User imagery everywhere |
| 7 | **Event Card** | 16 | 2 (plus high reuse within screens) | Card primitive for Home & My Events |
| 8 | **Chat Bubble** + **Chat Container** | 130 | 13 | Core chat composition |
| 9 | **Comment / Comment Container** | 116 | 8 | Memories comment pop-ups |
| 10 | **Pop Up Modal / Dialogue Box** | 13 | 13 | Confirmation dialogs and bottom sheets |

---

## 1. Global / Navigation patterns

These are the highest-leverage candidates. Any change propagates to most of the app.

### 1.1 Header (page header with indicator + title)
- **Occurrences:** 243 across **133** unique screens.
- **Consistent sizes:** 393×96 (outer wrapper with status indicator) and 393×56 (inner title bar).
- **Structure:** wraps the `Indicator` instance (status bar) plus a 56-high title bar with optional back button (`CaretLeft` instance) and title text.
- **Variant notes:** same width (393), mostly same height; some screens use back-button + title, some use title only, some include a right-side action (QR, share, edit).
- **Recommended props:**
  - `title: string`
  - `leftAction: 'back' | 'close' | 'none'`
  - `rightAction: slot` (single icon button, e.g. QR, share, kebab)
  - `showStatusIndicator: boolean`
  - `variant: 'default' | 'transparent' | 'dark'` (Chat + Details use a darker variant)
- **Sample node IDs:** `1744:66935`, `1744:66937`, `1744:66964`, `1744:66993`
- **Confidence:** **High**

### 1.2 Bottom Button (fixed bottom CTA slot)
- **Occurrences:** 84 across **71** unique screens.
- **Consistent width:** 393. Heights: 118 (one CTA), 375 (CTA + keyboard-safe extra content).
- **Structure:** full-bleed wrapper that holds a primary `Button` instance inside a `Button Container`, plus safe-area padding.
- **Variant notes:** 1-button, 2-button, and keyboard-visible modes.
- **Recommended props:**
  - `primary: Button`
  - `secondary?: Button` (stack vertically or side-by-side)
  - `keyboardVisible: boolean`
  - `variant: 'solid' | 'elevated' | 'transparent'`
- **Sample node IDs:** `1744:66958`, `1744:66987`, `1744:67003`
- **Confidence:** **High**

### 1.3 Tab Section (top tabs row)
- **Occurrences:** 18 of **Tab Section** (393×42) wrapping 36 of **Tab bar** (196.5×42). Found on **14** screens.
- **Structure:** full-width container that holds two or more tab items.
- **Recommended props:**
  - `tabs: Array<{label, selected}>`
  - `underlineStyle: 'fill' | 'line' | 'dot'`
- **Sample node IDs:** `Tab Section` `1744:67128`, `Tab bar` `1744:67129`
- **Confidence:** **High**

### 1.4 Navigation Bar (iOS home indicator bar)
- **Occurrences:** 9 across **9** screens. 393×34, always identical.
- **Note:** This is the iOS home-indicator bottom bar. Likely should be a base-layer component (same as Status Bar).
- **Sample node IDs:** `1744:68875`, `1744:68918`, `1744:70941`
- **Confidence:** **High**

### 1.5 Status Bar (iOS system status strip)
- **Occurrences:** 4 across **4** screens. 393×40, always identical.
- **Note:** Already partly captured as `Indicator` instance inside Header. These standalone Status Bar frames exist where Header is absent (image-preview screens). Merge into one shared primitive.
- **Sample node IDs:** `1744:75115`, `1744:75644`, `1744:80454`
- **Confidence:** **High**

### 1.6 Profile and Hamburger Menu (top-right icon button, 32×32)
- **Occurrences:** 19 across **15** screens. Fixed 32×32.
- **Note:** Likely represents the circular profile/menu button in the top-right. Could be an **IconButton** primitive with an avatar variant.
- **Sample node IDs:** `1744:67115`, `1744:67301`, `1744:67510`
- **Confidence:** **High**

---

## 2. Cards & Containers

### 2.1 Event Card
- **Occurrences:** 16 across **2** screens, but with high within-screen reuse (Discover Events + My Events).
- **Sizes:** 361×167 and 343×150.
- **Structure:** cover image + overlay title + date/place row.
- **Variant notes:** two sizes (`compact` 343×150 vs. `default` 361×167).
- **Recommended props:**
  - `coverImage: string`
  - `title: string`
  - `dateAndPlace: string`
  - `rsvpStatus?: 'going' | 'interested' | 'none'`
  - `size: 'compact' | 'default'`
- **Sample node IDs:** `1744:68770`, `1744:68771`, `1744:68795`
- **Confidence:** **High**

### 2.2 Card (generic) / Card Container
- **Card:** 4 occurrences, all 343×150 (on My Events only).
- **Card Container:** 7 occurrences across 7 screens (Dynamic Island + Live Activities). Sizes 324-393 × 70-164.
- **Recommendation:** standardize a **Card** base with `small`, `default`, and `banner` variants; treat Card Container as the `banner` variant used by Live Activities notifications.
- **Sample node IDs:** `Card` `1744:68772`, `Card Container` `1744:72737`, `1744:72785`
- **Confidence:** **Medium-High**

### 2.3 Event Container (event details panel)
- **Occurrences:** 7 across **4** screens (Discover Events / Sub-category).
- **Consistent size:** 393×373 (hero + details).
- **Recommendation:** this is closer to a *section* than a reusable card, but the structure is repeated verbatim — worth componentizing with slots.
- **Sample node IDs:** `1744:70652`, `1744:70805`, `1744:79143`
- **Confidence:** **Medium**

### 2.4 Notification Block / Notification Container
- **Occurrences:** 22 **Notification Block** (393×55/73) across **2** screens; 6 **Notification Container** across **2** screens.
- **Structure:** left icon + title + timestamp + trailing action or dismiss.
- **Recommended props:**
  - `title: string`
  - `timestamp: string`
  - `leadingIcon?: Icon`
  - `actionSlot?: slot` (e.g. "View", "Join")
  - `state: 'read' | 'unread'`
- **Sample node IDs:** `1744:72514`, `1744:72515`, `1744:72523`
- **Confidence:** **High**

### 2.5 Member Row
- **Occurrences:** 10 across **9** screens (Memories, Club members).
- **Consistent size:** 393×98.
- **Structure:** avatar + name + title + right-side action (follow, kebab).
- **Recommended props:**
  - `avatar: Avatar`
  - `name: string`
  - `subtitle?: string`
  - `trailing?: slot`
  - `state: 'default' | 'added' | 'removed'`
- **Sample node IDs:** `1744:67179`, `1744:67365`, `1744:67574`
- **Confidence:** **High**

### 2.6 Table cell (Park & Playground list rows)
- **Occurrences:** 14 across **2** screens. Consistent 361×72.
- **Structure:** avatar + primary text + secondary text + timestamp/metadata.
- **Note:** Different pattern from Member Row — this one is denser and used for Park details. Could be one **ListRow** component with density prop.
- **Sample node IDs:** `1744:73587`, `1744:73596`, `1744:73605`
- **Confidence:** **Medium-High**

### 2.7 List Menu (settings-style row)
- **Occurrences:** 6 across **2** screens (Profile + Manage Club). Fixed 329×63.
- **Structure:** icon + label + chevron. Classic settings row.
- **Recommended props:** `icon`, `label`, `destructive?: boolean`, `trailing: 'chevron' | 'switch' | 'value'`
- **Sample node IDs:** `1744:71678`, `1744:71685`, `1744:72473`
- **Confidence:** **High**

---

## 3. Form & Input

### 3.1 Input
- **Occurrences:** 107 across **24** unique screens.
- **Structure:** label + text field + helper/error text.
- **Size range:** 358 width, heights 48-135 depending on helper presence.
- **Recommended props:** `label`, `placeholder`, `value`, `helperText`, `error`, `type: 'text' | 'email' | 'password' | 'search' | 'phone'`
- **Sample node IDs:** `1744:67057`, `1744:72190`, `1744:72330`
- **Confidence:** **High**

### 3.2 Input Form Container
- **Occurrences:** 33 across **27** screens. 347-361 wide × 76-246 high.
- **Structure:** wraps 1-N Input fields plus a submit area.
- **Recommended props:** `children: Input[]`, `spacing`, `submit?: Button`
- **Sample node IDs:** `1744:67001`, `1744:67018`, `1744:67036`
- **Confidence:** **High**

### 3.3 Chips
- **Occurrences:** 105 across **18** screens.
- **Sizes:** 185×28 (large filter chip) and 38-40×19 (inline tag/count).
- **Variant notes:** two clear sizes (likely `md` vs. `sm`).
- **Recommended props:** `label`, `selected?`, `leadingIcon?`, `removable?`, `size: 'sm' | 'md'`, `variant: 'filter' | 'tag' | 'count'`
- **Sample node IDs:** `1744:68977`, `1744:69162`, `1744:69279`
- **Confidence:** **High**

### 3.4 Search Container (full search bar)
- **Occurrences:** 3 across **3** screens. Consistent 393×36.
- **Structure:** rounded-rect text field with search icon + placeholder.
- **Sample node IDs:** `1744:75028`, `1744:76788`, `1744:80194`
- **Confidence:** **High**

### 3.5 Search and Compose (chat compose bar)
- **Occurrences:** 5 across **5** screens. Consistent 361×36.
- **Structure:** text input + mic/send button on the Chat home.
- **Note:** different pattern from Search Container — this one has a trailing action. Two distinct components.
- **Sample node IDs:** `1744:69725`, `1744:69933`, `1744:69966`
- **Confidence:** **High**

### 3.6 Search bar (icon-only 40×40)
- **Occurrences:** 19 across **15** screens. Fixed 40×40.
- **Note:** This is the search *trigger* icon, not a full search bar. Likely an **IconButton** variant — covered by 1.6 / IconButton.
- **Sample node IDs:** `1744:67124`, `1744:67310`, `1744:67519`
- **Confidence:** **Medium** (reconcile with IconButton)

### 3.7 Datepickers
- **Occurrences:** 11 across **11** screens. Consistent 361×418/431.
- **Structure:** calendar grid + time scroller + confirm.
- **Recommended props:** `mode: 'date' | 'time' | 'datetime'`, `minDate`, `maxDate`, `onConfirm`
- **Sample node IDs:** `1744:76111`, `1744:76286`, `1744:76461`
- **Confidence:** **High**

### 3.8 Calendar (inline)
- **Occurrences:** 8. Part of Datepickers but also used standalone.
- **Recommendation:** Extract the calendar grid as its own primitive so Datepickers and standalone uses share.
- **Confidence:** **Medium**

### 3.9 Switch (toggle control)
- **Occurrences:** 7 across **6** screens. Sizes 52×52 (inline) and 120×120 (onboarding feature toggle — may actually be a different element).
- **Recommendation:** verify the 120×120 one manually; the 52×52 looks like a toggle switch row.
- **Sample node IDs:** `1744:72465`, `1744:78302`, `1744:78371`
- **Confidence:** **Medium** (size split suggests two different elements under the same name)

---

## 4. Chat patterns

### 4.1 Chat Bubble
- **Occurrences:** 47 across **7** screens. Widths 112-393, heights 52-121.
- **Structure:** message text bubble, sometimes with attached media/reactions.
- **Recommended props:** `message`, `sender: 'me' | 'them'`, `hasReactions?: boolean`, `attachmentType?: 'image' | 'event' | 'none'`, `timestampPosition`
- **Sample node IDs:** `1744:73795`, `1744:73807`, `1744:73819`
- **Confidence:** **High**

### 4.2 Chat Container (message row wrapper)
- **Occurrences:** 83 across **13** screens. Consistent 299 wide × 36/54 tall.
- **Structure:** avatar + bubble column + timestamp.
- **Recommended props:** `avatar`, `bubble: ChatBubble`, `timestamp`, `showAvatar: boolean` (threaded replies hide avatar)
- **Sample node IDs:** `1744:72518`, `1744:72530`, `1744:72540`
- **Confidence:** **High**

### 4.3 Messages Profile (Chat home list row)
- **Occurrences:** 52 across **4** screens. 337/361 wide × 41-72 tall.
- **Structure:** avatar + name + latest-message preview + unread badge + timestamp.
- **Recommended props:** `avatar`, `name`, `lastMessage`, `timestamp`, `unreadCount?`, `state: 'read' | 'unread' | 'muted'`
- **Sample node IDs:** `1744:69734`, `1744:69750`, `1744:69766`
- **Confidence:** **High**

### 4.4 Reply Box
- **Occurrences:** 8 across a few chat screens. Structure: quoted-message preview above input.
- **Recommendation:** part of the Chat compose pattern; bundle with `Search and Compose`.
- **Confidence:** **Medium**

### 4.5 Emoji Container (reaction picker)
- **Occurrences:** 8 within the Add Reaction screen, sizes 24×24 (single) and 231×32 (row).
- **Recommendation:** one `EmojiReactionRow` component with the `emoji-button` as an inner primitive.
- **Confidence:** **Medium**

### 4.6 Reply Button (inline "Reply" action under a message)
- **Occurrences:** 32 across **7** screens.
- **Note:** The 275×15 size is actually the text-style variant; 33×19 is a small pill. Likely maps to **Chips — tag/count** variant.
- **Confidence:** **Medium** (reconcile with Chips)

---

## 5. Comments (Memories)

### 5.1 Comment Container (single comment block)
- **Occurrences:** 38 across **7** screens. Heights vary 62-723 (hosts many comments).
- **Structure:** avatar + name + comment body + reactions row + Reply action.
- **Recommended props:** `avatar`, `name`, `body`, `timestamp`, `reactions?: Reaction[]`, `replies?: Comment[]`
- **Confidence:** **High**

### 5.2 Comment (individual)
- **Occurrences:** 78 across **8** screens (same Memories family). The huge size variance (28×48 to 393×917) suggests the same layer name is reused for both single-comment and comment-list frames.
- **Recommendation:** audit names — split into `Comment` (single) and `CommentThread` (container) before componentizing.
- **Confidence:** **Medium** (name collision)

### 5.3 Members Profile (comment author stack)
- **Occurrences:** 30 across **9** screens. Consistent 57 wide × 62-82 tall.
- **Structure:** small circular avatar + name below.
- **Recommended props:** `avatar`, `name`, `showName: boolean`
- **Confidence:** **High**

---

## 6. Social / User primitives

### 6.1 Profile Picture
- **Occurrences:** 127 across **18** screens. Two fixed sizes: **52×52** (member/comment rows) and **42×42** (club member lists).
- **Recommended props:** `image`, `fallbackInitials`, `size`, `showBadge?`, `badgeType?: 'online' | 'camera' | 'plus'`
- **Sample node IDs:** `1744:68984`, `1744:69003`, `1744:69021`
- **Confidence:** **High**

### 6.2 Avatar Container (sized avatar wrapper)
- **Occurrences:** 68 across **16** screens. Two clear sizes: 40×40 (chat/inline) and 64×64 (onboarding).
- **Recommendation:** one **Avatar** component with size prop `xs / sm / md / lg` — use 40, 52, 64 as the standard steps.
- **Sample node IDs:** `1744:69275`, `1744:69282`, `1744:77025`, `1744:77212`
- **Confidence:** **High**

### 6.3 Indicator and Badge (avatar with online/status dot)
- **Occurrences:** 16 across **3** Clubs screens. Sizes 55-70 × 39-43.
- **Recommendation:** merge as the "badged" variant of **Avatar**.
- **Sample node IDs:** `1744:68995`, `1744:69013`, `1744:69031`
- **Confidence:** **High**

### 6.4 Name and Title / Name and Time / Name and Tag (user-info text stacks)
- **Name and Title:** 179 occurrences across **12** screens.
- **Name and Time:** 101 × **14** screens.
- **Name and Tag:** 16 × **3** screens.
- **Recommendation:** one **UserMeta** text-composition component with props: `name`, `secondary` (title / time / tag), `secondaryType: 'role' | 'timestamp' | 'tag'`, `weight: 'regular' | 'bold'`.
- **Confidence:** **High**

### 6.5 Logo and Address (brand + location small row)
- **Occurrences:** 10 across **7** screens. Fixed 62×24.
- **Structure:** small Sprout-style logo + location text.
- **Note:** used in Home top-left and some sub-category headers.
- **Confidence:** **Medium**

### 6.6 Social Club (club tag chip)
- **Occurrences:** 9 across **8** screens. Fixed 116×32.
- **Recommendation:** a tag-style chip with a club icon — may be a specific variant of **Chips**.
- **Confidence:** **Medium** (reconcile with Chips)

### 6.7 Date and Place (event-card meta row)
- **Occurrences:** 31 across **5** screens. Fixed ~145×42.
- **Structure:** icon + date + dot + place.
- **Recommendation:** include as a slot inside **Event Card** rather than a separate component. If extracted, call it **EventMeta**.
- **Confidence:** **Medium**

---

## 7. Feedback / State patterns

### 7.1 Empty State Content
- **Occurrences:** 10 across **10** screens. Fixed 361×161.
- **Structure:** illustration + title + description + CTA.
- **Recommended props:** `illustration`, `title`, `description`, `cta?: Button`
- **Sample node IDs:** `1744:77024`, `1744:77211`, `1744:77290`
- **Confidence:** **High**

### 7.2 Progress Line (onboarding progress indicator)
- **Occurrences:** 128 across **27** screens. Thin horizontal bar (height 2).
- **Structure:** multiple segments that represent onboarding steps.
- **Recommended props:** `totalSteps`, `currentStep`, `variant: 'dots' | 'line'`
- **Sample node IDs:** `1744:76871`, `1744:76872`, `1744:76873`
- **Confidence:** **High**

### 7.3 Title and Desc (section header)
- **Occurrences:** 46 across **33** screens.
- **Structure:** big title + multi-line description beneath.
- **Recommended props:** `title`, `description`, `align: 'left' | 'center'`, `size: 'h1' | 'h2'`
- **Confidence:** **High**

---

## 8. Modals, Sheets, Dialogs

### 8.1 Pop Up Modal (bottom sheet)
- **Occurrences:** 9 across **9** screens. 393×608 and 393×728.
- **Structure:** full-width rounded-top sheet with drag handle + content.
- **Recommended props:** `height: 'auto' | 'default' | 'tall'`, `showDragHandle`, `children: slot`
- **Confidence:** **High**

### 8.2 Pop Up (AI Chat overlay)
- **Occurrences:** 4 across **4** Create-Event AI screens. 393×516 and 393×807.
- **Note:** different from Pop Up Modal above — this one is a full-bleed AI overlay. Separate component or a `variant: 'ai-chat'` of the same.
- **Confidence:** **Medium**

### 8.3 Dialogue Box (confirmation dialog)
- **Occurrences:** 4 across **4** screens (Leave Club, Remove Member, etc.).
- **Sizes:** 320/361 × 175-314.
- **Structure:** centered card with title + description + **Action Button** row.
- **Recommended props:** `title`, `description`, `primaryAction`, `secondaryAction`, `destructive?: boolean`
- **Sample node IDs:** `1744:71415`, `1744:72185`, `1744:72325`
- **Confidence:** **High**

### 8.4 Action Button (dialog footer button)
- **Occurrences:** 4 across **4** dialog screens. 272/329 × 52.
- **Recommendation:** this is likely a size variant of the existing **Button** instance (`size: 'dialog'`) rather than its own component.
- **Confidence:** **Medium** (reconcile with Button)

---

## 9. Onboarding & Flow patterns

### 9.1 Add Child (pop-up form stages)
- **Occurrences:** 12 across **12** screens. Consistent 361 width, heights 214-419.
- **Structure:** avatar upload + kid name + age + interests, presented in a bottom sheet.
- **Recommendation:** complex — may not need to be a single component; better as a template. Flag for design review.
- **Confidence:** **Medium**

---

## 10. Lower-priority / ambiguous — review before extracting

These repeat enough to meet the 2+ threshold but are either inconsistent, too generic, or likely covered by another candidate.

| Pattern | Count | Notes |
|---|---|---|
| **Row** | 117 | Generic name with huge size variance (45-321 w, 28-39 h). Used for many distinct things. Rename locally before componentizing. |
| **Button** (as frame, not instance) | 191 | Mixed: some are 361-wide large containers, some are 32×32 icon buttons. Split these — icon-sized ones probably map to **IconButton**. |
| **Title** | 84 | Text-only layer with huge width variance. Typography token candidate, not a component. |
| **Time** | 92 | Same — typography/text style, not a component. |
| **Note** | 87 | 16×16 consistent — likely the "!" / info dot icon; already covered by icon instances. |
| **Mic** | 52 | 34×34 consistent — an icon button. Covered by **IconButton**. |
| **Badge** | 21 | 3 distinct sizes — split into a proper **Badge** with `sm/md/lg`. |
| **CTA / Label** | 27 / 29 | Likely text variants; treat as typography tokens not components. |
| **Card** (standalone) | 4 | Covered by Event Card variant. |
| **First Row / Second Row / Contact Row 1-4** | 5-8 each | Bad naming — one component + data. |
| **Group Member / More Member** | 10 / 6 | Covered by Member Row. |

---

## 11. Explicit false positives — **do not componentize**

Found by the raw scan but identified as Figma auto-artifacts or external-library leakage:

- **Mask group** (103 occurrences) — auto-generated by Figma when you clip an image (e.g. circular avatars). Not a design pattern.
- **Saas co** (79 occurrences) — all 32×32, from the imported "Saas co." illustration/icon library. Replace usage with design-system icons; don't make a component.

---

## 12. Already-componentized (for reference, excluded from the candidate list)

These were detected as `<instance>` nodes in the scan and should continue to be the source of truth:

- `Indicator` — status bar (already an instance, 40 high, appears in nearly every Header)
- `CaretLeft`, `GlobeSimple`, `Microphone`, and various other Phosphor icons — icon library
- `Button` — exists as a 310-instance component. The 191 `<frame name="Button">` nodes flagged are **wrappers** (container + padding), not raw buttons — reconcile those wrappers into the new **Button Container** / **Bottom Button** components.

---

## Summary

| Metric | Value |
|---|---|
| Screens scanned | 173 |
| Frames analyzed | 5,313 |
| High-priority candidates | 24 |
| Medium-priority candidates | 11 |
| Low-priority / reconcile candidates | 12 |
| Explicit false positives | 2 |

### Suggested build order (4 sprints)

1. **Sprint 1 — Foundation layer.** Status Bar, Navigation Bar, Header, Bottom Button, Button Container, Input, Input Form Container, Avatar/Profile Picture.
2. **Sprint 2 — Content primitives.** Event Card, Card (generic), Member Row, Table cell (List Row), List Menu, Title and Desc, Empty State Content, Progress Line.
3. **Sprint 3 — Chat + Memories.** Chat Bubble, Chat Container, Messages Profile, Comment / Comment Container, Members Profile, Search and Compose.
4. **Sprint 4 — Sheets + Pickers.** Pop Up Modal, Dialogue Box, Datepickers, Calendar, Chips (rationalized), Badge, Tab Section / Tab bar.

### Before you build

1. **Rename first.** Many "false positive" findings (Row, Button-frame, Time, Note) are noise from loose layer naming. A quick rename pass will cut the candidate list significantly and make future audits more reliable.
2. **Reconcile duplicates.** Several items overlap (IconButton vs. Search bar vs. Profile and Hamburger Menu; Button vs. Action Button; Avatar Container vs. Indicator and Badge vs. Profile Picture). Decide the canonical name per family before creating variants.
3. **Agree on size scale.** Multiple components (Avatar, Button, Chips) need a shared size scale — pick `xs / sm / md / lg` and apply consistently.
