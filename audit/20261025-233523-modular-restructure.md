# Audit: Modular restructure (backend + frontend) and role layouts

**Date**: 2026-10-25 23:35
**Task**: Separate files into domain folders, create a dedicated Users folder, and give each user role its own layout.

## Files Changed

### Backend — modular by domain

```
app/Modules/
├── Auth/
│   ├── Controllers/AuthController.php
│   └── Requests/LoginRequest.php
├── Users/
│   ├── Controllers/UserController.php
│   ├── Requests/{StoreUserRequest,UpdateUserRequest}.php
│   └── Resources/UserResource.php
├── Offices/
│   └── Controllers/OfficeController.php
└── Shared/
    └── Middleware/EnsureRole.php
routes/
├── api.php                 # requires the files below
└── api/{auth,users,offices}.php
database/seeders/{Users,Offices}/
tests/Feature/{Auth,Users}/
```

| Change | Detail |
|---|---|
| Namespaces | `App\Http\Controllers\Api\*` → `App\Modules\{Auth,Users,Offices}\Controllers\*`; requests/resources/middleware moved likewise |
| Routes | Split into `routes/api/auth.php`, `users.php`, `offices.php`; `routes/api.php` just requires them |
| Middleware alias | `role` now points to `App\Modules\Shared\Middleware\EnsureRole` |
| Seeders | `UserSeeder` → `Database\Seeders\Users`; `OfficeSeeder` → `Database\Seeders\Offices`; `DatabaseSeeder` imports updated |
| Tests | `AuthTest` → `tests/Feature/Auth/`; `UserManagementTest` → `tests/Feature/Users/` |
| Kept in place | `App\Models\User` / `Office` (framework convention), migrations, `UserFactory` |

### Frontend — feature folders + role layouts

```
src/
├── layouts/
│   ├── AdminLayout.tsx          # dark 248px rail + command search
│   ├── MaintenanceLayout.tsx    # centered 760px, top nav, mobile bottom bar
│   ├── OfficeLayout.tsx         # light 236px rail, office card, read-only badges
│   ├── RoleLayout.tsx           # picks layout by role
│   └── nav.tsx                  # per-role nav definitions
├── features/
│   ├── auth/{LoginPage,RequireAuth}
│   ├── dashboard/DashboardPage
│   ├── records/RecordsPage
│   ├── schedules/SchedulesPage
│   ├── collections/{CollectionsPage,CollectionDetailPage}
│   ├── maintenance/MyRoutePage
│   ├── concerns/{ConcernsPage,ReportConcernPage}
│   ├── reports/ReportsPage
│   ├── admin/{LocationsPage,OfficesPage,CategoriesPage,AuditLogPage}
│   ├── account/AccountPage
│   └── users/
│       ├── UsersPage.tsx
│       ├── api.ts
│       ├── types.ts
│       └── components/{UsersToolbar,UsersTable,UserFormDialog}.tsx
├── components/  # shared ui, brand, ecotrack
└── lib/         # api, store, mockData
```

- `App.tsx` imports from `@/features/*`; `RoleLayout` replaces the old single `AppShell`.
- **AdminLayout** — dark rail, command palette (⌘K), 1280px content.
- **MaintenanceLayout** — no sidebar; 760px centered column, horizontal top nav, mobile bottom bar; suited to phone-first field work.
- **OfficeLayout** — light sidebar with office identity and “View only” badge, read-only top badge, 1200px content.
- The Users page is split into API, types, toolbar, table and form dialog — the first feature with a full folder.
- Deleted `src/components/layout/AppShell.tsx` and `src/pages/`; `src/components/auth/` moved to `features/auth/`.

## Summary

Split the HTTP layer and frontend into domain/feature folders, introduced role-specific layouts, and verified all routes, tests and pages still work after the restructure.

## Verification

- `php artisan route:list` → 9 routes resolve from the new module namespaces.
- `php artisan test` → **29 passed (105 assertions)**.
- `npm run build` → ✓ and `npm run lint` clean.
- Headless Chrome at 1440px / 390px: admin, maintenance (desktop + mobile), office and users pages render with their distinct layouts; logout/login flows still work.

## Notes

- Domain models and migrations stay in `app/Models` and `database/migrations` (Laravel convention); only the HTTP layer is modularized.
- `src/lib/store.tsx`, `api.ts` and `mockData.ts` remain shared infrastructure.
- Other features are single-file folders for now; split them the same way as Users when they grow.
- The temporary Playwright dependency/scripts used for screenshots were removed and dev servers stopped.
