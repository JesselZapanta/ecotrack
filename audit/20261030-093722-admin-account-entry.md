# Audit: Admin account entry points

**Date**: 2026-10-30 09:37
**Task**: Where is the profile on the admin side? — the page existed but had no link.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/nav.tsx` | Added "Account" (`/admin/account`) to `adminNav` |
| `frontend/src/admin/layout.tsx` | Sidebar user card is now a link to `/admin/account`; top-right avatar is a link to `/admin/account`; logout stays a separate button |

## Summary

`/admin/account` was already routed and rendered the shared account page, but the admin layout had no entry point (only office/maintenance had "Account" in their nav). Admins can now reach it via:

1. **Sidebar nav** — "Account" at the bottom of the admin rail
2. **Sidebar user card** — clicking the avatar/name opens the profile
3. **Header avatar** — clicking the top-right initials opens the profile

The breadcrumb now resolves to "Account" instead of falling back to "Overview".

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser (admin, 1280px): nav contains "Account"; header and sidebar links both navigate to `/admin/account`; breadcrumb reads "EcoTrack / Account"; page shows the profile, access and password sections
- Mobile (375px): the sheet contains "Account", no horizontal overflow, no console errors

## Notes
- No backend changes; the account endpoints and page were already implemented.
- The logout button remains separate so it does not nest a button inside the profile link.
- This change is uncommitted in the working tree.
