# Audit: Integrate EcoTrack logo into the app

**Date**: 2026-10-25 20:46
**Task**: Use the provided `ecotrack logo` asset kit and incorporate the logo into the system.

## Files Changed

| File | Changes |
|------|---------|
| `frontend/public/brand/logo-icon.svg` | New — copied from `ecotrack logo/logo-icon.svg` (bin mark) |
| `frontend/public/brand/logo-horizontal.svg` | New — copied from `ecotrack logo/logo-horizontal.svg` (mark + wordmark) |
| `frontend/public/brand/logo-app-icon-512.png` | New — copied for app icon / apple-touch-icon |
| `frontend/public/brand/favicon-32.png` | New — copied for browser tab |
| `frontend/src/components/brand/Logo.tsx` | New — `BrandMark`, `BrandLockup`, `BrandName` components (tile sizes xs→xl, light/dark name) |
| `frontend/src/components/layout/AppShell.tsx` | Replaced "ET" letter tiles with `BrandMark` + `BrandName` in desktop rail and mobile top bar; removed unused `Leaf` import |
| `frontend/src/pages/Login.tsx` | Brand panel now shows the horizontal logo on a white card; mobile form header uses `BrandMark` + `BrandName`; removed `Leaf` |
| `frontend/src/pages/Reports.tsx` | Added print-only header with horizontal logo + report meta |
| `frontend/src/components/ecotrack/PageHeader.tsx` | Page actions hidden in print (`print:hidden`) |
| `frontend/index.html` | Brand favicons (SVG + 32px PNG), apple-touch-icon, Open Graph title/description/image |
| `DESIGN.md` | Added §15 Logo: asset table, fixed lid-color order, min sizes, clear space, dark-background rule, code primitives |
| `AGENTS.md` | Added logo assets + primitives note |
| `frontend/src/assets/hero.png`, `react.svg`, `vite.svg` | Removed — unused Vite template assets |
| `frontend/public/favicon.svg`, `icons.svg` | Removed — unused Vite template assets |

## Summary

The supplied logo kit is now the brand across the app. The bin mark appears in the desktop rail and mobile header inside a white tile (so its bay outline stays visible on glass), the horizontal lockup anchors the login brand panel, and the same lockup prints on reports. Favicons and Open Graph metadata use the brand assets. Added reusable `BrandMark` / `BrandLockup` / `BrandName` primitives so future screens stay consistent.

Verification: `npm run build` passes (CSS 91.6 kB, JS 629.7 kB) and `npm run lint` is clean. Brand assets are emitted to `dist/brand/`.

## Notes

- The mark's four lid segments are fixed brand art (green, yellow, black, orange) — never reorder or recolor.
- Dark backgrounds: mark is placed on a white tile; the dark wordmark is never placed directly on bay blue.
- The horizontal SVG's wordmark references `Archivo` / `Atkinson Hyperlegible`. Those fonts are no longer loaded, so it falls back to `Arial Black` / `Arial` (available on the target Windows/Chrome devices). If exact wordmark fidelity matters, load Archivo or use `logo-horizontal.png`.
- Source kit remains at `ecotrack logo/`; runtime copies live in `frontend/public/brand/`.
