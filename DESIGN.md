# EcoTrack TCGC Design System

Companion to `SYSTEM.md`. This file defines how the interface looks, reads and behaves.

---

## 1. Concept: The Bin Lid and the Route Sheet

Waste management already has a visual language people understand without being taught: **color-coded bin lids** and the **route sheet** a maintenance crew carries on rounds. The design borrows both.

- **Lid colors identify waste categories and nothing else.** Green, yellow, black and orange appear only where a waste category is meant.
- **Everything else is quiet.** Concrete grey, steel lines and one deep blue (the color of Panguil Bay) carry the interface.
- **The interface reads like a well-kept log.** It has clear rows, honest numbers and no decoration.

**The one memorable thing is the Day Gauge** (section 6.1): a bin silhouette that fills as the day's collections are completed. It is the only illustrative element. Everything around it stays plain.

**Who it's for**

| Role | Device | Design priority |
|---|---|---|
| Administrator | Desktop | Dense, scannable, fast to enter data |
| Maintenance personnel | Phone, often outdoors, sometimes wearing gloves | Big targets, high contrast, one action per card |
| Offices | Desktop, occasional use | Calm, obvious, no training needed |

---

## 2. Principles

1. **Color means one thing at a time.** Lid colors mean category. Status is carried by shape and wording. Brand blue means "you can act here."
2. **The log is the interface.** Records, schedules and history are rows people read left to right. Cards are used only where a thing is a unit of work (a collection).
3. **Show state with form, not just color.** Every status has a distinct shape and a word. Nothing relies on color alone.
4. **Built for the field.** The maintenance view is designed at 360 px wide first. The admin view adds density on top.
5. **Say it plainly.** Sentence case, active verbs, local names for places (building and area names as the college uses them).
6. **Flat and honest.** No drop shadows or gradients. Depth comes from 1 px lines and the lid stripe.

---

## 3. Color

### Core palette

| Token | Hex | Use |
|---|---|---|
| `--bay` (Panguil Blue) | `#1C4E6E` | Primary actions, links, active navigation, focus ring base |
| `--bay-deep` | `#133A54` | Pressed state, header text on light blue wash |
| `--bay-wash` | `#DCE8F0` | Selected row, active nav background, info notes |
| `--ink` | `#17201D` | Primary text |
| `--steel` | `#53605A` | Secondary text, captions |
| `--concrete` | `#E5E8E4` | Page background |
| `--slab` | `#F6F7F4` | Surfaces: tables, cards, forms |
| `--galvanized` | `#AEB6B0` | Borders, dividers |
| `--galvanized-soft` | `#D3D8D3` | Row separators, input borders at rest |

### Lid colors (waste categories only)

| Category | Token | Hex | Text on it |
|---|---|---|---|
| Biodegradable | `--lid-green` | `#2E7D4F` | white |
| Recyclable | `--lid-yellow` | `#E3A908` | `--ink` |
| Residual | `--lid-black` | `#2A2D2B` | white |
| Hazardous / special | `--lid-orange` | `#D4531A` | white |

> **Verify before shipping.** Confirm the category names and colors against TCGC's actual bin color scheme and local government guidance. Change only the tokens, never the usage rule.

### Signal colors

| Token | Hex | Use |
|---|---|---|
| `--alarm` | `#A3221B` | Missed, Overdue, destructive actions, form errors |
| `--ok` | `#1F6B3F` | Success confirmation text and icon |
| `--note` | `#8A5A00` on `#FBF0D2` | Warnings and cautions |

### Rules
- Lid colors **never** mean status, and `--alarm` is **never** a category.
- Yellow is a **fill only**. Never use yellow as text on a light background.
- Page background is `--concrete`, surfaces are `--slab`, and text is `--ink` or `--steel`. Pure black and pure white are not used for large areas.
- All text meets 4.5:1 contrast. Large text and UI outlines meet 3:1.

---

## 4. Typography

