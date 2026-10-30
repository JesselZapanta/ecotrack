# Audit: Waste records module — remove status (collected waste)

**Date**: 2026-10-26 23:55
**Task**: Fix the waste records: there were 5 records but only 2 collected. Waste records = collected waste, so status removed.

## Files Changed
### Backend
| File | Changes |
|------|---------|
| `backend/database/migrations/2026_10_27_000001_create_waste_records_table.php` | Removed `status` column |
| `backend/app/Models/WasteRecord.php` | Removed status constants + fillable |
| `backend/app/Admin/WasteRecords/Controllers/WasteRecordController.php` | Removed status filter + store default |
| `backend/app/Admin/WasteRecords/Requests/StoreWasteRecordRequest.php` | Removed status rule + Rule import |
| `backend/app/Admin/WasteRecords/Requests/UpdateWasteRecordRequest.php` | Removed status rule + Rule import |
| `backend/app/Admin/WasteRecords/Resources/WasteRecordResource.php` | Removed status from response |
| `backend/database/seeders/WasteRecords/WasteRecordSeeder.php` | Removed status from rows + create |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/admin/records/api.ts` | Removed `status` from `ApiWasteRecord` and `WasteRecordPayload`; added `apiMessage` |
| `frontend/src/admin/records/index.tsx` | Removed status filter, status column, status form field; server-driven (search/filter/sort/paginate, CRUD) |
| `frontend/src/admin/schedules/components/StatusUpdateDialog.tsx` | Removed `status: "Collected"` from waste record payload |

## Summary

Waste records now represent collected waste only — the confusing `status` column is gone. All seeded records are collected waste (5 records · 37.4 kg), and maintenance-created records on collection have no status (they're collected by definition).

**Verification**
- `php artisan test` → 75 passed (321 assertions)
- `npm run build` ✓ · `npm run lint` clean
- Browser: admin records page shows 5 records · 37.4 kg (no status column)

## Notes
- Admin records page converted from mock to server-driven.
- `SYSTEM.md` M4.5 (linked record → Collected) is now addressed: a record is created on collection with no status (collected by definition).
- Status column removal is a breaking change to the API response (clients reading `status` on waste records must update).
