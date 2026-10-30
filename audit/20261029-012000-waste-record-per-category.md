# Audit: Waste records per category (multi-category collection)

**Date**: 2026-10-29 01:20
**Task**: Categories column showed only 1 category even when multiple were picked — fix the maintenance collection flow so each category gets a waste record.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/components/StatusUpdateDialog.tsx` | Replaced the single "Estimated quantity (kg)" input with one KG input **per category**; on save, creates a waste record for every category with a quantity (was only `categories[0]`); toast lists saved categories |

## Summary

The schedules tables already rendered all categories correctly. The real gap was the waste records table: marking a multi-category schedule `Collected` only created a record for the first category. The dialog now shows a KG input per category and creates one waste record per category, so the records table reflects every category picked.

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser: multi-category schedule (3 categories) → dialog showed 3 KG inputs → saving created 3 waste records (2/4/6 kg for Biodegradable / Non-biodegradable / Recyclable)
- API confirmed 3 records linked to the same schedule
- `php artisan migrate:fresh --seed` restores clean data
- `php artisan test` → 76 passed (324 assertions)

## Notes
- KG is entered per category, so totals are accurate (no duplicate/equal-split guessing).
- Records are only created for categories where a quantity > 0 is entered.
