# Audit: Concern detail view + resolution note

**Date**: 2026-10-29 23:01
**Task**: Admin should view the problem details first, then Acknowledge, and add a solution/note when resolving.

## Files Changed

### Backend
| File | Changes |
|------|---------|
| `backend/database/migrations/2026_10_29_000002_create_concerns_table.php` | Added `resolution_note` (text, nullable) and `resolved_by` (FK users, nullOnDelete) |
| `backend/app/Models/Concern.php` | Fillable + `resolver()` relation |
| `backend/app/Concerns/Requests/UpdateConcernStatusRequest.php` | `resolution_note` required (5–1000 chars) when `status = Resolved` |
| `backend/app/Concerns/Controllers/ConcernController.php` | Stores note + resolver on resolve; clears them on acknowledge/reopen; eager loads `resolver` |
| `backend/app/Concerns/Resources/ConcernResource.php` | Exposes `resolution_note` and `resolved_by` (`id`, `name`) |
| `backend/database/seeders/Concerns/ConcernSeeder.php` | Resolved samples now have resolution notes and `resolved_by` |
| `backend/tests/Feature/Concerns/ConcernManagementTest.php` | Resolve tests assert the note/resolver; new tests: note required, reopen clears resolution |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/concerns/api.ts` | `ApiConcern` gains `resolution_note`/`resolved_by`; `updateConcernStatus` accepts a note |
| `frontend/src/concerns/useConcerns.ts` | `changeStatus(concern, status, note?)` returns success; toast "Concern resolved." |
| `frontend/src/concerns/components/ConcernDetailDialog.tsx` | New — problem details, photo, reporter/office, resolution box, Acknowledge / Resolve (inline note form) / Reopen, bottom-sheet on mobile |
| `frontend/src/concerns/components/ConcernCard.tsx` | Shows a 2-line resolution preview on resolved cards |
| `frontend/src/concerns/components/ConcernsList.tsx` | Cards now have a single "View details" action; opens the detail dialog and passes status actions |
| `AGENTS.md` | Documented the detail flow and resolution note rules |

## Summary

The admin no longer acts from the list. Each card opens a **problem details** dialog showing the full description, location, reporter/office, photo (with full-size link) and current status. From there the admin:

1. **Acknowledge** — Open → Acknowledged.
2. **Resolve** — opens an inline form with a required **resolution note** ("Explain what was done — the office will see this"), 5–1000 chars.
3. **Reopen** — Resolved → Open (clears the note, resolver and `resolved_at`).

Resolved cards and the dialog show the resolution note and who resolved it. Offices can open the same dialog read-only and see the resolution.

**Verification**
- API: resolving without a note → **422** `{"message":"Add a short note on how the concern was resolved."}`; with a note → 200 with `resolution_note` + `resolved_by`
- Browser flow: View details → Acknowledge → Resolve → empty note shows inline error → note submitted → status Resolved, "Resolution" block with note + "By Admin TCGC", toast "Concern resolved."
- Card preview: "RESOLUTION — Bin emptied and the broken lid replaced."
- Office (educ): resolved dialog shows the note, **0** action buttons
- Mobile 375px: dialog is a full-width bottom sheet (`x=0`, `width=375`, bottom-aligned), no horizontal overflow
- `php artisan test` → **89 passed** (418 assertions)
- `npm run build` ✓ · `npm run lint` clean

## Notes
- `resolution_note` is required only for `Resolved`; Acknowledge/Reopen ignore it.
- Reopening deliberately wipes the resolution so a stale fix is not shown.
- The list's quick actions were removed to enforce "view details first".
