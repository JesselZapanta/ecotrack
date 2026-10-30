# Audit: All frontend routes prefixed with the user role

**Date**: 2026-10-26 21:04
**Task**: Update all routes/URLs so they begin with the user role (e.g. `http://localhost:5173/admin/users`).

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/App.tsx` | Rewrote the route table — every protected screen now lives under `admin/`, `office/` or `maintenance/` (dashboard, users, records, schedules, collections + detail, concerns, reports, locations, offices, categories, audit, report-concern, account, my-collections). Removed the shared top-level paths and the `AllowRoles`/`RoleModule` wrappers in favour of `RoleRoute` guards per role. |
| `frontend/src/components/nav.tsx` | All `to` targets prefixed with the role (`/admin/...`, `/office/...`, `/maintenance/...`) |
| `frontend/src/admin/dashboard/index.tsx` | Internal `Link` targets prefixed (`/admin/schedules`, `/admin/collections`, `/admin/records`, `/admin/report-concern`, `/maintenance/my-collections`) |
| `frontend/src/admin/collection-detail/index.tsx` | Back links prefixed to `/admin/collections` |
| `frontend/src/maintenance/route/index.tsx` | "Full schedule" link prefixed to `/maintenance/schedules` |
| `frontend/src/auth/concern/index.tsx` | Post-submit navigation made role-aware (`/admin/concerns` for admins, role home for others) |

## Summary

Every screen is now namespaced by role, so the URL alone tells you which workspace you are in: `http://localhost:5173/admin/users`, `http://localhost:5173/office/schedules`, `http://localhost:5173/maintenance/my-collections`, etc. `RoleRoute` guards each group, so a user who types another role's URL is bounced to their own home. Legacy top-level URLs (e.g. `/schedules`) now resolve to the role home redirect.

`ROLE_HOME` in `store.tsx` and the backend `User::homePath()` were already role-prefixed, so login redirects and the `PublicOnly`/`RoleHomeRedirect` guards needed no change.

**Verification**
- `npm run build` ✓ and `npm run lint` clean
- Browser smoke (desktop 1440px) for all three roles: every role-prefixed route resolves (`OK`) and the sidebar click navigates within the same prefix
- Legacy `/schedules` for an admin redirects to `/admin/dashboard`
- Report-concern submit routes per role: admin → `/admin/concerns`, office → `/office/dashboard`, maintenance → `/maintenance/dashboard`
- Collection-detail back link updated to `/admin/collections`

## Notes
- `RoleModule` is no longer used in `App.tsx` (each role renders its own page component directly); the shared page components (`office/schedules`, `office/records`, …) still re-export the admin implementations, so behaviour is unchanged.
- Cross-role links (admin dashboard → "Open my route" → `/maintenance/my-collections`) remain intentionally cross-role; `RoleRoute` redirects non-maintenance users to their own home, matching prior behaviour.
- `backend/User::homePath()` already returned the prefixed paths, so no backend change was needed.
