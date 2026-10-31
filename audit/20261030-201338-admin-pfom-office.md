# Audit: Admin also assigned to PFOM Office

**Date**: 2026-10-30 20:13
**Task**: Assign the admin account to the PFOM Office as well.

## Files Changed
| File | Changes |
|------|---------|
| `backend/database/seeders/Users/UserSeeder.php` | Admin TCGC's office changed from `College President's Office` to **PFOM Office** |
| `AGENTS.md` | Seed-account note now says the admin and both maintenance accounts belong to PFOM Office |

## Summary

The admin now shares the **PFOM Office** assignment with the maintenance accounts:

| Account | Role | Office | Location |
|---|---|---|---|
| `admin@tcgc.edu.ph` | Administrator | PFOM Office | Main Building — Ground Floor — Right Side |
| `ben@tcgc.edu.ph` | Maintenance | PFOM Office | Main Building — Ground Floor — Right Side |
| `cora@tcgc.edu.ph` | Maintenance | PFOM Office | Main Building — Ground Floor — Right Side |

**Verification**
- `php artisan migrate:fresh --seed` ✓
- Database check: all three accounts resolve to `PFOM Office | Main Building — Ground Floor — Right Side`
- `pfom_rows=1`, `offices=107` (no duplicate)
- Browser (admin → `/admin/account`): Access card shows **PFOM Office** and **Main Building — Ground Floor — Right Side**
- `php artisan test` → **110 passed** (554 assertions)
- No frontend or schema changes

## Notes
- The admin's office is informational only; admin permissions are role-based and unchanged.
- Office scoping for office users still uses their own office/location; admin and maintenance are unaffected.
