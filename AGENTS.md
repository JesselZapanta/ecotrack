# AGENTS.md — EcoTrack TCGC

## Project

Two-app repo, no root workspace. Waste Management & Monitoring for Tangub City Global College.

- **Spec:** `SYSTEM.md` (functional, modules M1-M8, roles, data model) + `DESIGN.md` (visual system, tokens, layouts). Treat `(proposed)` items in SYSTEM.md as **unconfirmed** — do not build without adviser sign-off (see SYSTEM.md §11).
- **Working name** `EcoTrack TCGC` — replace globally when final name chosen.

## Structure

```
EcoTrack/
├── SYSTEM.md / DESIGN.md   # source of truth
├── backend/                # Laravel 12, PHP ^8.2 — role-first modules
│   ├── app/Admin/
│   │   ├── Users/{Controllers,Requests,Resources}
│   │   ├── Categories/{Controllers,Requests,Resources}
│   │   ├── Offices/{Controllers,Requests,Resources}
│   │   └── Locations/{Controllers,Requests,Resources}
│   ├── app/Auth/{Controllers,Requests,Middleware}
│   ├── app/Concerns/{Controllers,Requests,Resources}   # shared across roles
│   ├── app/Office/          # office-scoped modules (placeholder)
│   ├── app/Maintenance/     # maintenance-scoped modules (placeholder)
│   ├── routes/api.php       # requires api/{auth,admin,schedules,waste-records,audit,office,maintenance,concerns}.php
│   ├── config/jwt.php       # tymon/jwt-auth
│   ├── database/seeders/{Users,Offices,Categories,Locations,Schedules,WasteRecords,Concerns,Audit}
│   ├── tests/Feature/{Auth,Users,Categories,Offices,Locations,Schedules,Concerns}
│   └── vite.config.js       # laravel-vite-plugin + @tailwindcss/vite
└── frontend/                # React 19 + Vite 8 + TypeScript 6 SPA
    ├── src/admin/           # layout.tsx + dashboard, user, records, schedules,
    │                        # collections, collection-detail, concerns, reports,
    │                        # locations, offices, categories, audit
    ├── src/office/          # layout.tsx + dashboard, records, schedules, reports, concerns
    ├── src/maintenance/     # layout.tsx + dashboard, route, schedules, concern
    ├── src/auth/            # login, account, concern, require-auth.tsx
    ├── src/concerns/        # shared concerns api, hook and cards
    ├── src/components/      # ui, brand, ecotrack, nav, RoleLayout, RoleModule
    ├── src/lib/             # api, store, mockData
    └── src/App.tsx          # router composition
```

No `opencode.json`, no CI, no root `package.json`. No Inertia — apps are decoupled (Laravel JSON API + React SPA via `axios`).

## Commands — run from the correct subfolder

**Backend (`cd backend`):**
```powershell
composer install
copy .env.example .env; php artisan key:generate
php artisan jwt:secret           # sets JWT_SECRET
php artisan migrate --seed       # DB_DATABASE=ecotrackdb (MySQL, root/"")
php artisan serve                # http://127.0.0.1:8000
composer test                    # or: php artisan test
php artisan test --filter=AuthTest
npm run dev                      # backend Vite only (Blade assets)
npm run build
```

**Frontend (`cd frontend`):**
```powershell
npm install
npm run dev                      # Vite on 5173
npm run build                    # tsc -b && vite build
npm run lint                     # eslint . (typescript-eslint + react-hooks)
npm run preview
```

Tests use `phpunit.xml` override: `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`, `CACHE_STORE=array`, `QUEUE_CONNECTION=sync`. No Redis/services needed. No frontend test runner configured.

## Environment

- **Backend `.env`:** `APP_URL=http://localhost`, `FRONTEND_URL=http://localhost:5173` (CORS), `DB_CONNECTION=mysql`, `DB_HOST=127.0.0.1:3306`, `DB_DATABASE=ecotrackdb`, `DB_USERNAME=root`, `DB_PASSWORD=` (empty). `APP_KEY` + `JWT_SECRET` must be generated. `JWT_TTL=60` (minutes). Windows path has spaces (`Jessel Zapanta`) — quote paths in shells.
- **Frontend `.env`:** `VITE_API_URL=http://localhost:8000/api` (see `.env.example`). Read via `import.meta.env`; never hardcode hosts in components. `.env` is gitignored.
- **PHP 8.2+, Node** required. MySQL must run for backend dev; tests bypass it via sqlite `:memory:`.

## Architecture Gotchas

