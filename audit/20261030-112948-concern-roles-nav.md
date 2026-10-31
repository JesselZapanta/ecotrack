# Audit: Remove admin/maintenance report forms, add maintenance concerns

**Date**: 2026-10-30 11:29
**Task**: Remove `/admin/report-concern` and the maintenance report form; add the concerns list to maintenance.

## Files Changed

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/admin/concerns/index.tsx` | Removed the "Report a concern" button and unused imports; empty copy now says only offices report |
| `frontend/src/App.tsx` | Removed `admin/report-concern` and `maintenance/report-concern` routes; added `maintenance/concerns`; imported the maintenance concerns page |
| `frontend/src/components/nav.tsx` | Maintenance nav: "Report a concern" replaced with "Concerns" → `/maintenance/concerns` |
| `frontend/src/maintenance/concerns/index.tsx` | New — read-only concerns list for maintenance |
| `frontend/src/maintenance/concern/index.tsx` | Removed — unused re-export of the report form |

### Backend
| File | Changes |
|------|---------|
| `backend/app/Concerns/Controllers/ConcernController.php` | Maintenance now lists and opens **all** concerns (removed the `reported_by = self` scope and its detail guard) |
| `backend/tests/Feature/Concerns/ConcernManagementTest.php` | Updated: maintenance sees all concerns; office remains restricted; detail access expectations adjusted |

### Docs
| File | Changes |
|------|---------|
| `AGENTS.md` | Concerns scoping/nav updated: only office has a report form; maintenance is read-only |

## Summary

- **Admin** — no report form. `/admin/concerns` only manages the queue; the "Report a concern" button is gone and `/admin/report-concern` now falls through to the dashboard.
- **Maintenance** — report form removed (route and nav). The nav now has **Concerns** at `/maintenance/concerns`, showing the same concern list as admin but **read-only**: details and resolution notes are visible, no Acknowledge/Resolve/Reopen actions.
- **Office** — unchanged: keeps `/office/concerns` with its "Report a concern" button and `/office/report-concern` form.

**Verification**
- Admin: 0 "Report a concern" buttons; `/admin/report-concern` redirects to `/admin/dashboard`
- Maintenance (Ben): nav has Concerns and no report item; 6 concern cards; 6 "View details" buttons; **0** admin action buttons
- Office (educ): report link still present and opens `/office/report-concern` with the submit form
- Mobile 375px: no horizontal overflow, no console errors
- `php artisan test` → **109 passed** (548 assertions); concerns suite 13 passed
- `npm run build` ✓ · `npm run lint` clean

## Notes
- Only the UI was removed; `POST /api/concerns` still accepts authenticated roles. Restricting it to office-only would be a follow-up if required.
- Maintenance sees all concerns because the page mirrors the admin list; it remains read-only, and status changes are still admin-only.
- The office report form remains the single reporting entry point.
