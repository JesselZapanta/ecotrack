# EcoTrack TCGC Design System — Modern

> **Historical.** The shipped UI now follows the **Fieldwork** direction (warm paper, deep pine, flat cards, dark sidebar, Schibsted Grotesk + Manrope + JetBrains Mono). Tokens live in `frontend/src/index.css`; the sections below are kept as the earlier Harbor Glass exploration.

Companion to `SYSTEM.md`. v2 replaces the original flat logbook with a modern, glassy harbor system. Same logic, more depth, more motion, more delight — while staying field-ready at 360px.

> **What changed:** v1 was intentionally flat (1px lines, no shadows, no gradients). v2 keeps the *Bin Lid* language but adds layered surfaces, soft depth, and refined motion. Every token from v1 still works — v2 only adds on top.

---

## 1. Concept: Harbor Glass

The campus sits on Panguil Bay. The new concept is **Harbor Glass** — the bay at morning: deep blue water, soft morning haze, light through glass.

- **Glass + depth, not flat paper.** Surfaces float over a soft mesh gradient (concrete → bay-wash). Cards are elevated with blurred edges, not outlined boxes.
- **Lid colors are now gradients.** Each waste category keeps its hue, but rendered as a 135° gradient (base → 12% lighter). More legible, more premium, still instantly scannable.
- **The log becomes a living board.** Rows become bento cards with live data, micro-charts, and gentle motion. The information hierarchy is the same — the material is new.
- **One hero remains: the Day Gauge.** Now a 3D glass vessel with inner fill, glow, and spring motion. Everything else stays calm so the gauge still owns the view.

**Who it's for — unchanged, now with modern expectations:**

| Role | Device | Modern priority |
|---|---|---|
| Administrator | Desktop, large monitor | Bento density + glanceable charts + command palette speed |
| Maintenance | Phone, outdoors, gloves | Glass cards with high contrast + 56px targets + tactile haptics |
| Offices | Desktop / tablet | Calm glass, zero learning curve, instant status |

---

## 2. Principles — Modern

1. **Depth with purpose.** Blur and shadow signal elevation. Lid gradients signal category. Bay blue signals action. Never mix the jobs.
2. **Glass, not plastic.** Surfaces use `backdrop-blur(12px)` + `bg-slab/80` + `border-white/40`. Light passes through, content stays legible.
3. **Motion is feedback.** Every interaction has a 180–220ms spring. Fill, lift, and fade tell the user what just happened. No motion for decoration.
4. **Bento first, list second.** Dashboards are bento grids (12-col, 8–16px gaps). Lists remain for history, but cards own the present.
5. **Modern quiet.** Generous whitespace, 16–24px radii, soft shadows. Information breathes. No crowding, no beige walls.
6. **Field-ready still.** 360px is still the first breakpoint. Glass cards keep `56px` targets, `AA` contrast, and outdoor legibility — beauty never costs usability.

---

## 3. Color — Modern Palette

### Core — same hues, new roles

| Token | Hex | Modern use |
|---|---|---|
| `--bay` | `#1C4E6E` | Primary, links, focus. Now also gradient start |
| `--bay-bright` | `#2A7AA8` | Gradient end, hover glow, chart accent |
| `--bay-deep` | `#133A54` | Pressed, text on wash |
| `--bay-wash` | `#DCE8F0` | Glass tint, selected row, info |
| `--bay-glass` | `rgba(28,78,110,0.08)` | Glass overlay |
| `--ink` | `#17201D` | Primary text |
| `--steel` | `#53605A` | Secondary |
| `--concrete` | `#E5E8E4` | Page base — now with radial mesh |
| `--slab` | `rgba(246,247,244,0.85)` | Glass surface (was solid) |
| `--slab-solid` | `#F6F7F4` | Solid fallback |
| `--galvanized` | `#AEB6B0` | Borders |
| `--galvanized-soft` | `rgba(211,216,211,0.6)` | Soft dividers |

**Page background — modern mesh (new):**
```css
body {
  background:
    radial-gradient(900px 600px at 10% 0%, #DCE8F0 0%, transparent 60%),
    radial-gradient(700px 500px at 90% 12%, #E8F0E6 0%, transparent 55%),
    var(--concrete);
}
```

### Lid colors — now gradients (waste categories only)

