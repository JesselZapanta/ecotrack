# Audit: Missed schedules as a separate high-priority section

**Date**: 2026-10-26 23:58
**Task**: Add missed schedules on the maintenance dashboard with highest priority (separate section).

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/maintenance/route/index.tsx` | Added `missedRuns` state; fetch now pulls all assigned runs and splits today's (route list) from missed (any date); added a "Missed — needs attention" card above the route list listing missed runs with alarm styling + Update status; next-stop card border/label adapt to missed |

## Summary

Missed runs now appear in a dedicated alarm-styled card at the top of the dashboard ("Missed — needs attention"), including runs from past days, each with an Update status button. Today's scheduled runs remain in the route list below. The next-stop card prioritizes missed runs first.

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser (Ben): "MISSED — NEEDS ATTENTION · 1 run missed" card renders above the route list with the past-due Canteen run

## Notes
- The missed section is fed by all assigned runs (not just today), so past missed runs surface.
- Route list still filtered to today's Scheduled/Missed.
- The auto-sweep on mount converts newly past-due runs to Missed before render.
