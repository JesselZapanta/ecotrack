# Audit: Role-first folder structure

**Date**: 2026-10-26 09:39
**Task**: Simplify both apps to role folders — `admin`, `office`, `maintenance`, `auth` — with a folder per module per role (e.g. `admin/user/index.tsx`).

## Files Changed

### Backend

```
backend/app/
├── Admin/
│   ├── Users/
│   │   ├── Controllers/UserController.php
│   │   ├── Requests/{StoreUserRequest,UpdateUserRequest}.php
│   │   └── Resources/UserResource.php
│   └── Offices/Controllers/OfficeController.php
├── Auth/
│   ├── Controllers/AuthController.php
│   ├── Requests/LoginRequest.php
│   └── Middleware/EnsureRole.php
├── Office/          # placeholder for office-scoped endpoints
└── Maintenance/     # placeholder for maintenance-scoped endpoints
```

- Namespaces updated to `App\Admin\...` and `App\Auth\...`; `role` middleware alias now points at `App\Auth\Middleware\EnsureRole`.
- Routes split by role: `routes/api.php` requires `api/{auth,admin,office,maintenance}.php`.
- `routes/api/admin.php` holds user + office endpoints; office/maintenance files are ready for their modules.
- `app/Modules` and `app/Shared` removed.
- Tests and seeders stay grouped under `tests/Feature/{Auth,Users}` and `database/seeders/{Users,Offices}`.

### Frontend

```
src/
├── admin/
│   ├── layout.tsx
│   ├── dashboard/index.tsx
│   ├── user/{index.tsx,api.ts,types.ts,components/}
│   ├── records/index.tsx
│   ├── schedules/index.tsx
│   ├── collections/index.tsx
│   ├── collection-detail/index.tsx
│   ├── concerns/index.tsx
│   ├── reports/index.tsx
│   ├── locations/index.tsx
│   ├── offices/index.tsx
│   ├── categories/index.tsx
│   └── audit/index.tsx
├── office/
│   ├── layout.tsx
│   ├── dashboard/index.tsx
│   ├── records/index.tsx
│   ├── schedules/index.tsx
│   ├── reports/index.tsx
│   └── concern/index.tsx
├── maintenance/
│   ├── layout.tsx
│   ├── dashboard/index.tsx
│   ├── route/index.tsx
│   ├── schedules/index.tsx
│   └── concern/index.tsx
├── auth/
│   ├── login/index.tsx
│   ├── account/index.tsx
│   ├── concern/index.tsx
│   └── require-auth.tsx
├── components/      # ui, brand, ecotrack, nav, RoleLayout, RoleModule
└── lib/             # api, store, mockData
```

- Role-aware modules (dashboard, records, schedules, reports, concern) have a canonical implementation in `admin/` and thin re-exports in `office/` / `maintenance/`.
- `RoleModule` picks the role entry component for shared routes (`/records`, `/schedules`, `/reports`).
- `RoleLayout` picks `admin/layout.tsx`, `maintenance/layout.tsx` or `office/layout.tsx`.
- `src/features` and `src/layouts` removed; `src/pages` already gone.
- Users module keeps its own `api.ts`, `types.ts` and components inside `admin/user/`.

## Summary

Reorganized both apps into role-first folders (`admin`, `office`, `maintenance`, `auth`), keeping shared implementations under `admin/` with thin role re-exports, and verified routes, tests and builds after the move.

## Verification

- `php artisan route:list` → 9 routes resolve from `App\Admin\*` / `App\Auth\*`.
- `php artisan test` → **29 passed (105 assertions)**.
- `npm run build` → ✓ and `npm run lint` clean.
- No remaining `@/features`, `@/layouts`, `App\Modules`, or `App\Http\Controllers\Api` references.

## Notes

- `app/Office` and `app/Maintenance` are placeholders (`.gitkeep`) until those modules exist.
- Shared page implementations live under `admin/` and are re-exported by role folders to avoid duplication; replace a re-export with a real role-specific page when behavior diverges.
- Models/migrations remain Laravel-standard (`app/Models`, `database/migrations`).
- Seeders and tests stay grouped by domain rather than role because they serve multiple roles.