| Category | Token | Base → Gradient | Text |
|---|---|---|---|
| Biodegradable | `--lid-green` | `#2E7D4F → #3FA76A` | white |
| Recyclable | `--lid-yellow` | `#E3A908 → #F4C84A` | `--ink` |
| Residual | `--lid-black` | `#2A2D2B → #4A4F4D` | white |
| Hazardous | `--lid-orange` | `#D4531A → #E87A4A` | white |

CSS: `background: linear-gradient(135deg, var(--lid-green) 0%, color-mix(in srgb, var(--lid-green) 88%, white) 100%)`

> **Verify before shipping.** Confirm names + hues against TCGC bin scheme. Change only tokens.

### Signals — richer

| Token | Hex | Use |
|---|---|---|
| `--alarm` | `#A3221B` | Missed/Overdue/destructive |
| `--alarm-soft` | `rgba(163,34,27,0.10)` | Bg for alarm cards |
| `--ok` | `#1F6B3F` | Success, collected |
| `--ok-soft` | `rgba(31,107,63,0.10)` | Bg for ok |
| `--note` | `#8A5A00` on `#FBF0D2` | Warning |

### Rules — updated for modern
- Lid gradients **only** for category. `--alarm` is never a category.
- Yellow is never text on light — use `--ink` on yellow.
- No pure black/white large areas — glass + mesh does the work.
- All text 4.5:1, UI 3:1. Glass cards keep `border-white/40` for edge definition.

---

## 4. Typography — Modern

| Role | Family | Notes |
|---|---|---|
| Display / Day Gauge number | **Bricolage Grotesque** 700–800 | Warm, modern, slightly condensed. Replaces stenciled Archivo for hero numbers |
| Headings / table headers | **Instrument Sans** 600–700 | Geometric, crisp, variable. Width 100 |
| Body / forms / tables | **Inter** 400–500 | Neutral, highly legible at 14–16px, perfect for data |
| Tabular numbers | **Geist Mono** or `Inter` tabular-nums | For kg, gauges, tables |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Instrument+Sans:wght@600;700&family=Inter:wght@400;500;600&family=Geist+Mono:wght@500&display=swap" rel="stylesheet">
```

Fallbacks: Bricolage → `Outfit, sans-serif` · Instrument Sans → `Inter, system-ui` · Inter → `Segoe UI, system-ui`.

### Scale — same ratio, larger air

| Token | Size / LH | Use |
|---|---|---|
| `--t-display` | 48 / 48, Bricolage 800 | Day Gauge, hero |
| `--t-h1` | 32 / 36, Instrument 700 | Page title |
| `--t-h2` | 22 / 28, Instrument 600 | Section |
| `--t-h3` | 18 / 24, Instrument 600 | Card title |
| `--t-body` | 15 / 22, Inter 400 | Default (was 16 — slightly tighter for density) |
| `--t-small` | 13.5 / 18, Inter 500 | Table, caption |
| `--t-micro` | 11 / 14, Inter 700, 0.04em tracking | Tags |

- Numbers use `font-variant-numeric: tabular-nums` + `Geist Mono` where available.
- Left-aligned body, right-aligned numbers. Sentence case. No all-caps headers — use `font-weight 600` instead.

---

## 5. Space, Shape and Depth — Modern

- **Spacing:** 4px base, but modern gaps are 8 / 12 / 16 / 20 / 24 / 32 / 48. More air than v1.
- **Radii — larger, softer:**
  | Element | Radius |
  |---|---|
  | Bento cards, panels | 16–20px |
  | Lid cards | 16px (was 10px top only — now fully rounded, stripe is inner) |
  | Buttons, inputs | 12px (was 8) |
  | Pills / tags | 999px (was notched — now pill + subtle notch accent) |
  | Tables | 12px container |
- **Depth — new layered shadows + blur:**
  ```css
  --shadow-sm: 0 1px 2px rgba(23,32,29,0.06), 0 4px 12px rgba(23,32,29,0.04);
  --shadow-md: 0 4px 16px rgba(23,32,29,0.08), 0 12px 32px rgba(23,32,29,0.06);
  --shadow-lg: 0 8px 32px rgba(23,32,29,0.12), 0 2px 8px rgba(28,78,110,0.08);
  --glass: backdrop-blur(12px) saturate(1.2);
  ```
  Surfaces: `bg-slab` (now `rgba` glass) + `border-white/40` + `shadow-sm`. Hover: `shadow-md` + `translateY(-1px)`. Dialogs: `shadow-lg` + `bg-slab-solid`.
- **Grid:** 12-col, `max-width 1280px`, `gap 16` (desktop), `gap 12` (tablet), `1-col` (mobile). Bento cards span 3/4/6/8 cols.

---

## 6. Signature Components — Modernized

### 6.1 Day Gauge — Glass Vessel

Now a **glass vessel** with inner light, not a flat bin.

```
  ╭─────────────────╮  <- glass lid, bay gradient + highlight
  │  · soft glare · │
  │                 │
  │   ████████████  │  <- gradient fill (bay → bay-bright) + inner glow
  │   ████████████  │     animated via spring
  │   7 of 12       │  <- Bricolage 48px
  │  58%            │
  ╰─────────────────╯
   3 scheduled · 1 in progress · 1 overdue
