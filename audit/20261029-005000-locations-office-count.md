# Audit: Locations table shows office count instead of office list

**Date**: 2026-10-29 00:50
**Task**: On `/admin/locations`, don't list office names — show how many offices are in each location.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/admin/locations/components/LocationsTable.tsx` | "Offices" column now shows `location.offices.length` (right-aligned number) instead of office-name chips |

## Summary

The locations table no longer renders a chip list of office names. It shows a simple count per building, which is much more readable now that buildings can hold dozens of rooms (e.g. Main Building = 78).

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- API: Admin Building 0, Covered Court 0, Science Lab 0, Library 0, Canteen 0, Senior High School Building 6, Annex Building 23, Main Building 78 (107 total)

## Notes
- The API still returns `offices[]` (used for the count); no backend change needed.
- Buildings with 0 offices are the standalone ones (Canteen, Library, Science Lab, Covered Court, Admin Building).
