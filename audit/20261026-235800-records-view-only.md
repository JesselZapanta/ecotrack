# Audit: Admin waste records → view-only

**Date**: 2026-10-26 23:58
**Task**: `/admin/records` should be viewing and reporting only — no add/edit/delete.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/admin/records/index.tsx` | Removed "Add record" button (replaced with "View only" badge), removed Actions column, removed edit/delete buttons, removed create/edit/delete dialog + confirm dialog + handlers; kept search/filter/sort/paginate + total kg |

## Summary

The admin waste records page is now read-only: viewing and reporting (search, filter by category/location, sort, pagination, total kg) only. Create/edit/delete moved out (records are created by maintenance on collection, or by admin via API if needed later).

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser: "View only" badge shown, no Add/Edit/Delete controls; 5 records · 37.4 kg

## Notes
- Backend CRUD endpoints remain available for admin (PATCH/DELETE) if an admin edit flow is wanted later.
- Maintenance creates records via the status dialog (estimated KG).
