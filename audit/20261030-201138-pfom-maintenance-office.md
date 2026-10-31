# Audit: Maintenance users assigned to PFOM Office

**Date**: 2026-10-30 20:11
**Task**: Update the seeder so maintenance belongs to the PFOM Office at Main Building right 1st floor.

## Files Changed
| File | Changes |
|------|---------|
| `backend/database/seeders/Offices/OfficeSeeder.php` | Renamed the `PFOM` room to **PFOM Office**; added a pre-seed rename so existing databases do not keep a duplicate `PFOM` row |
| `backend/database/seeders/Users/UserSeeder.php` | Both maintenance accounts (`ben@tcgc.edu.ph`, `cora@tcgc.edu.ph`) now point to **PFOM Office** |
| `AGENTS.md` | Seed-account note records the maintenance office and location |

## Summary

The maintenance accounts are now part of the **PFOM Office**, which sits at **Main Building — Ground Floor — Right Side** (the 1st floor in the seeder's naming).

- Office master list still has **107** offices — `PFOM` was renamed, not duplicated.
- `UserSeeder` resolves the office by name, so Ben and Cora receive the correct `office_id`.
- The rename step (`Office::where('name', 'PFOM')->update(['name' => 'PFOM Office'])`) makes the seeder safe to run on an existing database.

**Verification**
- `php artisan migrate:fresh --seed` ✓
- Database: `ben=PFOM Office | Main Building — Ground Floor — Right Side`, `cora=PFOM Office | Main Building — Ground Floor — Right Side`; `pfom_rows=1`, `offices=107`
- Browser (Ben → `/maintenance/account`): Access card shows **PFOM Office** and **Main Building — Ground Floor — Right Side**
- `php artisan test` → **110 passed** (554 assertions)
- No frontend changes; no schema changes

## Notes
- The seeder uses "Ground Floor"; this is the 1st floor for the campus room list.
- If the office is later renamed again, the pre-seed rename line should be updated or removed.
