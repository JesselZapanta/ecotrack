# Audit: Admin-set passwords and update-password action

**Date**: 2026-10-31 21:56
**Task**: Remove the generated temporary password; the admin must enter the password and confirmation. Add a per-user action button with a dialog to update the password.

## Files Changed

### Backend
| File | Changes |
|------|---------|
| `backend/app/Admin/Users/Requests/StoreUserRequest.php` | `password` is required, min 8, `confirmed`; custom messages |
| `backend/app/Admin/Users/Requests/UpdateUserPasswordRequest.php` | New — required password, min 8, confirmed |
| `backend/app/Admin/Users/Controllers/UserController.php` | `store` uses the admin-provided password and no longer returns `temporary_password`; new `password` method |
| `backend/routes/api/admin.php` | Added `PATCH /api/users/{user}/password` (admin) |
| `backend/tests/Feature/Users/UserManagementTest.php` | Create test updated; new tests for update password, validation and non-admin block |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/admin/user/api.ts` | `createUser` returns the user only; new `updateUserPassword` |
| `frontend/src/admin/user/types.ts` | `CreateUserPayload`; form values include password/confirmation |
| `frontend/src/admin/user/components/UserFormDialog.tsx` | Password + confirmation fields when creating; validation; no temp-password toast |
| `frontend/src/admin/user/components/UserPasswordDialog.tsx` | New — update-password dialog with validation |
| `frontend/src/admin/user/components/UsersTable.tsx` | New key action button per row |
| `frontend/src/admin/user/index.tsx` | Password target state + dialog |
| `AGENTS.md` | Users module endpoints updated |

## Summary

- **Add user** — the admin now types the **password** and **confirm password**; the account is created with that password. No generated temporary password is returned or shown.
- **Update password** — each user row has a **key** action that opens a dialog with new password + confirmation. Validation: min 8 characters and matching confirmation.
- **Backend** — `PATCH /api/users/{id}/password` is admin-only and validates `password` (`min:8`, `confirmed`).

**Verification**
- `php artisan test` → **116 passed** (581 assertions)
- Browser: key action opens the dialog for College Registrar; empty/short → "Use at least 8 characters"; mismatch → "The passwords do not match"; valid update → toast "Password updated." and the dialog closes
- Re-login with the new password → `/office/dashboard` (password restored to `password` afterwards)
- Mobile 375px: dialog `x=16, width=343`, height 408.5, **0** overflow, no console errors
- `npm run build` ✓ · `npm run lint` clean

## Notes
- Updating a password does not revoke existing JWTs; the user uses the new password on their next sign-in.
- The create form still hides password fields when editing; the separate key action handles password changes.
