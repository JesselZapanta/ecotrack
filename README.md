# EcoTrack TCGC — Waste Management and Monitoring System

Waste Management and Monitoring System for **Tangub City Global College (TCGC)**. Replaces manual recordkeeping with a single place to record waste, manage collection schedules, monitor status, and generate reports.

> **Working name** `EcoTrack TCGC` — see `SYSTEM.md` §1. Source spec is `SYSTEM.md` (functional) + `DESIGN.md` (visual system).

## Stack

| Layer | Choice |
|---|---|
| Backend | **Laravel 12** (PHP ^8.2), MySQL, Pest, `laravel-vite-plugin` + Tailwind v4 |
| Frontend | **React 19** + Vite 8 + TypeScript 6, Tailwind v4 (`@tailwindcss/vite`), shadcn/ui (`new-york` / `neutral`), `lucide-react`, `axios` |
| Auth | Session / Sanctum-ready (M1: hashed passwords, role checks server-side) |
| Spec | `SYSTEM.md` modules M1-M8, `DESIGN.md` tokens §12 |

Two-app repo — no root workspace. Apps are decoupled: Laravel JSON API + React SPA.

## Structure

```
EcoTrack/
├── SYSTEM.md / DESIGN.md / AGENTS.md
├── backend/                 # Laravel app
│   ├── app/ routes/ database/ resources/
│   ├── vite.config.js       # laravel-vite-plugin + tailwind
│   └── .env.example         # DB_DATABASE=backend, MySQL 127.0.0.1:3306
└── frontend/                # React SPA
    ├── src/components/ui/   # 19 shadcn components
    ├── src/lib/utils.ts
    ├── src/index.css        # EcoTrack tokens (DESIGN.md §12)
    └── vite.config.ts       # @ alias + tailwind
```

## Roles

- **Administrator** — full control (records, schedules, reports, users, audit log)
- **Maintenance** — assigned collections, update status `Scheduled → In Progress → Collected/Missed` (mobile-first, 56px targets)
- **Office** — view-only for own locations

Permission matrix and lifecycles in `SYSTEM.md` §2 / §5. Items marked `(proposed)` in SYSTEM.md require adviser sign-off.

## Design System

`DESIGN.md` — *Bin Lid + Route Sheet* concept. One memorable element: **Day Gauge** (bin silhouette fill). Tokens as CSS variables:

```
--bay #1C4E6E / --bay-deep #133A54 / --bay-wash #DCE8F0
--ink #17201D / --steel #53605A / --concrete #E5E8E4 / --slab #F6F7F4
--lid-green #2E7D4F / --lid-yellow #E3A908 / --lid-black #2A2D2B / --lid-orange #D4531A
--alarm #A3221B / --ok #1F6B3F
```

Rules: lid colors = category only, no shadows/gradients, flat 1px lines, sentence case, tabular numerals, 360px-first.

## Quick Start

**Prereqs:** PHP 8.2+, Composer, Node 18+, MySQL.

**Backend:**
```powershell
cd backend
composer install
copy .env.example .env; php artisan key:generate
# set DB_DATABASE=backend in .env, ensure MySQL running
php artisan migrate
composer dev    # serve + queue:listen + vite (concurrently)
# or: composer test / php artisan test
```

**Frontend:**
```powershell
cd frontend
npm install
npm run dev     # http://localhost:5173
npm run build   # tsc -b && vite build
npm run lint
```

Frontend API base via `VITE_API_URL` (not hardcoded). Tests use `sqlite :memory:` per `backend/phpunit.xml`.

## Docs

- `SYSTEM.md` — overview, roles, modules M1-M8, workflow, data model, site map, NFRs, open questions
- `DESIGN.md` — palettes, typography (Archivo + Atkinson Hyperlegible), components (Day Gauge, lid-card, status-tag), layouts, tokens
- `AGENTS.md` — agent ramp-up (commands, env, gotchas, verification)

## Verification

```powershell
cd backend; composer test
cd frontend; npm run lint; npm run build
```

Check Maintenance view at 360px and 320px; verify focus ring `0 0 0 2px var(--slab), 0 0 0 5px var(--bay)` and `prefers-reduced-motion`.
