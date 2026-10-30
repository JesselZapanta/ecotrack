# Audit: Confirmation dialog before activating/deactivating

**Date**: 2026-10-29 02:00
**Task**: Always show a confirmation dialog before toggling active/inactive.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/admin/categories/index.tsx` | Power toggle now sets `toggleTarget` and opens `ConfirmDialog`; confirm calls the status API |
| `frontend/src/admin/locations/index.tsx` | Same confirmation flow |
| `frontend/src/admin/offices/index.tsx` | Same confirmation flow (Active/Inactive wording) |

## Summary

Toggling a category, location, or office now opens a confirmation dialog first:
- Title: "Deactivate {name}?" / "Activate {name}?"
- Description explains the record is kept and only hidden from new selections
- Confirm button is destructive for deactivation, default for activation
- Cancel/Escape closes without changing anything

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser: all three pages show the confirmation dialog on toggle
- `php artisan test` → 76 passed (330 assertions)

## Notes
- Users already had a confirmation flow for their status toggle.
