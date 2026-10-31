# Audit: One user per office (seeder)

**Date**: 2026-10-30 20:17
**Task**: Update the seeder to add a user for every office.

## Files Changed
| File | Changes |
|------|---------|
| `backend/database/seeders/Users/UserSeeder.php` | Added `seedOfficeUsers()` — creates one office user for every administrative office (`type = Office`) that does not already have one; imports `Str` for slugged usernames/emails |
| `AGENTS.md` | Seed-account note documents the generated office accounts |

## Summary

Every administrative office now has an office-role user:

- **34 administrative offices** (`type = Office`) → **34 office users**
- The two existing named accounts are kept:
  - `educ@tcgc.edu.ph` → Institute of Teacher Education
  - `business@tcgc.edu.ph` → Institute of Business and Financial Services
- The remaining **32** are generated with:
  - **Name** — the office name
  - **Username / email** — `<office-slug>` / `<office-slug>@tcgc.edu.ph` (e.g. `college-registrar@tcgc.edu.ph`, `pfom-office@tcgc.edu.ph`)
  - **Password** — `password`
  - **Role** — `office`, active
- The seeder is idempotent: offices that already have an office-role user are skipped, and a numeric suffix is used if a slug collides.

**Verification**
- `php artisan migrate:fresh --seed` ✓
- `users_total=37`, `office_users=34`, `admin=1`, `maintenance=2`
- `offices_without_office_user=0`
- Samples: `pfom-office@tcgc.edu.ph` → PFOM Office (Main Building — Ground Floor — Right Side); `college-registrar@tcgc.edu.ph` → College Registrar (Main Building — Ground Floor — Left Side)
- Browser: logged in as `college-registrar@tcgc.edu.ph` → `/office/dashboard`; account page shows "College Registrar" and the office
- `php artisan test` → **110 passed** (554 assertions)
- No schema or frontend changes

## Notes
- Lecture rooms (32), laboratories (19) and facilities (22) are **not** given user accounts — only offices. To include every room, remove the `where('type', 'Office')` filter in `seedOfficeUsers()`.
- Generated accounts all use `password`, matching the other seed accounts.
- Running `db:seed` again will not duplicate office users.
