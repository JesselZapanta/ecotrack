# Audit: Rooms & offices separation (Option 1)

**Date**: 2026-10-31 19:47
**Task**: Some "offices" are actually rooms/labs/facilities. Implement Option 1 — use `type` as the discriminator, add type filtering, keep user assignment to real offices, and rename the admin page.

## Files Changed

### Backend
| File | Changes |
|------|---------|
| `backend/database/migrations/0001_01_01_000001_create_offices_table.php` | `type` is now non-null with default `Office`; added a `type` index |
| `backend/app/Models/Office.php` | Added `TYPE_OFFICE`, `TYPE_LECTURE_ROOM`, `TYPE_LABORATORY`, `TYPE_FACILITY` constants and `TYPES` |
| `backend/app/Admin/Offices/Requests/StoreOfficeRequest.php` | `type` validated against `Office::TYPES` |
| `backend/app/Admin/Offices/Requests/UpdateOfficeRequest.php` | Same type validation |
| `backend/app/Admin/Offices/Controllers/OfficeController.php` | `GET /api/offices` accepts `type` and `status` filters |
| `backend/app/Admin/Locations/Resources/LocationResource.php` | `offices` only includes `type = Office` |
| `backend/app/Admin/Locations/Controllers/LocationController.php` | Eager load now selects `type` (fixes the office count) |
| `backend/tests/Feature/Offices/OfficeManagementTest.php` | New tests: type filter, invalid type |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/admin/offices/types.ts` | `OFFICE_TYPES`, `OfficeType`, `type` in `OfficesQuery` |
| `frontend/src/admin/offices/api.ts` | Sends `type` |
| `frontend/src/admin/offices/components/OfficesToolbar.tsx` | Type filter (All / Office / Lecture Room / Laboratory / Facility) |
| `frontend/src/admin/offices/components/OfficeFormDialog.tsx` | Type is a select, defaults to Office; updated copy |
| `frontend/src/admin/offices/index.tsx` | Page renamed **Rooms & Offices**, type state/filter, "Add room" |
| `frontend/src/admin/offices/components/OfficesTable.tsx` | "Room / office" column, room-oriented empty state |
| `frontend/src/admin/user/api.ts` | Office options fetch only `type=Office&status=Active` |
| `frontend/src/components/nav.tsx` | Admin nav label "Offices" → **"Rooms"** |
| `AGENTS.md` | Documented the rooms/offices model and filters |

## Summary

The `offices` table remains a single spaces table, but `type` is now the explicit discriminator:

| Type | Count |
|---|---|
| Office | 34 |
| Lecture Room | 32 |
| Laboratory | 19 |
| Facility | 22 |

- **User assignment** — the Users form/filter now only offer active `type = Office` rows (34). Lecture rooms, labs, restrooms and elevators can no longer be assigned as an office.
- **Admin page** — `/admin/offices` is now **Rooms & Offices**, shows all 107 spaces, and has a type filter; the form has a type select.
- **Locations** — the office count only includes `type = Office` (e.g. Main Building — Ground Floor — Left Side shows **15 offices** instead of 17 rooms).
- **Office users** — still 34, one per actual office.

## Verification
- `php artisan migrate:fresh --seed` ✓
- Counts: `offices=107`, `Office=34`, `Lecture Room=32`, `Laboratory=19`, `Facility=22`; `users=37`, `office_users=34`
- Browser: type filter Office → **34 spaces**, Lecture Room → **32 spaces**; type select offers all four values
- Users "Add user" office dropdown: 34 offices + "No office"; contains College Registrar, **does not** contain MB-105 or Rest Rooms
- Locations: Main Building — Ground Floor — Left Side shows **15 offices**
- Mobile 375px: 0 horizontal overflow, no console errors
- `php artisan test` → **112 passed** (563 assertions)
- `npm run build` ✓ · `npm run lint` clean

## Notes
- No data split/migration of rows; the 107 spaces stay in `offices`.
- `type` defaults to `Office` for new rows; the seeder already sets explicit types.
- Office users still see their **location**, not their individual room — that separate data-model change was not made.
