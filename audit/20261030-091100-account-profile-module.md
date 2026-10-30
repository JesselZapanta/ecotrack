# Audit: Account/profile module (all roles)

**Date**: 2026-10-30 09:11
**Task**: Implement the account/profile module for admin, office and maintenance accounts.

## Files Changed

### Backend
| File | Changes |
|------|---------|
| `backend/app/Auth/Controllers/AccountController.php` | New — `update` (name/username/email) and `password` (current + new) |
| `backend/app/Auth/Requests/UpdateAccountRequest.php` | New — name/email required, unique username/email ignoring self |
| `backend/app/Auth/Requests/UpdatePasswordRequest.php` | New — current password required, new password min 8 + confirmed |
| `backend/routes/api/auth.php` | `PATCH /api/auth/account`, `PATCH /api/auth/account/password` (auth:api) |
| `backend/app/Observers/AuditObserver.php` | Logs `password_changed`; redacts `password`/`remember_token` from update meta; skips empty updates |
| `backend/tests/Feature/Auth/AccountTest.php` | New — 10 tests (all roles, validation, privilege escalation, password flow, audit) |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/lib/store.tsx` | `AuthUser.created_at`; context exposes `updateUser` |
| `frontend/src/auth/account/api.ts` | New — profile/password calls, field errors and messages |
| `frontend/src/auth/account/index.tsx` | Rewritten — server-driven identity card, profile form, read-only access card, change-password form, show/hide toggle, inline errors |
| `frontend/src/admin/audit/index.tsx` | `password_changed` badge + action filter |
| `AGENTS.md` | Documented the self-service account endpoints and audit redaction |

## Summary

All three roles now share a working **My account** page (`/admin/account`, `/office/account`, `/maintenance/account`):

- **Profile** — edit full name, username and email. The sidebar name updates immediately after saving (`updateUser` in the auth store).
- **Access** — read-only role, office + location, account status, last login, member since, session note.
- **Password** — current + new + confirm, min 8, show/hide, inline field errors. The current JWT stays valid after the change.
- Self-service cannot change `role`, `office_id`, `is_active` or `password` through the profile endpoint — only the validated fields are applied.

**Verification**
- Browser (admin): profile save → toast "Profile updated." + sidebar shows the new name; wrong current password → inline "Your current password is incorrect"; correct change → toast + fields cleared; re-login with the new password succeeds
- Browser (office): shows "Office", Institute of Teacher Education, correct profile values
- Browser (maintenance, 375px): shows "Unassigned / No location assigned", no horizontal overflow; admin mobile also overflow-free
- Audit log: `password changed` rows appear, no hash in meta; profile changes log `updated`
- `php artisan test` → **99 passed** (475 assertions)
- `npm run build` ✓ · `npm run lint` clean
- DB reset with `migrate:fresh --seed` afterwards (seed password restored)

## Notes
- Password changes do not revoke the current token; other devices stay signed in until their JWT expires. Mentioned in the UI.
- `AuditObserver` previously would have logged the bcrypt hash in `meta` on password updates — now `password_changed` is logged with no meta and sensitive fields are stripped.
- Username is optional; blank is stored as `null`.
- Office/maintenance roles cannot edit their office — only an admin can.