- **Two Vite instances:** `backend/vite.config.js` (Laravel plugin, input `resources/css/app.css` + `resources/js/app.js`) is unrelated to `frontend/vite.config.ts` (React plugin). Don't mix.
- **JWT auth (implemented):** `tymon/jwt-auth` 2.3, guard `api` (`driver: jwt`), `auth:api` on protected routes. `AuthController` exposes `POST /api/auth/login` (accepts `login` = email **or** username + `password`), `GET /api/auth/me`, `POST /api/auth/refresh`, `POST /api/auth/logout`. Login returns `access_token`, `expires_in`, `user` (UserResource), and `redirect`.
- **Account module (self-service, all roles):** `PATCH /api/auth/account` updates `name`, `username`, `email` only — `role`, `office_id`, `is_active` and `password` are ignored; unique rules ignore the current user. `PATCH /api/auth/account/password` requires `current_password` plus `password` (min 8, `confirmed`) and keeps the current JWT valid. Frontend `src/auth/account/` is shared by all three roles (`/admin|office|maintenance/account`) and calls `updateUser` on the auth store after a profile save. `AuditObserver` logs `password_changed` and redacts `password`/`remember_token` from `updated` meta.
- **Role redirects:** backend `User::homePath()` → `/admin/dashboard`, `/maintenance/dashboard`, `/office/dashboard`. Frontend mirrors this in `ROLE_HOME` (`src/lib/store.tsx`); `RoleRoute` blocks cross-role dashboard URLs.
- **Token handling:** frontend stores the JWT in `localStorage` (`ecotrack_token`), axios attaches `Authorization: Bearer`, a 401 dispatches `ecotrack:unauthorized` to clear the session, and `RequireAuth` redirects to `/login`. `PublicOnly` sends logged-in users away from `/login`.
- **Seed accounts** (`password` for all): `admin@tcgc.edu.ph` (admin), `ben@tcgc.edu.ph` + `cora@tcgc.edu.ph` (maintenance), `educ@tcgc.edu.ph` + `business@tcgc.edu.ph` (office). Usernames: `admin`, `ben`, `cora`, `educ`, `business`.
- **Roles:** `admin | maintenance | office` on `users.role`; `users` also has `username`, `office_id`, `is_active`, `last_login_at`. `offices` table backs office scoping.
- **Users module (server-driven):** `GET /api/users` accepts `search`, `role`, `status`, `office_id`, `sort`, `direction`, `per_page`, `page` and returns `data` + pagination `meta`. `POST /api/users` generates a one-time password; `PATCH /api/users/{id}` updates; `PATCH /api/users/{id}/status` toggles active. Guarded by `auth:api` + `role:admin` (`EnsureRole` middleware). `GET /api/offices` feeds selects. The Users page is the first fully server-driven screen (no mock data).
- **Categories module (server-driven, same pattern as Users):** `GET /api/categories` accepts `search` (name/description), `sort` (`name|created_at`), `direction`, `per_page`, `page` and returns `data` + pagination `meta`. `POST /api/categories` creates; `PATCH /api/categories/{id}` updates; `DELETE /api/categories/{id}` deletes. Guarded by `auth:api` + `role:admin`. Frontend lives in `src/admin/categories/` (`index.tsx`, `api.ts`, `types.ts`, `components/`) mirroring `src/admin/user/`.
- **Offices module (server-driven, same pattern):** `GET /api/offices` accepts `search` (name/contact), `sort`, `direction`, `per_page`, `page` and returns `data` + pagination `meta`. `POST / PATCH / DELETE /api/offices[/{id}]` for full CRUD. Guarded by `auth:api` + `role:admin`. The users select fetches `GET /api/offices?per_page=100`. Frontend lives in `src/admin/offices/` mirroring `src/admin/categories/`.
- **Locations module (server-driven, same pattern):** `GET /api/locations` accepts `search` (name/building/floor-or-area), `office_id`, `sort` (`id|name|created_at`), `direction`, `per_page`, `page` and returns `data` (`id`, `name`, `building`, `floor_or_area`, `office`, `created_at`) + pagination `meta`. `POST / PATCH / DELETE /api/locations[/{id}]` for full CRUD. Guarded by `auth:api` + `role:admin`. Frontend lives in `src/admin/locations/` with an office filter fed by `getOffices`.
- **Schedules module (server-driven, multi-category):** a schedule holds **many locations and many waste categories** (`schedule_location`, `schedule_category` pivots) — not one category per route. `GET /api/schedules` accepts `search` (location/building, assignee, notes), `status`, `date`/`date_from`/`date_to`, `location_id`/`category_id`/`assigned_to` (admin only), `sort` (`id|scheduled_date|created_at`/`status`), `direction`, `per_page`, `page`; returns `data` (`status`, `assignee`, `locations[]`, `categories[]`) + `meta`. Role scoping: admin = all, maintenance = `assigned_to = self`, office = schedules at their office's `location_id`. `POST/PATCH/DELETE /api/schedules[/{id}]` are admin; `PATCH /api/schedules/{id}/status` is admin + assigned maintenance (`remark` required for `Missed`) and writes `status_histories`. `POST /api/schedules/sweep` auto-marks past-due `Scheduled` runs as `Missed` (role-scoped). Stored statuses: `Scheduled`/`Collected`/`Missed`/`Cancelled`. Default list sort is status priority (Missed → Scheduled → Cancelled → Collected). Frontend: `src/admin/schedules/` (list + month calendar + multi-category/location picker + status dialog), reused by office and maintenance; `src/maintenance/route/` is the API-backed "My route".
- **Concerns module (server-driven, shared by roles):** `concerns` holds `location_id`, `office_id` (reporting office), `reported_by`, `description`, optional `photo_path` (public disk), `status` (`Open`/`Acknowledged`/`Resolved`), `resolution_note`, `resolved_at`, `resolved_by`. `GET /api/concerns` accepts `search` (description/location/reporter), `status`, `location_id` (admin), `sort`, `direction`, `per_page`, `page`; default order is status priority (Open → Acknowledged → Resolved) then newest. `GET /api/concerns/locations` returns the selectable locations (office = own office location only). `POST /api/concerns` accepts multipart `description`, optional `photo` (jpg/png/webp ≤5 MB); office `location_id`/`office_id` are forced server-side. `PATCH /api/concerns/{id}/status` is admin-only and **requires `resolution_note` (5–1000 chars) when resolving**; reopening clears the note, resolver and `resolved_at`. Role scoping: admin = all, office = concerns reported by their own office (`office_id`) or by the user, maintenance = concerns they reported. Frontend: shared `src/concerns/` (api + hook + card + detail dialog), admin list at `src/admin/concerns/`, office list at `src/office/concerns/`, shared report form in `src/auth/concern/`; nav "Concerns" for admin/office, "Report a concern" for maintenance. Admin flow is view details → Acknowledge → Resolve with a note; offices see the resolution read-only.
- **Tailwind 4:** both apps use Tailwind v4. Frontend tokens live in `src/index.css`; backend has its own Blade Vite entry.
- **CORS:** `config/cors.php` allows `FRONTEND_URL` + `http://127.0.0.1:5173`. Keep `FRONTEND_URL` in sync if Vite uses another port.

