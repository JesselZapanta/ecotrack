# Audit: Modern frontend redesign (Harbor Glass v2)

**Date**: 2026-10-25 20:31
**Task**: Redesign the entire frontend using the new modern `DESIGN.md` (Harbor Glass v2) with Tailwind + shadcn/ui + lucide-react, keeping every link and button working.

## Files Changed

| File | Changes |
|------|---------|
| `DESIGN.md` | Replaced with v2 "Harbor Glass": glass surfaces, mesh background, lid gradients, layered shadows, Bricolage/Instrument/Inter/Geist Mono, pill status tags, bento layouts, spring motion, full modern token block |
| `AGENTS.md` | Design section updated to v2 (glass/shadows/gradients allowed, new fonts, reusable primitives) |
| `README.md` | Design System section updated to Harbor Glass palette + typography |
| `frontend/index.html` | New Google Fonts (Bricolage Grotesque, Instrument Sans, Inter, Geist Mono), `theme-color` |
| `frontend/src/index.css` | Full rewrite: modern tokens (`--bay-bright`, `--slab` glass, `--lid-*-grad`, `--shadow-sm/md/lg`, `--glass`, radii 8/12/16/20), mesh body background, shadcn mapping, utilities `.glass`, `.glass-strong`, `.glass-hover`, `.lid-card` (gradient stripe via `--lid-stripe`), `.status-tag`, `.pulse-dot`, `.fade-up`, `.stagger`, print + reduced-motion fallbacks |
| `frontend/src/components/ui/card.tsx` | Glass card defaults: 16px radius, `bg-white/70`, `backdrop-blur-xl`, `shadow-sm`, new padding/gaps |
| `frontend/src/components/ui/button.tsx` | Gradient primary, glass outline/secondary, 12px radius, lift/active scale, new `xl` size |
| `frontend/src/components/ui/input.tsx` | Glass field, 12px radius, h-11, inset shadow, 3px bay focus ring, alarm error state |
| `frontend/src/components/ui/textarea.tsx` | Glass field styling |
| `frontend/src/components/ui/label.tsx` | 13px semibold label |
| `frontend/src/components/ui/badge.tsx` | Pill badge + `soft` / `success` / `warning` variants |
| `frontend/src/components/ui/table.tsx` | Glass header, 11px head labels, 52px rows, bay-wash hover, selected left bar |
| `frontend/src/components/ui/dialog.tsx` | 20px radius, glass-strong surface, `shadow-lg`, blurred overlay, floating close button |
| `frontend/src/components/ui/select.tsx` | Glass trigger, 12px radius, glass popover, pill-friendly items |
| `frontend/src/components/ui/tabs.tsx` | Pill tab list + gradient bay active state |
| `frontend/src/components/ui/sheet.tsx` | Glass sheet, 20px rounded bottom, floating close button |
| `frontend/src/components/ui/sonner.tsx` | Dark glass toasts, modern radii |
| `frontend/src/lib/mockData.ts` | Added `grad` (135° lid gradient) to each waste category |
| `frontend/src/components/ecotrack/DayGauge.tsx` | Glass vessel: lid, animated gradient fill, inner glow, glare, ring, spring-ish transition |
| `frontend/src/components/ecotrack/StatusTag.tsx` | Pill tags with dot/glyph + tone per status (pulse for In Progress / Overdue glow) |
| `frontend/src/components/ecotrack/CategoryChip.tsx` | Gradient swatch pill + `CategorySwatch` |
| `frontend/src/components/ecotrack/LidCard.tsx` | Glass bento card, gradient top stripe (segmented for multi-category), hover lift, gradient primary action |
| `frontend/src/components/ecotrack/PageHeader.tsx` | New shared page header with eyebrow/title/subtitle/actions |
| `frontend/src/components/ecotrack/StatTile.tsx` | New bento stat tile with trend + micro bar chart |
| `frontend/src/components/ecotrack/EmptyState.tsx` | New illustrated-empty state with action |
| `frontend/src/components/layout/AppShell.tsx` | Floating glass rail (272px), glass mobile top bar + sheet, glass maintenance bottom bar (68px), modern role switcher |
| `frontend/src/pages/Login.tsx` | Split-screen glass login: gradient brand panel + role cards + icon fields |
| `frontend/src/pages/Dashboard.tsx` | Bento dashboard for all 3 roles: glass DayGauge, 4 stat tiles with sparklines, waste mix bars, attention cards, upcoming table |
| `frontend/src/pages/Records.tsx` | Glass filter bar, modern table, mobile lid cards, restyled add/edit dialog + validation |
| `frontend/src/pages/Schedules.tsx` | Pill tabs list/calendar, glass calendar card, modern schedule cards, restyled dialog |
| `frontend/src/pages/CollectionsBoard.tsx` | Count chips, lid-card board, modern table, status dialog |
| `frontend/src/pages/MyCollections.tsx` | Phone-first glass route cards, compact DayGauge, missed sheet |
| `frontend/src/pages/Concerns.tsx` | Status-striped glass concern cards, restyled report dialog with photo dropzone |
| `frontend/src/pages/ReportConcernPage.tsx` | Gradient-topped glass form, photo dropzone |
| `frontend/src/pages/Reports.tsx` | Glass filters, stat tiles, summary table, collection report tiles |
| `frontend/src/pages/Locations.tsx` | PageHeader + glass table + modern dialog |
| `frontend/src/pages/Offices.tsx` | PageHeader + glass table + modern dialog |
| `frontend/src/pages/Categories.tsx` | Gradient category cards, table, color picker, rule callout |
| `frontend/src/pages/Users.tsx` | Role badges, avatars, active toggle, modern dialog |
| `frontend/src/pages/AuditLog.tsx` | Stat tiles + avatar timeline table |
| `frontend/src/pages/Account.tsx` | Gradient profile header, role/security cards, password form |
| `frontend/src/pages/CollectionDetail.tsx` | Gradient lid hero, timeline history, action panel |

## Summary

Rebuilt the whole SPA against `DESIGN.md` v2. All 16 routes still render, every `Link`/`Button`/dialog/status action remains wired to mock state and sonner toasts. Visual system is now glassy and layered: mesh background, frosted surfaces, gradient lid colors, soft shadows, pill tags, bento grids, floating navigation, and a glass Day Gauge with animated fill.

Verification: `npm run build` passes (2261 modules, 92.7 kB CSS / 630 kB JS) and `npm run lint` passes clean.

## Notes

- No backend added; all data is still mock (`src/lib/mockData.ts`) with role switching in `localStorage`.
- `--lid-stripe` custom property drives the `.lid-card` top gradient; multi-category schedules render a segmented stripe.
- v1 flat rules are retired in `DESIGN.md` v2 — glass, shadows and gradients are now intentional.
- Build warns about a >500 kB JS chunk; acceptable for now, code-splitting is a follow-up.
- `next-themes` remains a dependency but is no longer imported by `sonner.tsx`.
- Verify outdoor contrast: if glass reads weak in sunlight, raise `--slab` opacity toward `0.92` (documented in DESIGN.md §14).