```

- Vessel: `rounded-[20px]`, `border-white/50`, `bg-white/40` + `backdrop-blur`, `shadow-md`, inner highlight `linear-gradient(to bottom, white/60, transparent 30%)`.
- Fill: `linear-gradient(180deg, var(--bay-bright), var(--bay))` + `box-shadow: 0 0 20px rgba(42,122,168,0.4)` glow. Height animates with `spring(stiffness: 260, damping: 26)`.
- Motion: rise 700ms spring on load, 400ms on status change. Reduced-motion: fade only.
- Overdue: lid glows `var(--alarm)` + subtle pulse.
- `aria-label="7 of 12 collections completed"` + visible text.

### 6.2 Lid Card — Glass Bento

```
┌──────────────────────────┐  rounded-[16px], shadow-sm, glass
│ ▓▓▓▓▓ gradient stripe 12px, rounded top                           │
│ Main Building · Ground floor                                        │
│ Today 7:00–9:00 am · Mang Ben                                       │
│ [● Scheduled]  [Biodegradable]                                      │
│ [      Start collection      ]  56px, bay gradient                  │
└──────────────────────────┘
Hover: shadow-md + lift
```

- Top stripe: 8px gradient (lid color), `rounded-t-[16px]`. Multi-category: segmented gradient.
- Fill: `bg-slab` glass + `border-white/40` + `shadow-sm`. Hover `shadow-md`.
- One primary action: `bg: linear-gradient(135deg, var(--bay), var(--bay-bright))`, `rounded-[12px]`, `shadow: 0 2px 8px rgba(28,78,110,0.3)`.

### 6.3 Status Tag — Pill + Dot

Was notched paper tag → now **pill with dot + subtle ring**.

| Status | Dot | Pill |
|---|---|---|
| Pending | hollow steel | `bg-white border-galvanized text-steel` |
| Scheduled | bay 40% | `bg-bay-wash text-bay-deep border-bay/20` |
| In progress | pulsing bay | `bg-bay text-white border-bay` + pulse dot |
| Collected | check in ok | `bg-ok-soft text-ok border-ok/20` |
| Missed | alarm | `bg-alarm-soft text-alarm border-alarm/20` |
| Overdue | alarm solid | `bg-alarm text-white border-alarm` + glow |
| Rescheduled | dashed | `bg-bay-wash text-bay-deep border-dashed` |
| Cancelled | struck | `bg-transparent text-steel border-transparent line-through` |

`rounded-full`, `px-3 py-1.5`, `gap-1.5`, `text-[11px] tracking 0.03em uppercase 600` — but **content stays sentence case** via `normal-case` (keeps modern pill look without shouting).

### 6.4 Category Chip — Glass Pill

12px swatch → **16px rounded swatch** in gradient pill: `bg-white/70 border-white/60 shadow-sm`, swatch `rounded-[4px] border-ink/10`, label `font-medium 12px`.

### 6.5 Load Bar — Modern Segmented

Was 8px flat → **10px rounded, inset shadow + gloss**:

- Track: `bg-concrete/60 rounded-full inset-shadow`
- Segments: lid gradients, `rounded-full` per segment, last segment has trailing glow.
- Value: `Geist Mono 13px tabular-nums` beside bar. Bar alone never conveys meaning.

### 6.6 New — Stat Tile (bento)

For dashboards: large number + label + sparkline/micro-bar.

```
┌─────────────────┐
│ 412 kg          │  Bricolage 28px
│ Biodegradable ↗ │  12px steel + trend arrow
│ █████▅▇█ 5d     │  mini gradient bar
└─────────────────┘
```

`rounded-[16px] glass shadow-sm`, `p-4`, `hover:shadow-md`.

---

## 7. Other Components — Modern

**Buttons**
- Primary: `linear-gradient(135deg, var(--bay), var(--bay-bright))`, white text, `rounded-[12px]`, `shadow: 0 2px 8px rgba(28,78,110,0.25)`, `hover: shadow-md + brightness(1.05)`, `active: scale(0.98)`.
- Secondary: `bg-white/70 backdrop-blur border-bay/20 text-bay hover:bg-bay-wash`.
- Ghost: `hover:bg-concrete/60`.
- Destructive: `linear-gradient(135deg, var(--alarm), #C5302A)`.
- Labels: still action-named. Never "Submit". Disabled: `bg-galvanized-soft/60 text-steel/60`.

**Form fields**
- Label: `text-[13px] font-600` above, hint `steel 12px` below.
- Field: `bg-white/80 backdrop-blur`, `border-galvanized/60`, `rounded-[12px]`, `h-11` (56px maintenance), `shadow-sm` inset.
- Focus: `ring: 0 0 0 3px rgba(28,78,110,0.15), 0 0 0 1px var(--bay)` + lift.
- Error: `border-alarm bg-alarm-soft`.

**Tables**
- Container: `rounded-[12px] border border-white/40 shadow-sm overflow-hidden`.
- Header: `bg-concrete/60 backdrop-blur`, `Instrument 600`, `text-ink`, `border-b border-galvanized-soft`.
- Rows: `h-52px`, `hover:bg-bay-wash/40`, selected `bg-bay-wash/60 border-l-[3px] border-bay`.
- On phones: still collapses to lid cards. Otherwise horizontal scroll with fade edges.

**Navigation — modern**
- Desktop: **floating glass rail** — `w-248px`, `m-3`, `rounded-[16px]`, `bg-slab/70 backdrop-blur-xl`, `border-white/40 shadow-md`, `p-2`. Active: `bg-bay text-white shadow-sm`, not wash. Hover: `bg-concrete/60`.
- Maintenance phone: **glass bottom bar** — `h-68px`, `rounded-t-[20px]`, `bg-slab/80 backdrop-blur-xl`, `border-t border-white/40`, `shadow-lg`, 3 items with `64px` touch, active has `bay` pill bg.
- Rail footer: user card `bg-white/60 rounded-[12px] p-3 border-white/40`.

**Dialogs & toasts — modern**
- Dialog: `rounded-[20px]`, `bg-slab-solid`, `border-white/40`, `shadow-lg`, `backdrop-blur`, `scale 0.96 → 1 spring`.
- Toast: `rounded-[12px]`, `bg-ink text-slab`, `border-white/10`, `shadow-lg`, slide-in from bottom.

**Empty states — illustrated**
- Was one sentence → Now **soft illustration + sentence + action**. Example: muted line drawing of empty bin in `concrete`, 48px, opacity 0.6, above text.

---

## 8. Layouts — Modern Bento

### 8.1 Admin Dashboard — Bento

```
┌────────┬──────────────────────────────────────────────────────┐
│ floating rail │  Header: Dashboard  [ Today ▾ ] [ Generate ]  │
│  (glass)      │  ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌─────┐ │
│  Dashbd       │  │ DayGauge │ │ 412kg   │ │ 138kg   │ │260kg│ │  ← stat tiles
│  Records      │  │ glass    │ │ Biodeg  │ │ Recycl  │ │Resid│ │
│  Schedules    │  └──────────┘ └─────────┘ └─────────┘ └─────┘ │
│  Collections  │  Needs attention  (bento lid-cards)             │
│  Concerns     │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  Reports      │  │ Overdue │ │ Missed  │ │ Scheduled│          │
│  Setup        │  └─────────┘ └─────────┘ └─────────┘           │
│  Users        │  Upcoming collections (glass table)             │
└────────┴──────────────────────────────────────────────────────┘
```
- Bento gaps `16px`, cards `rounded-[16px] glass shadow-sm`, hover lift. Mesh background visible between.

### 8.2 Maintenance Home — Glass Phone

```
┌─────────────────────────┐
│ Good morning, Mang Ben   │  Instrument 20px
│ ┌─────────────────────┐ │  DayGauge glass, full width
│ │  3 of 8 collected   │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │ lid-card glass, gradient stripe
│ │ Canteen  7–9am       │ │
│ │ [● In progress]      │ │
│ │ [ Mark as collected ]│ │  56px, bay gradient, shadow
│ └─────────────────────┘ │
│ [ My ][ Report ][ Me ]   │  glass bottom bar, blurred
└─────────────────────────┘
```

### 8.3 Office View — Calm Glass

Same floating rail, fewer items. Top: **compact DayGauge** + next collection lid-card + read-only table (glass). No editable controls shown — no disabled-state clutter, just `view-only` badge.

---

## 9. Motion — Modern

**Spring, not linear:**

1. **Day Gauge fill:** `spring(260,26)` 700ms in, 400ms update. + subtle glow pulse.
2. **Cards & buttons:** `hover: y -1px shadow-md 180ms spring`, `active: scale 0.98 100ms`.
3. **Dialogs/sheets/toasts:** `scale 0.96→1 + fade 200ms spring`, `backdrop blur 12px → 0`.
4. **Lists:** stagger `40ms` per card on first load.

`prefers-reduced-motion: reduce` → fade only, no lift/spring.

---

## 10. Content and Voice — Unchanged (modern polish)

- Plain, direct, sentence case. Action-named buttons. Left-aligned, numbers right.
- **New:** micro-copy is slightly warmer. "No records yet" → "No records yet — add your first one and it’ll appear here."

| Situation | Copy |
|---|---|
| Login failed | "Email or password is incorrect. Try again or ask the administrator to reset your password." |
| Required field | "Choose a location." |
| Future date | "The date can't be later than today." |
| Missed | "Collection marked as missed. The administrator can reschedule it." |
| Not allowed | "Your account can view this page but not change it." |
| Empty records | "No waste records yet. Add a record." |
| Success | "Record saved." |

Dates `Oct 25, 2026` · Times `7:00 am` · `412 kg` (Geist Mono).

---

## 11. Accessibility — Modern Floor (higher)

- Contrast 4.5:1 / 3:1 still. Glass cards keep solid text + `border-white/40` edge so contrast holds over mesh.
- Status/category always word + dot/swatch — never color alone.
- Focus visible: `0 0 0 2px white, 0 0 0 5px var(--bay)` double ring (legible over glass).
- Keyboard, screen reader, 200% zoom. Day Gauge + bars have text equivalents.
- Respect `prefers-reduced-motion` and `prefers-contrast: more` (switch to solid slabs).

---

## 12. Design Tokens — Modern (CSS)

```css
:root {
  /* Brand */
  --bay: #1C4E6E;
  --bay-bright: #2A7AA8;
  --bay-deep: #133A54;
  --bay-wash: #DCE8F0;
  --bay-glass: rgba(28,78,110,0.08);
  --bay-gradient: linear-gradient(135deg, var(--bay) 0%, var(--bay-bright) 100%);

  /* Surfaces — now glass */
  --ink: #17201D;
  --steel: #53605A;
  --concrete: #E5E8E4;
  --slab: rgba(246,247,244,0.85);
  --slab-solid: #F6F7F4;
  --galvanized: #AEB6B0;
  --galvanized-soft: rgba(211,216,211,0.6);

  /* Lid gradients */
  --lid-green: #2E7D4F;
  --lid-green-grad: linear-gradient(135deg, #2E7D4F 0%, #3FA76A 100%);
  --lid-yellow: #E3A908;
  --lid-yellow-grad: linear-gradient(135deg, #E3A908 0%, #F4C84A 100%);
  --lid-black: #2A2D2B;
  --lid-black-grad: linear-gradient(135deg, #2A2D2B 0%, #4A4F4D 100%);
  --lid-orange: #D4531A;
  --lid-orange-grad: linear-gradient(135deg, #D4531A 0%, #E87A4A 100%);

  /* Signals */
  --alarm: #A3221B;
  --alarm-soft: rgba(163,34,27,0.10);
  --ok: #1F6B3F;
  --ok-soft: rgba(31,107,63,0.10);
  --note-text: #8A5A00;
  --note-bg: #FBF0D2;

  /* Type — modern */
  --font-display: "Bricolage Grotesque", Outfit, sans-serif;
  --font-head: "Instrument Sans", Inter, system-ui, sans-serif;
  --font-body: "Inter", "Segoe UI", system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;
  --t-display: 48px;
  --t-h1: 32px;
  --t-h2: 22px;
  --t-h3: 18px;
  --t-body: 15px;
  --t-small: 13.5px;
  --t-micro: 11px;

  /* Space & shape — modern */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 20px; --s-6: 24px; --s-7: 32px; --s-8: 48px;
  --r-sm: 8px; --r-md: 12px; --r-lg: 16px; --r-xl: 20px; --r-pill: 999px;
  --r-data: 12px;
  --r-control: 12px;
  --r-lid: 16px;
  --target: 44px;
  --target-field: 56px;
  --shadow-sm: 0 1px 2px rgba(23,32,29,0.06), 0 4px 12px rgba(23,32,29,0.04);
  --shadow-md: 0 4px 16px rgba(23,32,29,0.08), 0 12px 32px rgba(23,32,29,0.06);
  --shadow-lg: 0 8px 32px rgba(23,32,29,0.12), 0 2px 8px rgba(28,78,110,0.08);
  --glass: blur(12px) saturate(1.2);
  --focus-ring: 0 0 0 2px white, 0 0 0 5px var(--bay);
}

body {
  background:
    radial-gradient(900px 600px at 10% 0%, #DCE8F0 0%, transparent 60%),
    radial-gradient(700px 500px at 90% 12%, #E8F0E6 0%, transparent 55%),
    var(--concrete);
  color: var(--ink);
  font: 400 var(--t-body)/22px var(--font-body);
}

h1, h2, h3 { font-family: var(--font-head); font-weight: 700; letter-spacing: -0.02em; }
.num { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

.lid-card {
  background: var(--slab);
  backdrop-filter: var(--glass);
  border: 1px solid rgba(255,255,255,0.4);
  border-top: 8px solid transparent; /* set via gradient */
  border-radius: var(--r-lid);
  box-shadow: var(--shadow-sm);
  transition: transform 180ms ease, box-shadow 180ms ease;
}
.lid-card:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }

.status-tag {
  border-radius: var(--r-pill);
  backdrop-filter: var(--glass);
}

.glass-panel {
  background: var(--slab);
  backdrop-filter: var(--glass);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
}

:focus-visible { outline: none; box-shadow: var(--focus-ring); }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## 13. Do and Don't — Modern

| Do | Don't |
|---|---|
| Use lid **gradients** for category (add depth) | Use lid flat color only |
| Use glass + shadow for elevation | Use 1px line alone to separate |
| Pill tags with dot + word | Notched paper tags (v1) |
| Bento grids with 16px gaps | Dense log rows with 1px dividers only |
| Spring motion on interaction | Linear fade only |
| Modern rounded `12–20px` | 2px everywhere |
| `Geist Mono` for numbers | Decorative numerals |

---

## 14. Build Notes — Modern

- Build maintenance at 360px first, then bento.
- Tokens in §12 are the **single source** — changing a lid hue updates its gradient everywhere.
- Glass needs `backdrop-blur` + `border-white/40` — test on Chrome/Edge and mid-range Android. Provide `--slab-solid` fallback where blur is unsupported.
- Test outdoor at noon: glass cards must keep 4.5:1 text contrast over mesh. If not, raise `bg-slab` opacity to `0.92`.
- Keep `prefers-reduced-motion` and `prefers-contrast: more` fallbacks.
- Replace placeholders (Mang Ben, Canteen, Library) with real TCGC names before ship.

---

## 15. Logo

**Source:** `ecotrack logo/` at repo root. **Served from:** `frontend/public/brand/`.

| Asset | Use |
|---|---|
| `logo-icon.svg` | App mark — nav, auth, favicon |
| `logo-horizontal.svg` | Lockup with wordmark — login, print header, external docs |
| `logo-app-icon-512.png` | App icon / `apple-touch-icon` |
| `favicon-32.png` | Browser tab fallback |

The mark is a waste bin with the four lid colors on its lid, a bay-blue fill and a check — it is the design system in one shape.

**Rules**
- The four lid segments are fixed: green, yellow, black, orange, in that order. Never reorder, recolor or merge them.
- Minimum sizes: mark 24 px; horizontal lockup 96 px wide.
- Clear space = half the mark's width on all sides.
- On dark backgrounds, place the mark on a white tile (or the white lockup card). Never put the dark wordmark directly on `--bay`.
- Don't stretch, rotate, add effects to the artwork, or place it on a lid-color background.
- In code use `BrandMark`, `BrandLockup`, `BrandName` from `src/components/brand/Logo.tsx`; do not re-import the image files ad hoc.
