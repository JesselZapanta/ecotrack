# AGENTS.md — EcoTrack TCGC

## Project

Two-app repo, no root workspace. Waste Management & Monitoring for Tangub City Global College.

- **Spec:** `SYSTEM.md` (functional, modules M1-M8, roles, data model) + `DESIGN.md` (visual system, tokens, layouts). Treat `(proposed)` items in SYSTEM.md as **unconfirmed** — do not build without adviser sign-off (see SYSTEM.md §11).
- **Working name** `EcoTrack TCGC` — replace globally when final name chosen.

## Structure

```
EcoTrack/
├── SYSTEM.md / DESIGN.md   # source of truth
├── backend/                # Laravel 12, PHP ^8.2 (separate app)
│   ├── routes/web.php      # only welcome route today; add routes/api.php for API
│   ├── resources/css/app.css + resources/js/app.js  # backend Vite entry (Blade)
│   ├── database/migrations|seeders|factories
│   └── vite.config.js      # laravel-vite-plugin + @tailwindcss/vite
└── frontend/               # React 19 + Vite 8 + TypeScript 6 (separate SPA)
    └── src/main.tsx → App.tsx  # placeholder Vite template — replace
```

No `opencode.json`, no CI, no root `package.json`. No Inertia — apps are decoupled (Laravel JSON API + React SPA via `axios`).

## Commands — run from the correct subfolder

**Backend (`cd backend`):**
```powershell
composer install
copy .env.example .env; php artisan key:generate
php artisan migrate              # DB_DATABASE=backend, MySQL defaults to root/""
composer setup                   # install + key + migrate + npm install + build
composer dev                     # concurrently: php artisan serve + queue:listen + vite (requires concurrently)
composer test                    # or: php artisan test / vendor/bin/pest
php artisan test --filter=Name
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

- **Backend `.env`:** `APP_URL=http://localhost`, `DB_CONNECTION=mysql`, `DB_HOST=127.0.0.1:3306`, `DB_DATABASE=backend`. `SESSION_DRIVER=database`, `QUEUE_CONNECTION=database`. `APP_KEY` must be generated. Windows path has spaces (`Jessel Zapanta`) — quote paths in shells.
- **Frontend env:** no `.env` yet. When adding API client, use `VITE_API_URL` (read via `import.meta.env`) — never hardcode `http://localhost:8000`.
- **PHP 8.2+, Node** required. Confirm MySQL running for backend dev; tests bypass it via sqlite memory.

## Architecture Gotchas

- **Two Vite instances:** `backend/vite.config.js` (Laravel plugin, input `resources/css/app.css` + `resources/js/app.js`) is unrelated to `frontend/vite.config.ts` (React plugin). Don't mix.
- **API not scaffolded:** `routes/api.php` does not exist yet. Create it for `apiResource` routes + `app/Http/Controllers` + `app/Http/Resources` + `app/Http/Requests` per bro-code Laravel conventions. Add `CORS` / Sanctum if auth is SPA.
- **Stock Laravel + Vite template:** both `backend/README.md` and `frontend/README.md` / `src/App.tsx` are untouched defaults. Replace placeholder hero/counter UI — keep `index.css`/`App.css` structure only if needed.
- **Tailwind 4:** backend already has `tailwindcss@4` + `@tailwindcss/vite`. Frontend has **no Tailwind yet** — add it when styling. Design tokens live in `DESIGN.md` §12, not in code.
- **Auth:** `SYSTEM.md` M1 requires hashed passwords + session expiry + server-side role checks. Manuscript says "only admin can log in" vs spec's 3-role login — blocking decision. Don't assume role enum; expected `admin | maintenance | office`.

## Design System — use verbatim

- **Tokens source:** `DESIGN.md` §12 `:root` — `--bay #1C4E6E`, `--ink`, `--concrete`, `--slab`, lid colors `--lid-green/yellow/black/orange`, `--alarm`, `--ok`. No pure black/white for large areas. Radii: data 2px, controls 8px, lid card `10px 10px 0 0`. Spacing 4/8/12/16/24/32/48.
- **Rules:** Lid colors = category only; never for status. Yellow fill-only. No shadows/gradients — 1px lines only. One primary action per lid card. Sentence case, active verbs (`Mark as collected` not `Submit`). Dates `Oct 25, 2026`, quantities `412 kg`, tabular-nums for numbers.
- **Mobile-first mandatory:** Design at 360px first, then widen. Touch targets 44px (maintenance 56px), bottom bar 64px for maintenance. Tables collapse to lid cards; `overflow-x-auto` wrapper if kept as table. Verify at 320px and 375px.

## Conventions

- **Stack rules (bro-code):** Laravel `routes/api.php` + `apiResource` + Resources + Form Requests; React functional + hooks; Tailwind utilities; `shadcn/ui` + `lucide-react` — add shadcn via `npx shadcn@latest add <component>`.
- **Data model:** see `SYSTEM.md` §6 diagram — `offices─<users|locations`, `locations─<waste_records>─waste_categories`, `schedule_locations` pivot, `status_history`, `concerns`, `audit_log`. `waste_records.status` lifecycle `Pending→Scheduled→Collected` and `collection_schedules` `Scheduled→In Progress→Collected` (`→Missed→Rescheduled`, `→Cancelled`) — linkage between record and schedule is currently indirect via location; clarify before implementing M4.5.
- **Out of scope:** manual entry only — no sensors/GPS/auto-measurement. Don't add.

## Verification Before Done

- `cd backend && composer test` (Pest) and `cd frontend && npm run lint` + `npm run build`.
- Check maintenance screens at 360px outdoors on mid-range Android expectation; check focus ring `0 0 0 2px var(--slab), 0 0 0 5px var(--bay)` and `prefers-reduced-motion` for Day Gauge.
- Do not push/PR/merge unless user explicitly says so.
