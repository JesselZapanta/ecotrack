# Audit: Locations are the floor/side groups from the room list

**Date**: 2026-10-29 01:00
**Task**: Correct the location seeder — the comments in the room list (e.g. "Annex Building — Ground Floor", "Main Building — Ground Floor — Left Side") are the locations.

## Files Changed
| File | Changes |
|------|---------|
| `backend/database/seeders/Locations/LocationSeeder.php` | Seeds the 9 floor/side groups instead of building-level locations |
| `backend/database/seeders/Offices/OfficeSeeder.php` | Rooms grouped by their comment location; each room linked to that location |
| `backend/database/seeders/Schedules/ScheduleSeeder.php` | Schedule locations remapped to the new group names |

## Locations seeded (9)
- Annex Building — Ground Floor (12 offices)
- Annex Building — Second Floor (11)
- Senior High School Building — Ground Floor (3)
- Senior High School Building — Second Floor (3)
- Main Building — Ground Floor — Left Side (17)
- Main Building — Ground Floor — Right Side (14)
- Main Building — Second Floor — Left Side (19)
- Main Building — Second Floor — Right Side (13)
- Main Building — Third Floor (15)

## Summary

Locations now match the comment groupings from the room list. Each room (office) belongs to its floor/side location, and schedules reference those locations. The em dash (`—`) is preserved in the DB (`\u2014`).

**Verification**
- `php artisan migrate:fresh --seed` ✓
- API: locations `total=9` with office counts 12/11/3/3/17/14/19/13/15 = 107 offices
- Offices `total=107`, each with floor/type/status and correct location
- Users: admin → College President's Office (Main Building — Second Floor — Right Side); educ/business → Institute of Teacher Education / Institute of Business and Financial Services (Main Building — Ground Floor — Left Side)
- `php artisan test` → 76 passed (324 assertions)
- `npm run build` ✓ · `npm run lint` clean

## Notes
- Standalone locations (Canteen, Library, Science Lab, Covered Court, Admin Building) were removed; schedules now use the group names.
- Duplicate room label `MB-208` exists in both Second Floor Left/Right; both are seeded under their own locations (unique is name+location).
