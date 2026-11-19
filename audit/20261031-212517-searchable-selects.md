# Audit: Searchable selects across the system

**Date**: 2026-10-31 21:25
**Task**: Apply the searchable option-select pattern to all option select inputs across the system.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/SearchSelect.tsx` | New shared searchable single-select (Radix Popover, filter input, optional colour dots, check mark) |
| `frontend/src/admin/audit/index.tsx` | Action filter uses `SearchSelect` |
| `frontend/src/admin/dashboard/index.tsx` | Period filter uses `SearchSelect` |
| `frontend/src/admin/offices/components/OfficesToolbar.tsx` | Location and type filters use `SearchSelect` |
| `frontend/src/admin/offices/components/OfficeFormDialog.tsx` | Type, status and location use `SearchSelect` |
| `frontend/src/admin/records/index.tsx` | Category and location filters use `SearchSelect` |
| `frontend/src/admin/reports/index.tsx` | Location and category filters use `SearchSelect` |
| `frontend/src/admin/schedules/components/SchedulesToolbar.tsx` | Status, category and location filters use `SearchSelect` |
| `frontend/src/admin/schedules/components/ScheduleFormDialog.tsx` | Recurrence and assignee use `SearchSelect` |
| `frontend/src/admin/user/components/UserFormDialog.tsx` | Role uses `SearchSelect` |
| `frontend/src/admin/user/components/UsersToolbar.tsx` | Role and status filters use `SearchSelect` |
| `frontend/src/auth/concern/index.tsx` | Location uses `SearchSelect` |
| `frontend/src/concerns/components/ConcernsList.tsx` | Status filter uses `SearchSelect` |

## Summary

Every **data/filter option select** now uses the same searchable combobox:

- Search-as-you-type filtering
- Check mark on the selected option
- Category options show their colour dot
- 44px touch targets on mobile, compact heights from `sm:`
- Width-matched popover, min 220px, capped to the viewport

The per-page controls (`10 / 25 / 50 per page`) remain compact `Select`s because they are pagination controls, not data option inputs. The dead `admin/collections` page (not routed) was left untouched.

**Verification**
- Users: role search `main` → Maintenance (2 accounts); role/status/office all searchable
- Records: category `bio` → Biodegradable; location `third` → Main Building — Third Floor
- Schedules: status `miss` → Missed (3 schedules); category/location filters work; form recurrence `week` → Weekly and assignee `ben` → Mang Ben
- Audit: action `pass` → Password changed
- Dashboard: period `week` → This week
- Offices: type `lab` → Laboratory (19 spaces); add-room form type/status/location work
- Reports: location and category searchable
- Concerns: status `res` → Resolved
- User form role `maint` → Maintenance
- Mobile 375px: popover `x=16, width=343` (right edge 359), **0** overflow, no console errors
- `npm run build` ✓ · `npm run lint` clean
- No backend changes; backend suite remains **112 passed** (563 assertions)

## Notes
- The component is generic (`SearchSelectOption`), so new selects can reuse it.
- `OfficeCombobox` remains for office lists (it has an "All offices"/"No office" empty option); `SearchSelect` is used everywhere else.
