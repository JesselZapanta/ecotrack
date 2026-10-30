# Audit: Typography refresh (drop serif)

**Date**: 2026-10-25 22:10
**Task**: Replace the disliked font/typography system with a new type pairing and scale.

## New type system

| Role | Font | Usage |
|---|---|---|
| Display / headings / KPI numbers | **Schibsted Grotesk** 600–700 | `.display`, `h1`–`h4`, page titles, stat values, login headline |
| UI / body / buttons / tables | **Manrope** 400–700 | body, labels, nav, forms, table cells |
| Figures / IDs | **JetBrains Mono** 400–500 | `.num`, quantities, dates, timestamps |

- No serif anywhere; the previous Instrument Serif is fully removed.
- Tighter hierarchy: page titles 32→38px (was 36→42), KPI numbers 30→34px (was 32→36), route number 34px (was 40), login headline 38→44px (was 46→54).
- Labels are now 10px/700/0.12em (was 10.5px/600/0.1em); table heads 10px/700.
- Buttons use Manrope 600.
- Brand wordmark uses Schibsted Grotesk for consistency with the logotype.

## Files Changed

| File | Changes |
|------|---------|
| `frontend/index.html` | Google Fonts → Schibsted Grotesk, Manrope, JetBrains Mono |
| `frontend/src/index.css` | Font tokens, `h1–h4` → display font, `.display` → grotesk 700, `.label` tightened |
| `frontend/src/components/ecotrack/PageHeader.tsx` | Title scale reduced to 32/38px |
| `frontend/src/components/ecotrack/StatTile.tsx` | KPI scale 30/34px; sparkline hidden on mobile |
| `frontend/src/components/ecotrack/RouteStrip.tsx` | Hero number 34px; label “collected”; mobile fade affordance |
| `frontend/src/components/brand/Logo.tsx` | Brand wordmark in display font |
| `frontend/src/components/ui/button.tsx` | Manrope 600 buttons |
| `frontend/src/components/ui/table.tsx` | 10px/700 table heads |
| `frontend/src/pages/Login.tsx` | Headline scale reduced; brand wordmark in display font |
| `frontend/src/pages/Dashboard.tsx` | KPI grid 2-up on mobile; upcoming table becomes cards under `sm` |
| `AGENTS.md` / `README.md` / `DESIGN.md` | Font references updated to Schibsted Grotesk / Manrope / JetBrains Mono |

## Summary

Replaced the serif-led hierarchy with an all-grotesk system: Schibsted Grotesk for titles and numbers, Manrope for UI, JetBrains Mono for figures. The scale was tightened so titles feel confident without dominating. Mobile dashboards now show 2×2 KPI cards and card-based upcoming collections instead of a clipped table.

Verified in headless Chrome at 1440px and 390px (login, admin dashboard, mobile dashboard). `npm run build` ✓ and `npm run lint` clean.

## Notes

- The Fieldwork palette/layout from the previous task is unchanged; only typography and the mobile table treatment changed.
- `DESIGN.md` remains historical; live tokens are in `frontend/src/index.css`.
- Temporary Playwright scripts/dependency were removed and dev servers stopped after verification.
