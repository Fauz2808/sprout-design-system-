# Sprout Design Reference
> Compiled for Claude × Fauzan workflow. Last updated: March 2026.

---

## Figma File
- **File Key:** `EhpRiGZ5eJnBb132X9zewg`
- **File URL:** https://www.figma.com/design/EhpRiGZ5eJnBb132X9zewg/Sprout-Design--Prod-

### Pages
| Page | Node ID | URL |
|------|---------|-----|
| 🎨 Design (all 157 screens) | `0:1` | ?node-id=0-1 |
| ↪︎ Style (Color & Text) | `2:6771` | ?node-id=2-6771 |
| ↪︎ Icon / Components | `2:6773` | ?node-id=2-6773 |
| Exploration Page | `142:8499` | ?node-id=142-8499 |

### Screen Naming Convention
`[flow].[sub] - [Flow Name] - [State]`
e.g. `27.4 - Club Details - Admin`

### Screen Size
393 × 852px (iPhone Pro frame)

---

## Token System

### 🎨 Primitive Colors (collection: `🎨 Primitive Colors`)

#### Brand (Green)
| Token | Hex |
|-------|-----|
| Brand/50 | #e2e9e3 |
| Brand/100 | #d0dacf |
| Brand/200 | #77b691 |
| Brand/300 | #579a74 |
| Brand/400 | #387f56 |
| **Brand/500** | **#186338** ← primary brand |
| Brand/600 | #134f2d |
| **Brand/700** | **#1e3e2b** ← brand bold |
| Brand/800 | #071e11 |
| Brand/900 | #05140b |

#### Secondary (Warm Creams)
| Token | Hex |
|-------|-----|
| Secondary/50 | #fefefd |
| Secondary/100 | #fbf8f7 |
| Secondary/200 | #f6f1ee |
| Secondary/300 | #f8f7f2 |
| Secondary/400 | #f6f4ee |
| **Secondary/500** | **#f4f1ea** ← app background |
| Secondary/600 | #eae6db |
| Secondary/700 | #dbd5c8 |
| Secondary/800 | #c2b9a6 |
| Secondary/900 | #aa9e83 |

#### Tertiary (Warm Taupes)
| Token | Hex |
|-------|-----|
| Tertiary/500 | #e9dbd5 |
| Tertiary/600 | #cebcb5 |
| Tertiary/700 | #b39e95 |

#### Grey
| Token | Hex |
|-------|-----|
| Grey/50 | #fcfcfd |
| Grey/100 | #e6e7ea |
| Grey/200 | #cdcfd6 |
| Grey/300 | #b3b8c1 |
| Grey/400 | #9aa0ad |
| **Grey/500** | **#818898** ← secondary text |
| Grey/600 | #676d7a |
| **Grey/700** | **#4d525b** ← primary text |
| Grey/800 | #34363d |
| Grey/900 | #1a1b1e |

#### Neutral
| Token | Hex |
|-------|-----|
| Neutral/White | #ffffff |
| Neutral/Black | #1a1a1a |

#### Semantic
| Scale | 100 | 500 | 700 |
|-------|-----|-----|-----|
| Info | #d8e5ed | #3a7ca5 | #234a63 |
| Success | #dee8de | #5c8a5c | #375337 |
| Warning | #f6ecd1 | #d4a017 | #7f600e |
| Error | #f7dada | #d64545 | #802929 |

---

### 💡 Color Styles (collection: `💡 Color Styles`) — USE THESE in designs

#### Content
| Variable Name | → Primitive | Resolved Hex |
|---------------|-------------|--------------|
| Content/Primary | Grey/700 | #4d525b |
| Content/Secondary | Grey/500 | #818898 |
| Content/Tertiary | Grey/300 | #b3b8c1 |
| Content/Disable | Grey/400 | #9aa0ad |
| Content/Brand | Brand/500 | #186338 |
| Content/Brand Bold | Brand/700 | #1e3e2b |
| Content/Text Stable White | Neutral/White | #ffffff |
| Content/Text Stable Black | Neutral/Black | #1a1a1a |
| Content/Link | Info/500 | #3a7ca5 |
| Content/Positive | Success/500 | #5c8a5c |
| Content/Negative | Error/500 | #d64545 |
| Content/Notice | Warning/500 | #d4a017 |

