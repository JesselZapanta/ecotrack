# Audit: Admin schedules page performance

**Date**: 2026-11-02 21:53
**Task**: Investigate why `/admin/schedules` loads too long and improve it.

## Files Changed

### Backend
| File | Changes |
|------|---------|
| `backend/app/Admin/Schedules/Controllers/ScheduleController.php` | New `options()` returning categories, locations and assignees in one response |
| `backend/routes/api/schedules.php` | `GET /api/schedules/options` registered before the `{schedule}` route |
| `backend/tests/Feature/Schedules/ScheduleManagementTest.php` | Two tests for admin and office option scoping |
| `backend/config/cors.php` | `max_age` raised from `0` to `86400` so browsers cache CORS preflights |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/admin/schedules/api.ts` | Combined cached options, in-flight dedupe for list/range requests, 15 s sweep dedupe, skip badge refresh when nothing was swept |
| `frontend/src/admin/schedules/index.tsx` | List fetch no longer waits for the sweep; options and sweep are deferred and run in the background; office users no longer call the sweep |
| `frontend/src/admin/schedules/types.ts` | `ScheduleOptions` type |
| `frontend/src/lib/store.tsx` | Cached resolved user (`ecotrack_user` + 60 s timestamp), JWT expiry check, deduped `/auth/me`, instant logout with explicit token |
| `frontend/src/lib/nav-badges.ts` | Initial/route badge fetch deferred by 350 ms so page data wins the request queue |
| `frontend/vite.config.ts` | `/api` dev and preview proxy to `http://127.0.0.1:8000` |
| `frontend/.env` + `.env.example` | `VITE_API_URL=/api` |
| `AGENTS.md` | Environment, token handling and schedules notes updated |

## Root Causes

1. **The list waited for the sweep.** `ready` was only set after `POST /schedules/sweep` finished, so the list request started after it.
2. **Too many initial requests.** Categories, locations and maintenance users were fetched separately; with React StrictMode every effect ran twice, producing 10–12 requests.
3. **CORS preflight tax.** Every cross-origin API call sent an `OPTIONS` preflight (measured at **472 ms** each) before the real request. With a single-threaded dev server these queue up.
4. **Session splash.** `/auth/me` blocked rendering until it resolved (~0.8 s) on every full reload.
5. **Sweep refresh churn.** A sweep with `swept = 0` still forced a nav-badge refetch.

## Improvements

- **List first:** removed the `ready` gate; the list is requested immediately. The sweep starts 700 ms later in the background and only refreshes if it actually swept something.
- **One options request:** `GET /api/schedules/options` replaces three requests and is cached for 60 s with in-flight dedupe. The office branch is scoped to its own location.
- **Request dedupe:** identical in-flight schedule list/range requests share one promise, so StrictMode no longer doubles them.
- **No preflight in dev:** Vite now proxies `/api` to Laravel; requests are same-origin. `cors.max_age = 86400` also covers direct cross-origin deployments.
- **Instant session restore:** the resolved user is cached for 60 s; a reload renders immediately and `/auth/me` is skipped when fresh (background revalidation after 60 s). Expired JWTs are rejected client-side before rendering.
- **Deferred non-critical work:** badges start after 350 ms; options after 300 ms; sweep after 700 ms. The table request is first in the queue.
- **Sweep TTL:** 15 s client-side dedupe prevents repeated sweeps across quick page visits; office users skip the sweep entirely.
- **Targeted badge refresh:** sweep only refreshes badges when `swept > 0`.

## Verification

- **Cold load `/admin/schedules`: 13.3 s → 1.2–1.6 s** (header ~1.0 s, list request ~0.4–0.6 s)
- **Warm navigation: ~730 ms** with only the list request (options cached, sweep skipped, badges within TTL)
- Cold request set: list, options, nav-badges, sweep — **4 requests, no duplicates**
- Category/location filters populate from the combined endpoint; selecting Biodegradable filtered to 6 rows
- Office schedules: no options request and no sweep; maintenance schedules: no options request
- Auth cache: fresh reload **0** `/auth/me` requests; stale cache **1** background request; logout clears token, user and timestamp instantly
- 375 px admin schedules: no horizontal overflow, no console errors
- `php artisan test` → **124 passed** (611 assertions)
- `npm run build` ✓ · `npm run lint` clean

## Notes
- Dev-only preflight removal relies on `VITE_API_URL=/api` + the Vite proxy. Production builds should either be served behind a `/api` proxy or set `VITE_API_URL` to the API origin at build time.
- Options are cached for 60 s; category/location/user edits may take up to a minute to appear in the schedule filters.
- The Vite dev server was restarted to pick up the proxy and `.env` changes.
