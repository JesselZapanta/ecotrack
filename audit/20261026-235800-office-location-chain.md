# Audit: Office schedules — show office → location chain

**Date**: 2026-10-26 23:58
**Task**: Verify the office user's account → office → location chain and surface it on the schedules table/page.

## Files Changed
### Backend
| File | Changes |
|------|---------|
| `backend/app/Admin/Users/Resources/UserResource.php` | Office payload now includes nested `location` (id, name) |
| `backend/app/Auth/Controllers/AuthController.php` | `loadMissing('office.location')` in both `me()` paths |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/lib/store.tsx` | `AuthUser.office` type now includes `location: { id, name } | null` |
| `frontend/src/office/layout.tsx` | "Your office" card now shows "Location: {name}" |
| `frontend/src/admin/schedules/index.tsx` | Office subtitle now reads "N collections at {location} · {office}" |

## Summary

Verified the chain for the `educ` account: user → office "College of Education" → location "Library". Schedules are correctly scoped to that location (Library), which is what the table already displays. The office name and its location are now shown in both the sidebar card and the page subtitle so the scoping is transparent.

**Verification**
- `php artisan test` → 75 passed (321 assertions)
- `npm run build` ✓ · `npm run lint` clean
- Browser (educ): sidebar shows "College of Education · Location: Library"; subtitle "2 collections at Library · College of Education"; table shows Library rows

## Notes
- The `locations` table no longer has an `office_id` (offices now own the FK); the chain is user → office → location.
- Non-office roles are unaffected (office is null).