#### Background
| Variable Name | → Primitive | Resolved Hex |
|---------------|-------------|--------------|
| Background/Primary | Secondary/500 | #f4f1ea |
| Background/Hover | Secondary/600 | #eae6db |
| Background/Pressed | Secondary/700 | #dbd5c8 |
| Background/Disable | Grey/200 | #cdcfd6 |
| Background/Brand | Brand/500 | #186338 |
| Background/Brand Light | Brand/50 | #e2e9e3 |
| Background/Brand Hover | Brand/600 | #134f2d |
| Background/Brand Pressed | Brand/700 | #1e3e2b |
| Background/Brand Disable | Brand/200 | #77b691 |
| Background/Info Subtle | Info/100 | #d8e5ed |
| Background/Notice Subtle | Warning/100 | #f6ecd1 |
| Background/Negative Subtle | Error/100 | #f7dada |
| Background/Positive Subtle | Success/100 | #dee8de |

#### Surface (layering system)
| Variable Name | → Primitive | Resolved Hex |
|---------------|-------------|--------------|
| Surface/L0 | Secondary/500 | #f4f1ea |
| Surface/L1 | Secondary/600 | #eae6db |
| Surface/L2 | Secondary/700 | #dbd5c8 |
| Surface/L3 | Secondary/800 | #c2b9a6 |
| Surface/L4 | Secondary/900 | #aa9e83 |

#### Border
| Variable Name | → Primitive | Resolved Hex |
|---------------|-------------|--------------|
| Border/Primary | Grey/300 | #b3b8c1 |
| Border/Secondary | Grey/200 | #cdcfd6 |
| Border/Tertiary | Grey/100 | #e6e7ea |
| Border/Brand | Brand/500 | #186338 |
| Border/Brand Light | Brand/100 | #d0dacf |

---

### 📐 Design Tokens (collection: `📐 Design Tokens`)

#### Spacing
`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 96`

#### Radius
| Token | Value |
|-------|-------|
| Radius/None | 0 |
| Radius/SM | 4 |
| Radius/MD | 8 |
| Radius/LG | 12 |
| Radius/XL | 16 |
| Radius/2XL | 24 |
| Radius/3XL | 32 |
| Radius/Full | 99999 |

---

### Typography (from `2:6771` Style page)
| Token | Spec |
|-------|------|
| Heading/1 | Playfair Display, large |
| Heading/2 | Playfair Display |
| Heading/3 | Playfair Display |
| Heading/4 | Playfair Display Medium 16px, lh 1.5 |
| Heading/5 | Playfair Display |
| Heading/6 | Playfair Display |
| Subhead/1 | Inter Medium 25px |
| Subhead/2 | Inter Medium 22px |
| Subhead/3 | Inter Medium 19px |
| Paragraph/1 | Inter Regular 27px |
| Paragraph/2 | Inter Regular 22px |
| Paragraph/3 | Inter Regular 19px |
| Caption/1 | Inter Semibold 15px |
| Caption/2 | Inter Medium 15px |
| Caption/3 | Inter Regular 15px |

**From variables:**
- `Regular/None/Medium` → Inter Medium 16px, lh 16, ls 0
- `Inter/Small/Regular` → Inter Regular 14px, lh 1.55, ls 0
- `Inter/XSmall/Regular` → Inter Regular 12px, lh 1.55, ls 0

---

## Brand Quick Reference

| | |
|---|---|
| **Tagline** | "Where parents bond and childhoods flourish." |
| **Brand Idea** | "You got lucky when you found these people." |
| **Platform** | Social app for parents — clubs, events, playdates, chat |
| **Personality** | Warm & Human, Serendipitous, Grounded & Safe |
| **Primary Font** | Playfair Display (headings/display) |
| **Body Font** | Inter (all UI copy) |
| **App BG** | #f4f1ea (Secondary/500) |
| **Primary Action** | #186338 (Brand/500) |

---

## Workflow Rules
1. All new designs → Exploration Page (`142:8499`)
2. Use semantic tokens (`Content/`, `Background/`, `Border/`, `Surface/`) — not primitives
3. Auto-layout on all frames
4. Layer naming: match existing convention e.g. `Container`, `Header`, `Content Container`
5. Screen size: 393 × 852
6. Placeholders for images until Fauzan provides assets
