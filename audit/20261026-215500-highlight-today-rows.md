# Audit: Highlight today's scheduled rows

**Date**: 2026-10-26 21:55
**Task**: Highlight the row of today's scheduled items in the schedules table.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/components/SchedulesTable.tsx` | Added `today` (ISO date) computed in the component; desktop `TableRow` gets `bg-brand-soft/40` when `scheduled_date === today`; mobile cards get `bg-brand-soft/40 border-l-2 border-l-brand` for the same condition |

## Summary

Rows whose `scheduled_date` matches today's date are now visually highlighted with a soft brand-tinted background (and a left brand accent on mobile cards), so the crew can spot today's runs at a glance.

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser (admin, desktop 1440px): 2 rows highlighted for today's date
- Mobile 375px: 4 highlighted cards (list view), no horizontal scroll

## Notes
- Highlight is based on `scheduled_date` only (not status), so a today's run that's already `Collected`/`Missed`/`Cancelled` still gets the tint — keeps the "today" emphasis regardless of outcome. If you'd rather highlight only `Scheduled` today rows, say the word.
- The calendar view already emphasizes today via the `isToday` styling on the day cell.
