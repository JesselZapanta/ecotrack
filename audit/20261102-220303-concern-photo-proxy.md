# Audit: Concern photos through the Vite proxy

**Date**: 2026-11-02 22:03
**Task**: Fix the concern image not showing on `/admin/concerns`.

## Files Changed

| File | Changes |
|------|---------|
| `frontend/vite.config.ts` | Added a `/storage` proxy to `http://127.0.0.1:8000` for dev and preview |
| `frontend/src/concerns/api.ts` | Optional `VITE_STORAGE_URL` support in `mediaUrl`; defaults to the API origin |
| `frontend/.env.example` | Documented `VITE_STORAGE_URL` and the `/storage` proxy |
| `AGENTS.md` | Frontend environment note updated |

## Root Cause

The schedules performance fix changed `VITE_API_URL` to `/api` and proxied only `/api` through Vite. Concern photos are returned as relative `/storage/...` URLs (`ConcernResource`), so the browser requested them from `http://localhost:5173/storage/...`. Vite had no proxy for that path and returned the SPA HTML:

- `http://127.0.0.1:8000/storage/...` → **200 image/png, 4.1 MB**
- `http://localhost:5173/storage/...` → **200 text/html, 1.4 KB** (SPA fallback)

The `<img>` therefore failed silently.

## Fix

- Vite now proxies `/storage` to Laravel alongside `/api`, so relative photo URLs resolve correctly in dev and in `vite preview`.
- `mediaUrl` accepts an optional `VITE_STORAGE_URL` for deployments where uploaded files are served from a different origin; when unset it keeps using the API origin (or the same origin with the proxy).

## Verification

- `http://localhost:5173/storage/concerns/...png` → **200 image/png, 4,115,396 bytes**
- Admin concerns page: image `complete = true`, `naturalWidth = 1920` at 1280 px and 375 px
- **0** horizontal overflow, **0** page errors on both widths
- `php artisan test` → **124 passed** (611 assertions)
- `npm run build` ✓ · `npm run lint` clean

## Notes
- The Vite dev server was restarted to apply the `/storage` proxy; a hard refresh is needed if the browser still has the old SPA fallback cached.
- Production builds: either serve `/storage` from the same origin as the SPA or set `VITE_STORAGE_URL` to the file origin at build time.
