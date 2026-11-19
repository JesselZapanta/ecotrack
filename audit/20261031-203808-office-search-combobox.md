# Audit: Searchable office combobox in the user form

**Date**: 2026-10-31 20:38
**Task**: Add search for the office field in the `/admin/users` user form modal.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/ui/popover.tsx` | New — Radix Popover wrapper (`Popover`, `PopoverTrigger`, `PopoverContent`) using the existing `radix-ui` dependency |
| `frontend/src/admin/user/components/OfficeCombobox.tsx` | New — searchable office picker with a filter input, "No office" option and a check on the selected office |
| `frontend/src/admin/user/components/UserFormDialog.tsx` | Office `Select` replaced with `OfficeCombobox`; includes the editing user's office even if it is inactive |

## Summary

The user form's office field is now a **searchable combobox**:

- Click the office field → popover opens with a search input and the office list
- Typing filters by office name (case-insensitive)
- Selecting an office updates the trigger and closes the popover
- "No office" is always available; the selected office has a check mark
- When editing a user whose office is inactive (and therefore not in the active options), the form appends that office so it still displays correctly
- Mobile-first: 44px trigger/options on small screens, 40px from `sm:`; the popover is width-matched, min 260px and capped to the viewport

**Verification**
- Add user: popover shows **35 options** (No office + 34 active offices)
- Typing `reg` filters to **College Registrar**; selecting it updates the trigger to "College Registrar"
- Edit user: the combobox shows the current office (**VP for Planning Office**) and opens 35 options
- Mobile 375px: popover `x=41, width=293` (right edge 334), **0** horizontal overflow
- No console errors
- `npm run build` ✓ · `npm run lint` clean
- No backend changes; backend suite remains **112 passed** (563 assertions)

## Notes
- Uses the existing `radix-ui` Popover export — no new npm dependency.
- Search is client-side over the active office list (34 rows), so it is instant.
- The user form still sends the same `office_id` payload; no API change.