| Role | Family | Notes |
|---|---|---|
| Headings, numbers, table headers | **Archivo** (variable) | Width axis ~110 for headings. Weight 700. Evokes wide stenciled bin labels without being decorative |
| Body, forms, tables | **Atkinson Hyperlegible** | Designed for legibility. Suits tired eyes, small phone screens and bright sun |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">
```

Fallbacks: Archivo → `"Arial Narrow", Arial, sans-serif`. Atkinson Hyperlegible → `"Segoe UI", system-ui, sans-serif`.

### Scale (1.25 ratio, 16 px base)

| Token | Size / Line height | Use |
|---|---|---|
| `--t-display` | 44 / 48, Archivo 700, width 112 | Day Gauge number, page hero figure |
| `--t-h1` | 32 / 38, Archivo 700, width 110 | Page title |
| `--t-h2` | 24 / 30, Archivo 700, width 108 | Section title |
| `--t-h3` | 20 / 26, Archivo 600 | Card title |
| `--t-body` | 16 / 24, Atkinson 400 | Default |
| `--t-small` | 14 / 20, Atkinson 400 | Table cells, captions |
| `--t-micro` | 12 / 16, Atkinson 700 | Tags and chips (minimum size) |

- Numbers in tables and gauges use `font-variant-numeric: tabular-nums`.
- Line length stays under 70 characters for paragraphs.
- Sentence case for everything. **No ALL-CAPS labels, no letter-spaced eyebrow text.** Section titles are plain.
- Left-aligned. Numbers are right-aligned in tables.

---

## 5. Space, Shape and Depth

- **Spacing unit:** 4 px. Scale: 4, 8, 12, 16, 24, 32, 48.
- **Touch targets:** 44 px minimum on desktop. **56 px** for the maintenance role.
- **Radii by role** (not one radius for everything):

| Element | Radius |
|---|---|
| Tables, panels, data containers | 2 px |
| Buttons, inputs | 8 px |
| Lid cards (a unit of work) | 10 px on the top corners, 0 on the bottom |
| Status tags | Notched corner (see 6.3) |

- **No box shadows.** Separate surfaces with 1 px `--galvanized-soft` lines. Elevate overlays (menus, dialogs) with a 1 px `--galvanized` border and a `--concrete` scrim behind.
- **Grid:** 12 columns on desktop with a 1200 px max content width. One column on phones.

---

## 6. Signature Components

### 6.1 Day Gauge (the memorable element)

A bin silhouette (straight-sided with a lid) that **fills from the bottom** in proportion to today's completed collections.

```
   ____________
  |____________|   <- lid, stripe = Panguil Blue
  |            |
  |            |
  |############|   58% filled
  |############|   "7 of 12 collected"
  |############|
  |############|
  '------------'
