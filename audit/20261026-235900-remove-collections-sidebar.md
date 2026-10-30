# Audit: Remove "Collections" from sidebar

**Date**: 2026-10-26 23:59
**Task**: Collections still showing on the sidebar — remove it.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/nav.tsx` | Removed the `Collections` entry from `adminNav`; removed unused `Truck` import |

## Summary
The sidebar no longer lists "Collections" (the board route was already removed; this removes the leftover nav entry).

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser: "Collections" no longer appears in the admin sidebar

## Notes
- The orphaned `src/admin/collections` and `src/admin/collection-detail` files remain; delete manually if a clean tree is wanted.
