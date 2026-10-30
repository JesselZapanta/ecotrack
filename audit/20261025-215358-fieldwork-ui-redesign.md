# Audit: Fieldwork UI redesign (independent direction)

**Date**: 2026-10-25 21:53
**Task**: Redesign the frontend without following `DESIGN.md` — a fresh design direction chosen by the agent.

## Direction: Fieldwork

An editorial operations system instead of glassmorphism:

- **Warm paper canvas** (`#F5F4EF`) with white surfaces and 1px `#E3E1D8` borders — no glass, no gradients, no decorative shadows.
- **Deep pine brand** (`#0E4A36`) for actions, a **lime** signal accent (`#C6F26B`) for the active nav marker.
- **Instrument Serif** for page titles and hero numbers; **Geist** for UI; **Geist Mono** for figures.
- **Dark 248px sidebar** with a sticky top bar, 1280px content column, and a white mobile bottom bar.
- **Signature element:** the **RouteStrip** — a horizontal collection route with status nodes, replacing the glass Day Gauge.
- **Kanban collections board** grouped by status, replacing the card grid + table.
- Flat 8–12px radii, dot-only category color, solid buttons, 44/56px targets.

## Files Changed

| File | Changes |
|------|---------|
| `frontend/index.html` | Fonts → Geist, Geist Mono, Instrument Serif; theme color |
| `frontend/src/index.css` | Full rewrite: Fieldwork tokens, shadcn mapping, `.display` / `.num` / `.label`, flat utilities, print + reduced motion |
| `frontend/src/components/ui/card.tsx` | Flat bordered surface, 12px radius, compact padding |
| `frontend/src/components/ui/button.tsx` | Solid brand primary, outline/secondary/ghost/destructive, 8px radius |
| `frontend/src/components/ui/input.tsx` | 40px field, 1px line, brand focus ring |
| `frontend/src/components/ui/textarea.tsx` | Matching flat field |
| `frontend/src/components/ui/label.tsx` | 12.5px medium label |
| `frontend/src/components/ui/badge.tsx` | 6px rounded badge + soft/success/warning |
| `frontend/src/components/ui/table.tsx` | Paper header, uppercase micro-labels, 48px rows |
| `frontend/src/components/ui/dialog.tsx` | White 14px panel, 1px border, soft shadow, ink scrim |
| `frontend/src/components/ui/select.tsx` | Flat trigger + popover |
| `frontend/src/components/ui/tabs.tsx` | Segmented control |
| `frontend/src/components/ui/sheet.tsx` | Flat sheet |
| `frontend/src/components/ui/sonner.tsx` | Light bordered toast |
| `frontend/src/components/ecotrack/PageHeader.tsx` | Serif title + eyebrow + actions |
| `frontend/src/components/ecotrack/StatTile.tsx` | Serif KPI, delta, SVG sparkline |
| `frontend/src/components/ecotrack/RouteStrip.tsx` | **New** — route nodes, progress, legend |
| `frontend/src/components/ecotrack/StatusTag.tsx` | Flat dot + label badge |
| `frontend/src/components/ecotrack/CategoryChip.tsx` | Dot + name (no pill noise) |
| `frontend/src/components/ecotrack/LidCard.tsx` | Flat card with 3px category edge |
| `frontend/src/components/ecotrack/EmptyState.tsx` | Flat empty panel |
| `frontend/src/components/ecotrack/DayGauge.tsx` | **Deleted** — replaced by RouteStrip |
| `frontend/src/components/layout/AppShell.tsx` | Dark sidebar, sticky top bar, command search (⌘K), mobile sheet, maintenance bottom bar |
| `frontend/src/components/auth/RequireAuth.tsx` | Flat session splash + `AllowRoles` guard |
| `frontend/src/components/brand/Logo.tsx` | Wordmark classes updated for Geist |
| `frontend/src/App.tsx` | Role-based route groups (`AllowRoles`), toast bottom-right + mobile offset |
| `frontend/src/pages/Login.tsx` | Dark editorial brand panel, serif headline, demo accounts, real JWT login |
| `frontend/src/pages/Dashboard.tsx` | Bento KPI row, RouteStrip, needs-attention list, waste mix, role-specific variants |
| `frontend/src/pages/Records.tsx` | Filter toolbar, flat table, mobile cards, dialog |
| `frontend/src/pages/Schedules.tsx` | Segmented list/calendar, flat rows, calendar agenda |
| `frontend/src/pages/CollectionsBoard.tsx` | **Kanban board** across 5 status columns |
| `frontend/src/pages/MyCollections.tsx` | Next-stop card, route strip, stop list, missed sheet |
| `frontend/src/pages/Concerns.tsx` | Status-edged concern cards |
| `frontend/src/pages/ReportConcernPage.tsx` | Flat concern form |
| `frontend/src/pages/Reports.tsx` | Print header, filters, KPI row, summary table |
| `frontend/src/pages/Locations.tsx` | Flat table + dialog |
| `frontend/src/pages/Offices.tsx` | Flat table + dialog |
| `frontend/src/pages/Categories.tsx` | Color cards, table, rule note |
| `frontend/src/pages/Users.tsx` | Flat table, role badges, active toggle |
| `frontend/src/pages/AuditLog.tsx` | Stat row + activity table |
| `frontend/src/pages/Account.tsx` | Profile + access/session cards + password form |
| `frontend/src/pages/CollectionDetail.tsx` | Flat hero, meta grid, history timeline, actions |
| `AGENTS.md` | Design section rewritten to Fieldwork; token source noted |
| `README.md` | Design section rewritten to Fieldwork |
| `DESIGN.md` | Header notes the Harbor Glass doc is historical |

## Summary

Replaced the glass/mesh system with a warm, flat, editorial operations UI. The new layout uses a dark sidebar and sticky top bar, serif page titles, flat bordered cards, dot-only category color, and a route-strip signature. The collections screen is now a status board, and dashboards are built from KPI tiles + route + attention list.

Verified in headless Chrome at 1440px and 390px:
- Login, admin dashboard, collections board, records, maintenance dashboard, office dashboard, schedules all render.
- Role routing works (admin/maintenance/office land on their own dashboards; cross-role URLs redirect).
- Fixed: maintenance greeting, next-stop action label, route totals (today vs all), office record filtering, route label truncation, toast placement.
- `npm run build` ✓ (68.2 kB CSS / 677.7 kB JS) and `npm run lint` clean.

## Notes

- `DESIGN.md` is retained as history; the live tokens are in `frontend/src/index.css`. Update both if the design changes again.
- Temporary Playwright scripts and `playwright-core` were removed after screenshots; no dependency was added.
- The dev servers used for verification were stopped.
- Still mock-data screens: records, schedules, collections, concerns, reports, admin master data. Auth is the only DB-backed module.
- Build still warns about the >500 kB JS chunk; code-splitting remains a follow-up.
