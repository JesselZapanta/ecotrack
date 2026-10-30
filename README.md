# EcoTrack TCGC — Waste Management and Monitoring System

Waste Management and Monitoring System for **Tangub City Global College (TCGC)**. Replaces manual recordkeeping with a single place to record waste, manage collection schedules, monitor status, and generate reports.

> **Working name** `EcoTrack TCGC` — see `SYSTEM.md` §1. Source spec is `SYSTEM.md` (functional) + `DESIGN.md` (visual system).

## Stack

| Layer | Choice |
|---|---|
| Backend | **Laravel 12** (PHP ^8.2), MySQL, Pest, `laravel-vite-plugin` + Tailwind v4 |
| Frontend | **React 19** + Vite 8 + TypeScript 6, Tailwind v4 (`@tailwindcss/vite`), shadcn/ui (`new-york` / `neutral`), `lucide-react`, `axios` |
| Auth | **JWT** via `tymon/jwt-auth` (guard `api`), hashed passwords, server-side role checks, token blacklist on logout |
| Spec | `SYSTEM.md` modules M1-M8, `DESIGN.md` tokens §12 |

Two-app repo — no root workspace. Apps are decoupled: Laravel JSON API + React SPA.

## Structure

```
EcoTrack/
├── SYSTEM.md / DESIGN.md / AGENTS.md
├── backend/                 # Laravel 12 + JWT API (role-first)
│   ├── app/Admin/
│   │   ├── Users/{Controllers,Requests,Resources}
│   │   └── Offices/Controllers
│   ├── app/Auth/{Controllers,Requests,Middleware}
│   ├── app/Office/          # office-scoped modules (placeholder)
│   ├── app/Maintenance/     # maintenance-scoped modules (placeholder)
│   ├── routes/api.php       # requires api/{auth,admin,office,maintenance}.php
│   ├── config/jwt.php       # tymon/jwt-auth
│   ├── database/seeders/{Users,Offices}
│   ├── tests/Feature/{Auth,Users}
│   └── .env.example         # DB_DATABASE=ecotrackdb, MySQL 127.0.0.1:3306
└── frontend/                # React SPA (role-first)
    ├── src/admin/           # layout + dashboard, user, records, schedules,
    │                        # collections, collection-detail, concerns, reports,
    │                        # locations, offices, categories, audit
    ├── src/office/          # layout + dashboard, records, schedules, reports, concern
    ├── src/maintenance/     # layout + dashboard, route, schedules, concern
    ├── src/auth/            # login, account, concern, require-auth
    ├── src/components/      # ui, brand, ecotrack, nav, RoleLayout, RoleModule
    ├── src/lib/             # api, store, mockData
    └── src/index.css        # Fieldwork tokens
```

## Roles

- **Administrator** — full control (records, schedules, reports, users, audit log)
- **Maintenance** — assigned collections, update status `Scheduled → In Progress → Collected/Missed` (mobile-first, 56px targets)
- **Office** — view-only for own locations

Permission matrix and lifecycles in `SYSTEM.md` §2 / §5. Items marked `(proposed)` in SYSTEM.md require adviser sign-off.

## Design System

**Fieldwork** — a precise, editorial operations interface. Warm paper canvas, deep pine brand, flat bordered cards, dark sidebar, serif page titles. No glass or gradients.

```
--canvas #F5F4EF / --surface #FFFFFF / --ink #121814 / --muted-ink #6E756D
--line #E3E1D8 / --brand #0E4A36 / --lime #C6F26B
--lid-green #2F7D4F / --lid-yellow #D9A400 / --lid-black #3A3F3B / --lid-orange #C24E2A
```

Type: **Schibsted Grotesk** (titles) · **Manrope** (UI) · **JetBrains Mono** (numbers).
Rules: category colors only as dots, solid brand actions, 8–12px radii, 1px lines, 248px dark sidebar, 360px-first.
Tokens live in `frontend/src/index.css`; `DESIGN.md` is the earlier Harbor Glass exploration.

## Auth (JWT)

`POST /api/auth/login` accepts `login` (email **or** username) + `password` and returns a bearer token, the user, and a role dashboard path.

| Role | Email | Username | Redirect |
|---|---|---|---|
| Administrator | `admin@tcgc.edu.ph` | `admin` | `/admin/dashboard` |
| Maintenance | `ben@tcgc.edu.ph` | `ben` | `/maintenance/dashboard` |
| Office | `educ@tcgc.edu.ph` | `educ` | `/office/dashboard` |

All seed accounts use password **`password`**. Tokens expire after 60 minutes; logout blacklists the token. `GET /api/auth/me` restores the session, `POST /api/auth/refresh` rotates it.

```http
POST /api/auth/login
{ "login": "admin@tcgc.edu.ph", "password": "password" }
```

## Users API (admin)

`GET /api/users` returns a server-side paginated list.

| Query | Values |
|---|---|
| `search` | matches name, email or username |
| `role` | `admin` · `maintenance` · `office` |
| `status` | `active` · `inactive` |
| `office_id` | office id |
| `sort` | `id` · `name` · `email` · `role` · `created_at` (default `id`) |
| `direction` | `asc` · `desc` |
| `per_page` | 1–100 (default 10) |
| `page` | page number |

Response: `data[]` + `meta` (`current_page`, `last_page`, `per_page`, `total`, `from`, `to`). `POST /api/users` creates an account and returns a one-time `temporary_password`; `PATCH /api/users/{id}` updates details; `PATCH /api/users/{id}/status` activates or deactivates. All require `auth:api` + `role:admin`. `GET /api/offices` supplies office options.

