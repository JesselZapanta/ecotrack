# Audit: Schedules module (multi-category, server-driven)

**Date**: 2026-10-26 20:16
**Task**: Implement `/schedules` as a real module — Laravel API + React UI — supporting **all waste categories per schedule** instead of a single category.

## Files Changed

### Backend — database & models
| File | Changes |
|------|---------|
| `backend/database/migrations/2026_10_26_000004_create_schedules_tables.php` | New — `collection_schedules` (date, window, recurrence, assignee, status, notes, created_by), `schedule_location` pivot, `schedule_category` pivot, `status_histories` |
| `backend/app/Models/CollectionSchedule.php` | New — status constants, `assignee`/`creator`/`locations`/`categories`/`statusHistories` relations, `isOverdue()`, `displayStatus()` |
| `backend/app/Models/StatusHistory.php` | New — status change log entry (`old_status`, `new_status`, `changed_by`, `remark`) |
| `backend/app/Models/Location.php` | Added `schedules()` belongsToMany |
| `backend/app/Models/WasteCategory.php` | Added `schedules()` belongsToMany |
| `backend/app/Models/User.php` | Added `assignedSchedules()` hasMany |

### Backend — API
| File | Changes |
|------|---------|
| `backend/app/Admin/Schedules/Controllers/ScheduleController.php` | New — `index` (search/filter/sort/paginate + role scoping), `show`, `store`, `update`, `status`, `destroy`; overdue SQL constraint; maintenance transition guard |
| `backend/app/Admin/Schedules/Requests/StoreScheduleRequest.php` | New — date/window/recurrence/assignee + `location_ids[]` + `category_ids[]` validation |
| `backend/app/Admin/Schedules/Requests/UpdateScheduleRequest.php` | New — partial rules |
| `backend/app/Admin/Schedules/Requests/UpdateScheduleStatusRequest.php` | New — status enum + `remark` required when `Missed` |
| `backend/app/Admin/Schedules/Resources/ScheduleResource.php` | New — `status`, `display_status`, `is_overdue`, nested `assignee`, `locations[]`, `categories[]`, `history[]` |
| `backend/app/Admin/Schedules/Resources/StatusHistoryResource.php` | New — history entry with `changed_by` |
| `backend/routes/api/schedules.php` | New — shared read + status routes (`auth:api`), admin CRUD (`role:admin`) |
| `backend/routes/api.php` | Requires the new `api/schedules.php` |

### Backend — seed & tests
| File | Changes |
|------|---------|
| `backend/database/seeders/Schedules/ScheduleSeeder.php` | New — 8 schedules (today/tomorrow/yesterday), multi-category routes (up to 3), overdue + missed examples, history rows |
| `backend/database/seeders/DatabaseSeeder.php` | Registers `ScheduleSeeder` |
| `backend/tests/Feature/Schedules/ScheduleManagementTest.php` | New — 16 tests: multi-category, filters, search, create/update/delete, role scoping, status transitions, missed remark, overdue |

### Frontend — schedules module
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/types.ts` | New — `ApiSchedule`, `SchedulePayload`, `SchedulesQuery`, status union |
| `frontend/src/admin/schedules/api.ts` | New — `getSchedules`, `getSchedulesForRange`, `getSchedule`, `createSchedule`, `updateSchedule`, `updateScheduleStatus`, `deleteSchedule`, option fetchers |
| `frontend/src/admin/schedules/components/SchedulesToolbar.tsx` | New — search, status, date, category + location filters (admin), clear |
| `frontend/src/admin/schedules/components/SchedulesTable.tsx` | New — desktop table + mobile cards, sort, pagination, status/edit/delete actions |
| `frontend/src/admin/schedules/components/ScheduleFormDialog.tsx` | New — **multi-select waste categories** and **multi-select locations**, date, window, recurrence, assignee, notes |
| `frontend/src/admin/schedules/components/StatusUpdateDialog.tsx` | New — status transitions; remark required for `Missed` |
| `frontend/src/admin/schedules/components/ScheduleCalendar.tsx` | New — month grid with per-day category dots + selected-day stop list |
| `frontend/src/admin/schedules/index.tsx` | Rewritten — server-driven list + calendar tabs, role-aware actions, dialogs |

### Frontend — maintenance route
| File | Changes |
|------|---------|
| `frontend/src/maintenance/route/index.tsx` | Rewritten — API-backed assigned route, RouteStrip, next stop, start/collect/missed actions, status dialog |

### Docs
| File | Changes |
|------|---------|
| `README.md` | New **Schedules API** section; test count 76; seed line |
| `AGENTS.md` | Schedules module bullet, seeder/test folders, routes line |

## Summary

Schedules are now a first-class, server-driven module. A single schedule carries **many locations and many waste categories** through `schedule_location` and `schedule_category` pivots — the old single-`categoryId` mock is gone.

The API returns `display_status` and `is_overdue` computed from `scheduled_date` + `window_end`, so `Overdue` is never stored and always accurate. Status changes are logged to `status_histories` with the actor and an optional remark (required for `Missed`).

Access is enforced server-side: admins see all schedules and manage CRUD; maintenance only sees/updates schedules assigned to them; office users only see schedules at their office's location, read-only. Maintenance transitions are restricted (`Scheduled → In Progress → Collected`, plus `Missed`/`Cancelled`).

Frontend mirrors the Users/Categories/Offices/Locations pattern: debounced search, server sort, pagination, loading bar, confirm dialog, toasts. The list collapses to cards on mobile; the calendar fetches the visible month and shows per-day category dots.

**Verification**
- `php artisan test` → **76 passed (330 assertions)** including 16 new schedule tests
- `npm run build` ✓ and `npm run lint` clean
- Live API smoke: 8 seeded schedules, multi-category rows (3 categories on one schedule), overdue computed correctly
- Browser E2E: created a schedule with 2 categories + 2 locations, then updated it to `Collected` via the status dialog
- Screenshots at 1440px (admin list, calendar, create dialog, office read-only) and 375px / 320px mobile — `scrollWidth === 320` at the smallest width (no horizontal scroll)

## Notes
- Pivot table names were shortened (`schedule_location`, `schedule_category`) after MySQL rejected the 64-char foreign key names from the original `collection_schedule_*` naming.
- `Overdue` is a computed display status; the stored `status` column stays within `Scheduled|In Progress|Collected|Missed|Rescheduled|Cancelled`.
- Category/location/assignee filter dropdowns are admin-only because `/categories`, `/locations` and `/users` are `role:admin` endpoints; office and maintenance still get search, status and date filters, and their data is already scoped server-side.
- `M4.5` (linked waste records flipping to Collected) is still not wired because no `waste_records` backend exists yet.
- The legacy mock-based `src/admin/collections` and `src/admin/collection-detail` pages were left untouched — they belong to the Collections module, not Schedules.
- Dev DB needed `php artisan migrate` + the schedule seeder; fresh clones get it from `migrate --seed`.
