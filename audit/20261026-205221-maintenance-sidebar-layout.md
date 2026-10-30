# Audit: Maintenance layout gets a sidebar (all roles consistent)

**Date**: 2026-10-26 20:52
**Task**: The maintenance layout should match the other role layouts — with a sidebar — instead of the top nav + mobile bottom bar.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/maintenance/layout.tsx` | Rewritten — dark 248px `bg-sidebar` rail (brand, "Field work" group, nav, user card with logout), sticky top bar with breadcrumb + avatar, `Sheet` drawer below `md`, content column `max-w-[1280px]`. Removed the horizontal top nav and the fixed mobile bottom bar. Rail links get `min-h-11` on mobile (44px touch) and stay compact on desktop. |
| `frontend/src/admin/layout.tsx` | `Sheet` is now controlled (`navOpen`) and the rail closes it on any click — fixes the drawer staying open after navigating |
| `frontend/src/office/layout.tsx` | Same controlled `Sheet` + close-on-nav fix |
| `frontend/src/maintenance/route/index.tsx` | Content wrapper constrained to `mx-auto max-w-[880px]` so the field page does not stretch across the new wide column |
| `frontend/src/App.tsx` | Toaster `mobileOffset` from `84` → `16` (the 84px offset existed only to clear the removed bottom bar) |
| `AGENTS.md` | Layouts bullet updated: maintenance now uses the dark rail + sheet drawer, no bottom bar |

## Summary

Maintenance now uses the same shell as admin and office: a fixed dark sidebar on `md:` and up, a hamburger + slide-in drawer on phones, and a breadcrumb bar across the top. The field-crew identity is kept in the rail subtitle ("Field crew") and the breadcrumb prefix, and the mobile nav rows are 44px tall so they stay tappable outdoors.

The `/my-collections` page is the only screen that needed a width cap — the rest (dashboard, schedules, report concern, account) already use wide or self-constrained layouts.

While verifying the drawer I found a real defect: after tapping a nav item the sheet stayed open, covering the destination page. It affected all three layouts (the `Sheet` was uncontrolled). All three are now controlled and close on any rail click, so navigation dismisses the drawer.

**Verification**
- `npm run build` ✓ and `npm run lint` clean
- Desktop 1440px (maintenance): rail renders `Today · My route · Schedules · Report a concern · Account`, breadcrumb reads `Field crew / <page>`, schedules table fills the wide column
- Mobile 375px: no bottom bar, hamburger opens the dark drawer, drawer links measure **44px** high, tapping "Schedules" navigates and the drawer closes; `scrollWidth === 375`
- 320px: `scrollWidth === 320` (no horizontal scroll)
- Drawer close-on-navigate re-tested for all roles: maintenance `before=1 after=0`, admin `before=1 after=0`, office `before=1 after=0`

## Notes
- Removed the mobile bottom bar entirely; the drawer is now the only mobile nav, matching admin/office.
- The dev server served a stale transform of `admin/layout.tsx` during verification (Windows watcher missed the change); touching the file refreshed it. A `npm run dev` restart clears it for anyone who hits the same thing.
- The Toaster offset change is cosmetic but necessary — toasts would otherwise float 84px above the bottom of the screen with no bar to clear.
