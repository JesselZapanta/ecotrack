# Audit: Office concerns scoped to the office

**Date**: 2026-10-29 21:58
**Task**: `/office/concerns` must only show the office's own concerns (or the user's own) — not every concern at the shared location.

## Files Changed
| File | Changes |
|------|---------|
| `backend/database/migrations/2026_10_29_000002_create_concerns_table.php` | Added nullable `office_id` FK (offices, nullOnDelete) + `office_id/status` index |
| `backend/app/Models/Concern.php` | `office_id` fillable + `office()` relation |
| `backend/app/Concerns/Controllers/ConcernController.php` | Office list scoped to `office_id = user's office` OR `reported_by = user`; store records the reporter's `office_id`; show access check uses office/own report; eager loads office |
| `backend/app/Concerns/Resources/ConcernResource.php` | Exposes `office` (`id`, `name`) |
| `backend/database/seeders/Concerns/ConcernSeeder.php` | Sets `office_id` from each reporter's office |
| `backend/tests/Feature/Concerns/ConcernManagementTest.php` | Added a second office at the same location; tests now prove same-location cross-office concerns are excluded; store asserts `office_id` |
| `frontend/src/concerns/api.ts` | `ApiConcern` includes `office` |
| `frontend/src/office/concerns/index.tsx` | Subtitle now names the office, not the shared location |
| `AGENTS.md` | Concerns scoping note updated |

## Summary

Concerns now carry the reporting office (`office_id`). An office user sees only concerns reported by their office or by themselves — offices that share a floor/location no longer see each other's reports. Admin still sees everything; maintenance still sees its own reports.

**Verification**
- `php artisan migrate:fresh --seed` ✓
- API: educ sees 2 concerns (both "Office - Education"); business sees 2 (both "Institute of Business and Financial Services") — zero overlap despite sharing "Main Building — Ground Floor — Left Side"
- `php artisan test` → **87 passed** (403 assertions); concern suite 11 passed / 73 assertions
- `npm run build` ✓ · `npm run lint` clean
- Browser (educ): 2 cards, 0 mentions of "Office - Business", subtitle "Problems reported by Institute of Teacher Education", no horizontal overflow, no console errors

## Notes
- `office_id` is a snapshot of the reporter's office at submission time; a user who moves offices still sees their old reports via the `reported_by` fallback.
- Admin/maintenance reports store `office_id = null`, so they do not appear in office lists.
- The create migration was edited in place to keep one migration per table.
