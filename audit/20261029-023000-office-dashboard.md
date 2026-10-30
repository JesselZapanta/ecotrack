# Audit: Office dashboard module (server-driven)

**Date**: 2026-10-29 02:30
**Task**: Implement `/office/dashboard`.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/office/dashboard/index.tsx` | Rewritten — was a re-export of the mock admin dashboard; now server-driven |

## Summary

The office dashboard now shows real, office-scoped data:
- **Stat tiles**: Scheduled, Collected, Missed, Waste logged (kg)
- **Waste by category**: bars summing waste records at the office's location
- **Schedules**: recent schedules at the office location with status tags and category dots
- **Recent waste records**: category, location, date, quantity
- Header shows the office name + its location; "View schedules" shortcut

Data comes from `GET /api/schedules` and `GET /api/waste-records`, both already scoped server-side to the office's location.

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser (educ): overview renders "Institute of Teacher Education · Main Building — Ground Floor — Left Side", 3 scheduled, schedules list populated, no console errors
- `php artisan test` → 76 passed (330 assertions)

## Notes
- Waste logged is 0.0 kg for the seeded office location because seeded waste records are at other locations — correct scoping, not a bug.
- The dashboard is read-only, matching the office role.
