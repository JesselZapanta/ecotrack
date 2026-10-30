# Audit: Remove redundant /admin/collections board

**Date**: 2026-10-26 23:58
**Task**: `/admin/collections` feels redundant — remove it.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/App.tsx` | Removed `CollectionsPage` and `CollectionDetailPage` imports + their two routes (`admin/collections`, `admin/collections/:id`) |
| `frontend/src/admin/dashboard/index.tsx` | "Open" links → `/admin/schedules`; "Collections board" → "Schedules board" → `/admin/schedules` |

## Summary

The collections kanban board (grouped by status) was redundant with the schedules module (list + calendar + status filters + status updates). Removed the routes so the board is no longer reachable; the dashboard's collection-related links now point to `/admin/schedules`. The orphaned `src/admin/collections` and `src/admin/collection-detail` files remain (mock-based, unused) — delete them if desired.

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Legacy `/admin/collections` now falls through to the catch-all → role home

## Notes
- `/admin/collection-detail/:id` links in the dashboard were repointed to `/admin/schedules`.
- If a per-schedule detail view is wanted later, it can be added under `/admin/schedules/:id` instead.
