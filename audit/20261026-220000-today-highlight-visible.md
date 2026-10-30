# Audit: Make today's row highlight visible

**Date**: 2026-10-26 22:00
**Task**: The today-row highlight wasn't visible — strengthen it.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/components/SchedulesTable.tsx` | Desktop row highlight changed from faint `bg-brand-soft/40` to full `bg-brand-soft` + left brand border; mobile cards same; added a solid `Today` badge in the Date cell |

## Summary

The previous `bg-brand-soft/40` tint was too faint to read. The highlight now uses the full `bg-brand-soft` tint plus a left brand accent border, and a solid brand "Today" pill appears next to the date so it's unmistakable.

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser: 2 "Today" badges + 2 highlighted rows rendered (admin desktop)

## Notes
- If the full tint is now too heavy, it can be dialed back to `/60` or `/70`.
