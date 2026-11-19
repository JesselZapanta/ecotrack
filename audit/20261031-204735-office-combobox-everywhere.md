# Audit: Searchable office combobox across the system

**Date**: 2026-10-31 20:47
**Task**: Apply the searchable office combobox to every office filter and office option select in the system.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/OfficeCombobox.tsx` | New shared component (moved from `admin/user/components/`); supports `emptyValue` / `emptyLabel` (All offices vs No office), search, check mark and a custom trigger class |
| `frontend/src/admin/user/components/OfficeCombobox.tsx` | Removed — replaced by the shared component |
| `frontend/src/admin/user/components/UserFormDialog.tsx` | Imports the shared combobox (No office / office selection) |
| `frontend/src/admin/user/components/UsersToolbar.tsx` | Office filter replaced with the combobox (`All offices`); filters stack on mobile (`grid-cols-1 sm:grid-cols-3`) |

## Summary

There were exactly two office controls in the app; both now use the same searchable combobox:

1. **Users toolbar office filter** — shows **All offices**, searches the 34 offices, selects one to filter the list
2. **User form office field** — shows **No office**, searches the 34 offices, selects the user's office

The shared component keeps the earlier mobile behaviour: 44px trigger/options on mobile and compact heights from `sm:`; the popover is width-matched and capped to the viewport.

**Verification**
- Toolbar office filter: 35 options (All offices + 34), typing `reg` filters to **College Registrar**, selecting it shows **1 account**; resetting shows **37 accounts**
- User form: typing `reg` filters to **College Registrar**
- Mobile 375px: popover `x=16, width=343` (right edge 359), **0** horizontal overflow
- No console errors
- `npm run build` ✓ · `npm run lint` clean
- No backend changes; backend suite remains **112 passed** (563 assertions)

## Notes
- The office list is the active `type = Office` set (34), so rooms/labs/facilities never appear.
- The component is generic (`OfficeChoice`), so any future office filter can reuse it.