## Categories API (admin)

`GET /api/categories` returns a server-side paginated list.

| Query | Values |
|---|---|
| `search` | matches name or description |
| `sort` | `id` · `name` · `created_at` (default `id`) |
| `direction` | `asc` · `desc` |
| `per_page` | 1–100 (default 10) |
| `page` | page number |

Response: `data[]` (`id`, `name`, `color`/`color_code`, `description`, `created_at`) + `meta`. `POST /api/categories` creates a category; `PATCH /api/categories/{id}` updates it; `DELETE /api/categories/{id}` deletes it. All require `auth:api` + `role:admin`. Seeded with Biodegradable, Recyclable, Residual, Hazardous.

## Offices API (admin)

`GET /api/offices` returns a server-side paginated list.

| Query | Values |
|---|---|
| `search` | matches name or contact person |
| `sort` | `id` · `name` · `created_at` (default `id`) |
| `direction` | `asc` · `desc` |
| `per_page` | 1–100 (default 10) |
| `page` | page number |

Response: `data[]` (`id`, `name`, `contact_person`, `location_id`, `location`, `created_at`) + `meta`. `POST /api/offices` creates an office; `PATCH /api/offices/{id}` updates it; `DELETE /api/offices/{id}` deletes it (linked users are unlinked via `nullOnDelete`). All require `auth:api` + `role:admin`. Seeded with Administration, College of Education, College of Business, Student Affairs — each assigned to its location.

## Locations API (admin)

`GET /api/locations` returns a server-side paginated list.

| Query | Values |
|---|---|
| `search` | matches name, building or floor / area |
| `office_id` | office id |
| `sort` | `id` · `name` · `created_at` (default `id`) |
| `direction` | `asc` · `desc` (default `desc`) |
| `per_page` | 1–100 (default 10) |
| `page` | page number |

Response: `data[]` (`id`, `name`, `building`, `floor_or_area`, `offices[]`, `created_at`) + `meta`. `POST /api/locations` creates a location; `PATCH /api/locations/{id}` updates it; `DELETE /api/locations/{id}` deletes it. All require `auth:api` + `role:admin`. Seeded with Main Building, Canteen, Library, Science Lab, Covered Court, Admin Building.

## Schedules API (shared, role-scoped)

`GET /api/schedules` returns a server-side paginated list. Each schedule supports **many locations and many waste categories** (`schedule_location` and `schedule_category` pivot tables).

| Query | Values |
|---|---|
| `search` | matches location name/building, assignee name or notes |
| `status` | `Scheduled` · `Collected` · `Missed` · `Cancelled` |
| `overdue` | `true` · `false` |
| `date` / `date_from` / `date_to` | `Y-m-d` |
| `location_id` · `category_id` · `assigned_to` | admin only |
| `sort` | `id` · `scheduled_date` · `created_at` (default `scheduled_date`) |
| `direction` | `asc` · `desc` (default `desc`) |
| `per_page` | 1–100 (default 10) |

Response: `data[]` (`id`, `scheduled_date`, `window_start`, `window_end`, `recurrence_rule`, `status`, `display_status`, `is_overdue`, `notes`, `assigned_to`, `assignee`, `locations[]`, `categories[]`) + `meta`.

**Scoping:** admins see everything; maintenance sees only schedules assigned to them; office users see only schedules for their office's location. A schedule's `status` is one of `Scheduled`/`Collected`/`Missed`/`Cancelled`.

| Endpoint | Who | Purpose |
|---|---|---|
| `GET /api/schedules/{id}` | all roles (scoped) | detail + `history[]` |
| `POST /api/schedules` | admin | create (multi-location, multi-category) |
| `PATCH /api/schedules/{id}` | admin | update date/window/assignee/locations/categories |
| `PATCH /api/schedules/{id}/status` | admin, assigned maintenance | status change; `remark` required for `Missed`; writes `status_histories` |
| `DELETE /api/schedules/{id}` | admin | delete schedule + history |

Seeder: 8 schedules covering today/tomorrow/yesterday, one overdue, one missed, and multi-category routes (up to 3 categories).


## Quick Start

**Prereqs:** PHP 8.2+, Composer, Node 18+, MySQL (`ecotrackdb`).

**Backend:**
```powershell
cd backend
composer install
copy .env.example .env; php artisan key:generate
php artisan jwt:secret          # writes JWT_SECRET
php artisan migrate --seed      # offices + users + categories + locations + schedules
php artisan serve               # http://127.0.0.1:8000
php artisan test                # Pest (75 tests)
```

**Frontend:**
```powershell
cd frontend
npm install
copy .env.example .env          # VITE_API_URL=http://localhost:8000/api
npm run dev                     # http://localhost:5173
npm run build                   # tsc -b && vite build
npm run lint
```

CORS allows `FRONTEND_URL` (default `http://localhost:5173`). Tests use `sqlite :memory:` per `backend/phpunit.xml`.

## Docs

- `SYSTEM.md` — overview, roles, modules M1-M8, workflow, data model, site map, NFRs, open questions
- `DESIGN.md` — Harbor Glass palettes, Bricolage/Instrument/Inter/Geist Mono, components (Day Gauge, lid-card, status-tag, logo), layouts, tokens
- `AGENTS.md` — agent ramp-up (commands, env, JWT/auth gotchas, verification)

## Verification

```powershell
cd backend; composer test
cd frontend; npm run lint; npm run build
```

Check Maintenance view at 360px and 320px; verify focus ring `0 0 0 2px var(--slab), 0 0 0 5px var(--bay)` and `prefers-reduced-motion`.
