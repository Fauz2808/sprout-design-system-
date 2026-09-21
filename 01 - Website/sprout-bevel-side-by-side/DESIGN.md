# Sprout visual direction: Connected Family System, side-by-side hero

## Reference translation

This direction takes five visible principles from [Bevel](https://www.bevel.health/):

1. A floating capsule navigation that stays visually separate from the page.
2. A product-led hero inside one atmospheric rounded surface.
3. Real product screens as the main evidence, with supporting UI fragments around them.
4. Large feature modules that change color and composition according to the feature.
5. Generous white space between product moments.

The result remains Sprout. Forest green, the clover mark, family imagery, school communities, events, Daily Brief, chat, photos, and family profile content all come from Sprout. No health scores, wearable integrations, ratings, member counts, testimonials, or Bevel assets are used.

This variation changes the hero composition and its primary screen. Copy and CTA occupy the left column. The Sprout AI Daily Brief from Figma node `12133:104439` occupies the right column at a larger readable size. Two compact UI fragments sit near its outer edges and leave the main interface visible. The centered Connected Family System hero remains available as a separate option.

## Core idea

**Your family life, connected.**

The interface should feel calm enough for a parent scanning the week and polished enough to earn trust around family information. The landing page shows a connected system rather than a list of unrelated features.

## Story order

1. Hero: one promise and the Sprout AI Daily Brief screen.
2. Context strip: school, grade, clubs, activities, and events.
3. Family day: an interactive view of morning, after school, and weekend use.
4. Community: school search, parent directory, and family context in one scene.
5. Plans and conversations: two large product modules.
6. Memory: an event continues into shared photos.
7. Family profile: a dark focused moment for saved information and one-tap registration.
8. Additional features: a concise factual index.
9. Privacy: trust immediately before download.
10. Download: the original Sprout tagline closes the page.

## Visual system

| Token | Value | Role |
|---|---:|---|
| Canvas | `#f7f8f6` | Neutral page background |
| Ink | `#171b18` | Primary text and controls |
| Sprout green | `#184c36` | Brand emphasis |
| Deep green | `#103527` | Family profile focus section |
| Sky | `#dcecff` | Daily Brief and hero atmosphere |
| Mint | `#c5efcf` | School community context |
| Lavender | `#dedcf8` | Events module |
| Peach | `#f6ded4` | Conversation module |
| Typeface | Instrument Sans | Clean product-led voice close to the reference, with weight and width variation for hierarchy |

The hero and product slabs use a large radius because rounded environmental panels are a defining part of the chosen reference. Smaller content blocks only receive rounding when they represent a device, control, image, or floating interface object.

The navbar and hero download buttons use Sprout green with white text and no platform icon. Their hover state shifts to deep green.

The gradients create environment and depth for device screenshots. They are limited to the hero, community, memory, and download stages. Text never relies on a gradient for contrast.

## Product presentation

- The hero presents the Sprout AI Daily Brief beside the message. Tasks, carpool, invitations, and daily plans are readable in one product view. Two compact UI fragments overlap only the outer edges and do not add ratings or fake adoption data.
- Daily Brief uses a real screenshot inside a selectable family-day story.
- Community currently holds an empty mint-to-sky mesh gradient stage while its product composition is being revised.
- Events and chat are paired as equal, large modules because both support the same plan.
- The memory stage uses an evenly blurred and slightly dimmed photograph without a white gradient so the event mockup remains the focal point.
- The family profile section changes to deep green to signal a more careful data moment.
- The final download stage repeats the Sprout AI Daily Brief from the hero and pairs it with family photographs.
- Every phone mockup stays upright at 0 degrees so product content remains easy to scan. Rotation is reserved for floating cards, family photos, and community browser panels.

## Interactions

- Family-day tabs support click, Left, Right, Home, and End keys with roving focus.
- Mobile navigation moves focus to the first link, keeps Tab within the open menu, closes with Escape, and makes the rest of the page inert.
- The one-tap preview changes to an explicit local completion state and resets on the next click.
- Native `details` reveals the categories held by a family profile.
- Entry transitions use opacity and the CSS `translate` property so component transforms remain intact.
- `prefers-reduced-motion` removes entry and state motion.

## Responsive behavior

- The floating navigation becomes a compact brand and menu control at 800px.
- Above 800px, the hero uses two columns so the product screen and message receive equal visual weight.
- At 800px and below, the hero returns to the centered vertical composition so the headline and controls remain comfortable on narrow screens.
- Family-day content becomes one column and keeps the device below the explanation.
- The empty community mesh stage scales from 45rem on desktop to 38rem on narrow phones.
- Product modules stack with safe spacing between copy and device screens.
- Profile controls and store badges become full-width or stacked on narrow phones.
- Page-level horizontal overflow is prevented at 390px.

## Accessibility

- One `h1` and sequential section headings.
- Visible focus treatment that works on light and dark surfaces.
- Semantic buttons, tabs, navigation, details, lists, and status regions.
- Informative images have descriptive alternative text. Decorative images use empty alternative text or are hidden.
- Controls meet a minimum 44px target size.
- Sampled text color pairs pass WCAG AA for normal text.

## Production handoff

The prototype can be migrated into the existing React site section by section. Preserve the DOM semantics and keyboard behavior. Replace the static family-day data only when real routes or product data are available.

Before release, self-host the approved font files, prepare responsive image variants, confirm legal copy, and replace the AI concept photograph with licensed Sprout photography when available.
