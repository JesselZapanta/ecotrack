# Audit: Combine maintenance dashboard and My route

**Date**: 2026-10-26 23:15
**Task**: `/maintenance/dashboard` and `/maintenance/my-collections` had similar content — combine them and make it the dashboard.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/maintenance/dashboard/index.tsx` | Now re-exports `@/maintenance/route` (the route page becomes the dashboard) |
| `frontend/src/maintenance/route/index.tsx` | PageHeader title "My route" → "Dashboard", subtitle "Today's route · ..." |
| `frontend/src/App.tsx` | `/maintenance/my-collections` now redirects to `/maintenance/dashboard`; removed unused `MyRoutePage` import |
| `frontend/src/components/nav.tsx` | Removed the redundant "My route" nav item (dashboard covers it) |
| `frontend/src/admin/dashboard/index.tsx` | "Open my route" link → `/maintenance/dashboard` ("Open dashboard") |

## Summary

The maintenance dashboard now is the route page: RouteStrip progress, next-stop card, and all stops list live on `/maintenance/dashboard`. The separate `/maintenance/my-collections` URL redirects to the dashboard for backwards compatibility.

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser: `/maintenance/dashboard` renders route content ("All stops"); `/maintenance/my-collections` redirects to `/maintenance/dashboard`

## Notes
- The maintenance sidebar now has 4 items: Today (Dashboard), Schedules, Report a concern, Account.
- `src/maintenance/route/index.tsx` is still the single source of truth for the field view.
