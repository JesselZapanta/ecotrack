# Audit: Remove stale "In progress" legend from RouteStrip

**Date**: 2026-10-26 23:00
**Task**: RouteStrip legend still listed "In progress" after that status was removed.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/ecotrack/RouteStrip.tsx` | Removed the "In progress" entry from the legend array |

## Summary
The RouteStrip legend (shown on the maintenance "My route" page) still advertised "In progress" even though that status no longer exists. Removed it so the legend matches the current 4-status set.

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser: legend now shows `Collected · Scheduled · Missed`

## Notes
- The `nodeStyles` map already had the "In Progress" entry removed in an earlier pass; only the legend array still referenced it.
