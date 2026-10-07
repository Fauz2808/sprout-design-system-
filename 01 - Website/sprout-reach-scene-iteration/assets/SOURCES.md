# Asset sources

The base assets are copied from ../sprout-reach-inspired/assets in the Sprout website workspace, retaining the supplied app designs and existing photography. No Reach artwork or logo is copied.

- community-meadow.webp: existing 1916 x 821 landscape, used in hero, moments, and closing scene.
- family-neighborhood.webp: existing 1536 x 1024 family scene.
- daily-brief-updated.png: latest supplied Daily Brief UI export matching Figma node 12397:208689.
- chat-updated.png: latest supplied Chat UI export matching Figma node 12398:209125.
- clubs-updated.png: Clubs UI captured from the supplied Figma node 12767:108049 and cropped to the selected mobile frame.
- events-updated.png: retained for the family-moments content outside the hero.
- sprout-assist-home.png: supplied 393 x 852 Sprout Assist export from the referenced Figma source (node 12687:108690).
- sprout-assist-reminder-figma.png: exact 393 x 852 PNG export from Figma node 12618:166183.
- sprout-assist-carpool-figma.png: exact 393 x 852 PNG export from Figma node 12618:166505.
- sprout-assist-event-figma.png: exact 393 x 852 PNG export from Figma node 12632:172323.
- sprout-assist-club-figma.png: exact 393 x 852 PNG export from Figma node 12632:172575.
- moments-events-meadow-v1.png / moments-events-meadow-v1.webp: generated with the built-in image generation tool for the Events family-moment card; wide rolling meadow with a winding path.
- moments-invitation-meadow-v1.png / moments-invitation-meadow-v1.webp: generated with the built-in image generation tool for the Invitation family-moment card; open wildflower meadow and distant hills.
- moments-chat-meadow-v1.png / moments-chat-meadow-v1.webp: generated with the built-in image generation tool for the Chat family-moment card; cool early-morning green valley.
- daily-brief-attention-card.png / birthday-invitation-card.png: previously supplied Figma card exports.
- hand-mom-iphone-17-pro-max.png / hand-mom-tap.png: existing transparent mom-hand assets copied from ../sprout-hand-interactive/assets for the interactive hero. The two floating card exports are no longer used in the hero.
- family-hills-closing-v1.png / family-hills-closing-v1.webp: generated specifically for the centered closing banner with the built-in image generation tool. The WebP is the optimized website asset; the PNG is retained as the lossless source.
- logo.png, app-store.png, play-store.png: existing Sprout and marketplace assets.
- class-chat.png: Figma node 8198:109904 (Miss Taylor Class, Chat tab). The last outgoing bubble still carried the retired "Meeting Point" app name; its text was replaced with neutral class copy, nothing else changed.
- class-calendar.png: Figma node 8766:154859 (Class Calendar, month view).
- class-updates.png: Figma node 8827:117674 (Updates list). The connected-account chip showed a real personal Gmail address and was painted out; the teacher address is the prototype's fictional one.
- class-links.png: Figma node 8845:135495 (Pinned links).
- daily-brief-attention-card-v2.png: daily-brief-attention-card.png with its subtitle changed from "Great you got everything for today" (contradicted the 1/3 ring) to "Two things left for today", per the 23 Sep empty-state logic.
- assist/*.png: raster pieces of the Sprout Assist rework in Figma section 12798:18362, exported at 1x: clover 12798:18370, menu icons 12798:18379/18387/18395/18403/18411, bell 12798:18450, orb 12798:18455, needed-information icons 12798:18464/18472/18480. matt.png and lydia.png are the stock avatars from the shared Daily Brief 12403:210488 (fictional people, no real parent data).
- assist/ai-blob-material.png: the approved Sprout AI blob material (`08 - Generated Screens/AI Companion/native/assets/sprout-ai-blob.png` on branch `codex/ai-blob-handover`, itself from `Onboarding/assets/sprout-ai-blob-v1-transparent.png`, approved by Ahmad 2026-09-17), downsized 1254 → 256 px (1.2 MB → 78 KB) because the web sphere renders at 48 design px. ai-blob-still.png is a 96 px still of the same file.
- thinking-orb.js: vanilla-canvas adapter of RareFormLabs/thinking-orbs v0.1.1, preserving its 64 px `listening` and `composing` presets and geometry. Its monochrome ink ramp is replaced with Sprout Brand/700, Brand/500, Brand/300, and Brand/50 tokens from the checked-in design system. Source: https://github.com/RareFormLabs/thinking-orbs. MIT license in `../vendor/THINKING-ORBS-LICENSE`.
- assist/grp-*, dm-*: cropped at 1x from Chat 12398:209125; assist/club-*, mem-*: from Clubs 12767:108049 (the two lowest avatars sat under the tab bar in the render and were not used); assist/bus.png from Daily Brief 12397:208780; assist/inv-zilker.png from the shared Daily Brief invitation 12403:210698 (the host avatar and name there are replaced with a fictional host, dm-robert.png).
- assist/*.webp (25 Sep, replaces the 1x PNG crops): each image fill's original file, fetched through the Figma MCP (1254 px for the 3D icons, 640-1920 px for photos, 96 px for the chat DM avatars) and resampled at 3x into the box the app draws by `review/export-assist-assets.py`. Icons are transparent with the Figma inset (for example carpool 36 in a 42 tile); the tile colour is CSS. The "Met" clover badge on club members is now drawn in code instead of being baked into the photo. club-kiker uses the Kiker Comets logo, as before.
- assist/ev-storytime, ev-nature, ev-splash, ev-share (.webp): image fills of Events 12900:24890 (card photos 12900:24933 / 24944 / 24955 at 2x, the Share clover 12900:24969 at 4x). events-updated.png is that frame at 1x, the no-JavaScript fallback only.
- assist/bus-lg, need-where (.webp): Carpool listening 12815:89066 (the bus tile 12815:89077 is the same source image as the Daily Brief bus; the pickup-place icon 12815:89093). assist/la-busav, la-home, la-school, la-bus (.webp): Live Activity Carpool Mom 11106:246080 (bus with Sarah's illustrated avatar 11227:172450 re-cropped as Figma draws it, the stop icons 11113:246218 / 11113:246213, the route bus 11106:246173 mirrored as in Figma). All at 3x (the route bus 4x) from the original fills.
- assist/event-lg, ev-cover, ev-hero, club-kinder, club-first, club-fourth (.webp): the Event listening tile (same source as ic-event), the 151/153 cover fill, the event page hero (10258:174941, its top image layer), and the Kiker Elementary class logos from Send Invites 12842:19134. Covers at 2x, logos at 3x.
- assist/bday-cover, bday-lg (.webp): the AI cover of the Birthday Card 12911:173635 (its top image layer) at 3x, and the Birthday menu icon's source as the 124 px listening tile.
- assist/cls-floyd, cls-guy, cls-albert, cls-base, cls-doodle, club-lg, need-why (.webp): Classes chat avatars (8198:109940 / 109952 / 109976 / 109964, at 3x from their 200 px fills), the class wallpaper 8198:109905 (its 1x render; the node is 4% opacity), and the Club listening tile and "What's it for?" icon from 12815:89162.

