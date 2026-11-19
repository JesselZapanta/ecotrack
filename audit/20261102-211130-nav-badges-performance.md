# Audit: Nav badge performance optimization

**Date**: 2026-11-02 21:11
**Task**: Make sure the sidebar notification badges do not affect performance and optimize the implementation.

## Files Changed

### Backend
| File | Changes |
|------|---------|
| `backend/app/Concerns/Controllers/NavBadgeController.php` | Replaced per-status counts with one conditional-aggregate query; office scoping now uses an indexed `whereIn` subquery instead of loading the office relation |
| `backend/tests/Feature/Nav/NavBadgeTest.php` | Added a query-count regression test: every role answers in exactly **2 queries** |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/lib/nav-badges.ts` | Shared external store with `useSyncExternalStore`, 30 s TTL, in-flight dedupe, stable-state comparison and forced refresh |
| `frontend/src/components/SideNavLinks.tsx` | New — owns the badge subscription so count updates re-render only the nav links, never the page content |
| `frontend/src/admin/layout.tsx` | Uses `SideNavLinks`; removed the layout-level `useNavBadges` state |
| `frontend/src/maintenance/layout.tsx` | Same, with the 44px `dark-touch` variant |
| `frontend/src/office/layout.tsx` | Same, with the light variant |
| `frontend/src/admin/schedules/api.ts` | Forces a badge refresh after create/update/delete/status/sweep |
| `frontend/src/concerns/api.ts` | Forces a badge refresh after reporting a concern and after status changes |
| `AGENTS.md` | Updated the sidebar-badges note |

## Summary

### Backend
- **One aggregate query** now returns both schedule counts (`missed`, `today`) instead of one `COUNT` per status:
  `SUM(CASE WHEN status = ? THEN 1 ELSE 0 END)`.
- **Office scoping** uses a single `whereIn (select schedule_location.collection_schedule_id ... join offices ...)` subquery, removing the extra `offices` lookup.
- Result: **exactly 2 queries per request for every role** (concerns count + schedule aggregate), down from 3 for maintenance and 3–4 for office.
- `EXPLAIN` confirms index use: offices `const`, `schedule_location` `ref` via `schedule_location_location_id_foreign` (`Using index`), `collection_schedules` `eq_ref` via primary key.

### Frontend
- **No unnecessary requests:** a 30 s TTL means route changes and window focus do not refetch fresh counts; an in-flight request is shared across every mounted nav instance (desktop + mobile sheet).
- **Forced refresh** after concern/schedule writes calls the store directly and queues a follow-up if a request was already in flight, so counts are never left stale.
- **No page re-renders:** badge state moved out of the layouts into `SideNavLinks`; count updates only re-render the nav list. Identical counts are ignored, so no state update/render happens when nothing changed.
- **No duplicate work:** the mobile sheet and desktop rail share the same store; opening the drawer does not trigger another request within the TTL.
- The 30 s cache is token-scoped, so switching accounts never shows the previous user’s counts.

**Verification**
- `php artisan test` → **122 passed** (603 assertions), including the query-count test
- `npm run build` ✓ · `npm run lint` clean
- Browser: badges still render for admin (6/5), maintenance (4/5) and office (1)
- Within the TTL: route change → **0** badge requests, focus → **0** badge requests
- Forced refresh → **1** request; badge values preserved
- 320px and 375px: no horizontal overflow, badges remain inside the mobile drawer
- Dev API latency (~300 ms) is dominated by the single-threaded `php artisan serve`/PowerShell baseline — `/auth/me` measures the same; the meaningful metrics are 2 indexed queries and request frequency

## Notes
- Counts remain on-demand; no new tables, migrations or cache infrastructure were added.
- A 30 s TTL was chosen so counts stay effectively live after user actions (which force a refresh) without polling. Other users’ changes surface on the next focus/route change after the TTL.
- Adding a `schedule_location.location_id` index was unnecessary: the foreign key already created one and `EXPLAIN` shows it is used.