```

- Fill uses `--bay`. It is **not** a lid color, because the gauge counts collections, not a waste category.
- Inside or beside it: the big number (`--t-display`) and the label "7 of 12 collected".
- Below it, a line for what is outstanding: "3 scheduled, 1 in progress, 1 overdue".
- If any collection is overdue, the lid gets an `--alarm` stripe and the label names the count.
- **Appears:** the admin dashboard (large), the maintenance home screen (full width on phone). Offices see a smaller version for their locations.
- **Motion:** on first load, the fill rises once over 600 ms. When the user changes a status, the fill moves to the new level over 300 ms. With `prefers-reduced-motion`, it jumps without animating.
- Always provide the same information as text for screen readers: `aria-label="7 of 12 collections completed"`.

### 6.2 Lid card (a unit of work)

Used for a collection or a concern, never for generic content.

```
┌──────────────────────────────┐
│▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│ <- 6 px stripe in category lid color
│ Main Building, ground floor  │
│ Today, 7:00 to 9:00 am       │
│ [◐ Scheduled]  Biodegradable │
│                              │
│ [ Start collection ]         │
└──────────────────────────────┘
```

- The top stripe takes the **category lid color**. For a schedule that covers several categories, the stripe is split into segments.
- Flat bottom edge, 1 px `--galvanized-soft` border, `--slab` fill.
- At most one primary action per card.

### 6.3 Status tag

Each status has a **shape**, a **word** and a **tone**. The tag has one notched corner (top-right, 6 px cut) like a hanging tag.

| Status | Glyph | Fill / border | Text |
|---|---|---|---|
| Pending | Hollow circle | Border `--galvanized`, no fill | `--steel` |
| Scheduled | Half-filled circle | `--bay-wash` | `--bay-deep` |
| In progress | Three-quarter circle | `--bay` | white |
| Collected | Full circle with check | `--ok` at 12% on `--slab`, border `--ok` | `--ok` |
| Missed | Square with diagonal hatch | `--alarm` hatch on white, border `--alarm` | `--alarm` |
| Overdue | Triangle outline | `--alarm` fill | white |
| Rescheduled | Circle with arrow | `--bay-wash`, dashed border | `--bay-deep` |
| Cancelled | Circle with a line through it | None | `--steel`, struck through |

### 6.4 Category chip

Small square swatch (12 px) in the lid color, followed by the category name in `--ink`. It sits on a `--slab` pill with a 1 px border. The swatch has a 1 px `--ink` outline so yellow stays visible on light backgrounds.

### 6.5 Load bar (in tables and reports)

A thin horizontal bar (8 px high) that shows quantity in kg, split into category segments. Each segment uses its lid color. The kg value is always printed beside it in tabular numerals. The bar never carries meaning alone.

---

## 7. Other Components

**Buttons**
- Primary: `--bay` fill, white text, 8 px radius. Pressed: `--bay-deep`.
- Secondary: `--slab` fill, 1 px `--bay` border, `--bay` text.
- Destructive: `--alarm` fill, only inside a confirmation dialog.
- Labels name the action: "Save record", "Start collection", "Mark as collected", "Generate report". Never "Submit" or "OK".
- Disabled: `--galvanized-soft` fill, `--steel` text, and a tooltip explaining why.

**Form fields**
- Label above the field in `--t-small` bold. Hint text below in `--steel`.
- Border `--galvanized`, 8 px radius, 44 px tall (56 px for maintenance).
- Focus: 3 px `--bay` ring with a 2 px `--slab` gap, always visible.
- Error: `--alarm` border, an icon, and a sentence under the field that says how to fix it: "Enter a quantity greater than 0."
- Dates use a native picker. Quantity shows the unit ("kg") inside the field.

**Tables**
- Header row: `--concrete` background, Archivo 600, bottom border `--galvanized`.
- Row height 48 px, 1 px `--galvanized-soft` separators, hover `--bay-wash` at 50%.
- Selected row: `--bay-wash` with a 3 px `--bay` left edge.
- Numbers right-aligned. Dates written as "Oct 25, 2026". Sortable columns show an arrow.
- On phones, tables collapse to lid cards.

**Navigation**
- Admin and office, desktop: a 232 px left rail on `--slab` with a 1 px right border. The active item uses `--bay-wash` fill and a 3 px `--bay` bar.
- Maintenance, phone: a fixed bottom bar with three items (My collections, Report a concern, Account), 64 px tall.
- The signed-in role is shown in the rail footer, e.g. "Maintenance, Building A".

**Dialogs and toasts**
- Dialogs open from the user's action, with a 150 ms fade. They say what will happen: "Delete this record? It will be removed from reports."
- Toasts repeat the action's name: the button "Mark as collected" produces "Marked as collected." They appear for 4 seconds, bottom-left on desktop and above the bar on phones.

**Empty states**
- One sentence and one action. No illustrations. Example: "No collections scheduled for this week. Create a schedule."

---

## 8. Layouts

### 8.1 Admin dashboard (desktop)

```
┌────────┬─────────────────────────────────────────────────────────┐
│ EcoTrack│  Dashboard                       [ This month ▾ ]        │
│ TCGC   │                                                          │
│        │  ┌───────────────┐  Waste this month                     │
│ Dashbd │  │   Day Gauge   │  ┌──────────────────────────────────┐ │
│ Records│  │   7 of 12     │  │ Biodegradable  ██████████ 412 kg │ │
│ Sched. │  │   collected   │  │ Recyclable     ████       138 kg │ │
│ Collect│  └───────────────┘  │ Residual       ███████    260 kg │ │
│ Concern│                     │ Hazardous      ▌            9 kg │ │
│ Reports│  Needs attention                                        │
│ Setup  │  ┌──────────────────────────────────────────────────┐   │
│ Users  │  │ ▲ Overdue  Canteen   Oct 24, 7:00 am   [Open]    │   │
│        │  │ ▨ Missed   Library   Oct 23, 7:00 am   [Open]    │   │
│ Admin  │  └──────────────────────────────────────────────────┘   │
└────────┴─────────────────────────────────────────────────────────┘
```

- The Day Gauge sits top-left as the anchor. "Needs attention" comes before any history, because overdue work is the admin's first question.
- Left-aligned content throughout.

### 8.2 Maintenance home (phone, 360 px)

```
┌─────────────────────────┐
│ Good morning, Mang Ben  │
│ ┌──────┐ 3 of 8         │
│ │ gauge│ collected today │
│ └──────┘ 1 in progress  │
│ ┌─────────────────────┐ │
│ │▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀│ │
│ │ Canteen             │ │
│ │ 7:00 to 9:00 am     │ │
│ │ [◑ In progress]     │ │
│ │ [ Mark as collected]│ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Library …           │ │
│ └─────────────────────┘ │
│ [My collections][Report][Me]│
└─────────────────────────┘
```

- One primary button per card, full width, 56 px tall.
- "Missed" opens a short sheet: pick a reason, then confirm.
- Keep the greeting to the user's name only. No filler copy.

### 8.3 Office view (desktop)
Same left rail with fewer items. Top: a smaller Day Gauge for the office's locations, then the next scheduled collection, then a read-only record list. Nothing editable is shown, so no disabled controls clutter the page.

---

## 9. Motion

Motion is used twice and only twice:

1. **Day Gauge fill**, once on load and when a status changes (section 6.1).
2. **Responses to user action**: dialogs, menus and toasts open with a 150 to 200 ms fade. Nothing slides in on scroll and nothing animates on hover beyond a color change.

With `prefers-reduced-motion: reduce`, all motion is removed.

---

## 10. Content and Voice

- **Plain and direct.** Say what happened and what to do next.
- **Name things as users do:** "collection", "schedule", "record", "concern". Not "task", "entry" or "ticket".
- **Sentence case.** Active verbs. One name for each action everywhere.
- **Errors never apologize and never stay vague.** Say what went wrong and how to fix it.

| Situation | Copy |
|---|---|
| Login failed | "Email or password is incorrect. Try again or ask the administrator to reset your password." |
| Required field | "Choose a location." |
| Future date | "The date can't be later than today." |
| Missed collection | "Collection marked as missed. The administrator can reschedule it." |
| Not allowed | "Your account can view this page but not change it." |
| Empty records | "No waste records yet. Add a record." |
| Success | "Record saved." |

- Dates: "Oct 25, 2026". Times: "7:00 am". Quantities: "412 kg".
- **Optional:** offer Filipino or Bisaya labels for the maintenance view if staff prefer. Keep the same terms across the app once chosen.

---

## 11. Accessibility Floor

- Text contrast 4.5:1 or higher. UI components and outlines 3:1 or higher.
- Status and category are always shown with **words** as well as color and shape.
- Every interactive element is keyboard reachable, with a visible 3 px focus ring.
- The Day Gauge and load bars have text equivalents.
- Layouts work from 360 px to 1920 px with no horizontal scrolling, apart from wide data tables, which scroll inside their own container.
- Respect `prefers-reduced-motion` and text zoom to 200%.
- Print stylesheet for reports: white background, black text, no navigation, category colors kept as swatches with names.

---

## 12. Design Tokens (CSS)

```css
:root {
  /* Brand and surfaces */
  --bay: #1C4E6E;
  --bay-deep: #133A54;
  --bay-wash: #DCE8F0;
  --ink: #17201D;
  --steel: #53605A;
  --concrete: #E5E8E4;
  --slab: #F6F7F4;
  --galvanized: #AEB6B0;
  --galvanized-soft: #D3D8D3;

  /* Waste categories (lid colors) */
  --lid-green: #2E7D4F;
  --lid-yellow: #E3A908;
  --lid-black: #2A2D2B;
  --lid-orange: #D4531A;

  /* Signals */
  --alarm: #A3221B;
  --ok: #1F6B3F;
  --note-text: #8A5A00;
  --note-bg: #FBF0D2;

  /* Type */
  --font-head: "Archivo", "Arial Narrow", Arial, sans-serif;
  --font-body: "Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif;
  --t-display: 44px;
  --t-h1: 32px;
  --t-h2: 24px;
  --t-h3: 20px;
  --t-body: 16px;
  --t-small: 14px;
  --t-micro: 12px;

  /* Space and shape */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
  --s-5: 24px; --s-6: 32px; --s-7: 48px;
  --r-data: 2px;
  --r-control: 8px;
  --r-lid: 10px 10px 0 0;
  --target: 44px;
  --target-field: 56px; /* maintenance role */
  --focus-ring: 0 0 0 2px var(--slab), 0 0 0 5px var(--bay);
}

