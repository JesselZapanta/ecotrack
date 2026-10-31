# Audit: Maintenance reports (role-scoped)

**Date**: 2026-10-30 11:02
**Task**: Reports for the other roles — maintenance and office. Office reports already existed; add maintenance.

## Files Changed

### Backend
| File | Changes |
|------|---------|
| `backend/routes/api/reports.php` | Report routes now allow `role:admin,office,maintenance` |
| `backend/app/Admin/Reports/Requests/ReportFilterRequest.php` | Authorizes any authenticated role (middleware enforces the allowed roles) |
| `backend/app/Admin/Reports/Controllers/ReportController.php` | Maintenance scope: waste records `created_by = self`, schedules `assigned_to = self`; adds a `scope` description to the report |
| `backend/resources/views/reports/waste-summary.blade.php` | PDF shows the report scope line |
| `backend/database/seeders/WasteRecords/WasteRecordSeeder.php` | Waste records are attributed to the collected schedule's assignee (falls back to admin), so maintenance reports have data |
| `backend/tests/Feature/Reports/ReportTest.php` | Maintenance scoping, maintenance options and unauthenticated tests |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/components/nav.tsx` | Maintenance nav gains "Reports" (`/maintenance/reports`) |
| `frontend/src/App.tsx` | Added the maintenance reports route |
| `frontend/src/maintenance/reports/index.tsx` | Re-exports the shared reports page |
| `frontend/src/admin/reports/api.ts` | `Report` type includes `scope` |
| `frontend/src/admin/reports/index.tsx` | Role-aware subtitle (maintenance: "Your assigned collections and waste logged.") and a scope line in the report meta |
| `AGENTS.md` | Reports module documented for all three roles |

## Summary

Reports now cover all three roles:

| Role | Scope |
|---|---|
| **Admin** | All waste records and schedules; all locations |
| **Office** | Only their office's location (already implemented); location field read-only |
| **Maintenance** | Only waste records they created and schedules assigned to them; location/category filters still available |

The PDF carries the same scope line, e.g. *"Scope: Assigned collections and waste logged by Mang Ben"*, alongside the generated-by/filters footer.

**Verification**
- Seeded Ben: 1 waste record, 5 schedules (1 collected); report shows **6.2 kg / 1 record / 5 collections**
- Browser (Ben): nav contains Reports; page subtitle is maintenance-specific; 2 filter selects; PDF downloads with the scope line; mobile 375px no overflow, no console errors
- Office (educ) and admin reports still render and scope correctly
- `php artisan test` → **109 passed** (547 assertions); reports suite 10 passed
- `npm run build` ✓ · `npm run lint` clean
- `migrate:fresh --seed` re-run to apply the seeder attribution

## Notes
- Maintenance report scoping uses `waste_records.created_by` and `collection_schedules.assigned_to`; no schema changes.
- The office reports page continues to work through the office-scoped endpoints; nothing changed for office beyond the earlier implementation.
- Seeded waste records now belong to the crew member who collected the schedule, which makes maintenance reports (and their dashboard) meaningful.
