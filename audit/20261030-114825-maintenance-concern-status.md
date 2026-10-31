# Audit: Maintenance concerns match admin + status editing

**Date**: 2026-10-30 11:48
**Task**: Make the concerns module on admin and maintenance the same, and let maintenance edit concern status.

## Files Changed

### Backend
| File | Changes |
|------|---------|
| `backend/routes/api/concerns.php` | `PATCH /api/concerns/{id}/status` now allows `role:admin,maintenance` |
| `backend/app/Concerns/Requests/UpdateConcernStatusRequest.php` | Authorizes admin + maintenance |
| `backend/tests/Feature/Concerns/ConcernManagementTest.php` | New test: maintenance acknowledges/resolves with a note; office remains forbidden |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/maintenance/concerns/index.tsx` | Re-exports `@/admin/concerns` — identical page, same filters, detail dialog and Acknowledge/Resolve/Reopen actions |
| `AGENTS.md` | Concerns status rule and maintenance scope updated |

## Summary

- **Maintenance** now uses the exact same concerns page as admin (`/maintenance/concerns` re-exports the admin page): same search/status filters, same cards, same detail dialog, and the same **Acknowledge / Resolve (with required note) / Reopen** actions.
- **Backend** allows maintenance to call the status endpoint. Resolving still requires a 5–1000 character resolution note, and `resolved_by` records the maintenance user.
- **Office** stays read-only — no action buttons, and the status endpoint rejects office users.
- **Admin** is unchanged.

**Verification**
- Browser (Ben, maintenance): opened a concern → **Acknowledge** → status became Acknowledged → **Resolve** with note → status Resolved; toasts "Concern marked as acknowledged." and "Concern resolved."
- Browser (educ, office): detail dialog shows **0** action buttons
- `php artisan test` → **110 passed** (554 assertions); concerns suite 14 passed
- `npm run build` ✓ · `npm run lint` clean
- DB re-seeded after the manual status change

## Notes
- Maintenance sees all concerns and can change their statuses; only admin/maintenance can, office cannot.
- The maintenance page is the same component as admin, so it inherits the mobile layout already verified at 375px.
- Status changes are still written to the audit log by the observer, attributed to the acting maintenance user.