body {
  background: var(--concrete);
  color: var(--ink);
  font: 400 var(--t-body)/24px var(--font-body);
}

h1, h2, h3 {
  font-family: var(--font-head);
  font-stretch: 110%;
  font-weight: 700;
}

.num { font-variant-numeric: tabular-nums; }

.lid-card {
  background: var(--slab);
  border: 1px solid var(--galvanized-soft);
  border-top: 6px solid var(--lid-green); /* set per category */
  border-radius: var(--r-lid);
}

.status-tag {
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);
}

:focus-visible { outline: none; box-shadow: var(--focus-ring); }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## 13. Do and Don't

| Do | Don't |
|---|---|
| Use lid colors only for waste categories | Use green to mean "success" or "good" |
| Show status as shape, word and tone | Rely on color alone |
| Keep one primary action per card | Put several buttons of equal weight on a collection |
| Print numbers in tabular figures | Use decorative numerals |
| Write "Mark as collected" | Write "Submit" or "Update" |
| Use flat surfaces and 1 px lines | Add shadows, gradients or glass effects |
| Spend the visual risk on the Day Gauge | Decorate the pages around it |

---

## 14. Build Notes

- Build the maintenance view at 360 px first, then widen to the admin layout.
- Use the tokens in section 12 as the only source of color and spacing, so changing a bin color is a one-line edit.
- Test the maintenance screens outdoors, on a mid-range Android phone, in direct sunlight.
- Replace placeholder names such as "Mang Ben", "Canteen" and "Library" with real TCGC building and area names.