## Design System — current (Fieldwork)

- **Direction:** warm paper canvas, deep pine brand, flat bordered cards, dark sidebar, strong grotesk page titles. No glass, no gradients, no decorative shadows. `DESIGN.md` is historical (Harbor Glass v2); the implemented system is in `frontend/src/index.css`.
- **Tokens:** `--canvas #F5F4EF`, `--surface #FFFFFF`, `--ink #121814`, `--muted-ink #6E756D`, `--line #E3E1D8`, `--brand #0E4A36`, `--lime #C6F26B`, lid colors `--lid-green #2F7D4F` / `--lid-yellow #D9A400` / `--lid-black #3A3F3B` / `--lid-orange #C24E2A`.
- **Typography:** **Schibsted Grotesk** (page titles, hero numbers via `.display`), **Manrope** (UI), **JetBrains Mono** (numbers via `.num`), labels via `.label` (10px uppercase tracked).
- **Rules:** category colors appear only as small dots; no gradients or glass; primary buttons solid `--brand`; 8–12px radii; 1px `--line` borders; sentence case; 44px targets (56px maintenance).
- **Layouts:** `src/admin/layout.tsx` (dark 248px rail, top search), `src/maintenance/layout.tsx` (same dark 248px rail, breadcrumb bar, mobile sheet drawer; rail links grow to 44px on mobile for touch), `src/office/layout.tsx` (light 236px rail, office card, read-only badges). All three use a fixed sidebar on `md:` and a `Sheet` drawer below it — no bottom bar. `RoleLayout` selects by role; shared nav lives in `src/components/nav.tsx`.
- **Reusable primitives:** `PageHeader`, `StatTile`, `RouteStrip`, `StatusTag`, `CategoryChip`, `LidCard`, `EmptyState` in `src/components/ecotrack/`.
- **Logo:** assets in `frontend/public/brand/`; use `BrandMark` / `BrandLockup` / `BrandName` from `src/components/brand/Logo.tsx`.
- **Mobile-first mandatory:** Design at 360px first, then widen. Tables collapse to cards; verify at 320px and 375px.

## Conventions

- **Stack rules (bro-code):** Laravel `routes/api.php` + `apiResource` + Resources + Form Requests; React functional + hooks; Tailwind utilities; `shadcn/ui` + `lucide-react` — add shadcn via `npx shadcn@latest add <component>`.
- **Data model:** see `SYSTEM.md` §6 diagram — `offices─<users|locations`, `locations─<waste_records>─waste_categories`, `schedule_locations` pivot, `status_history`, `concerns`, `audit_log`. `waste_records.status` lifecycle `Pending→Scheduled→Collected`; `collection_schedules` statuses `Scheduled`/`Collected`/`Missed`/`Cancelled` (past-due `Scheduled` runs auto-sweep to `Missed` on page open). Linkage between record and schedule is currently indirect via location; clarify before implementing M4.5.
- **Out of scope:** manual entry only — no sensors/GPS/auto-measurement. Don't add.

## Verification Before Done

- `cd backend && composer test` (Pest) and `cd frontend && npm run lint` + `npm run build`.
- Check maintenance screens at 360px outdoors on mid-range Android expectation; check focus ring `0 0 0 2px var(--slab), 0 0 0 5px var(--bay)` and `prefers-reduced-motion` for Day Gauge.
- Do not push/PR/merge unless user explicitly says so.
