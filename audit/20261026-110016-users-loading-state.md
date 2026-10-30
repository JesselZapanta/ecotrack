# Audit: Users table loading state

**Date**: 2026-10-26 11:00
**Task**: Add a loading state to the table on `/users`.

## Files Changed

| File | Changes |
|------|---------|
| `frontend/src/admin/user/index.tsx` | Sets `loading` on search, role/status/office filters, sort, page, per-page, clear, retry and refresh; passes `loading` to the toolbar; subtitle shows “Updating accounts…” while fetching |
| `frontend/src/admin/user/components/UsersToolbar.tsx` | Accepts `loading`; shows a `Loader2` spinner inside the search field |
| `frontend/src/admin/user/components/UsersTable.tsx` | `aria-busy`; thin animated loading bar above the table; skeleton rows on **every** fetch (not just initial); pagination buttons disabled while loading |
| `frontend/src/index.css` | Added `@keyframes loading-bar` and `.loading-bar` utility |

## Behavior

- **Initial load** — 5 skeleton rows, spinner in search, “Updating accounts…”, animated bar.
- **Search** — spinner starts immediately; skeleton appears after the 300 ms debounce when the request fires.
- **Role / status / office filter** — skeleton + bar immediately, reset to page 1.
- **Sort / pagination / page size** — same loading treatment; pagination arrows disable while fetching.
- **Retry after error** — triggers the same loading state.
- **Create / edit / activate / deactivate** — refresh path sets loading while the list reloads.
- `aria-busy` is set on the table card; the loading bar is `aria-hidden`.

## Summary

The Users table now shows an explicit loading state on every fetch — skeleton rows, a search spinner, a loading bar, disabled pagination and an “Updating accounts…” subtitle — so filter and page changes are visible while data loads.

## Verification

- `npm run build` → ✓
- `npm run lint` → clean
- Headless Chrome with a 5 s delay on `/api/users`: confirmed skeleton rows, search spinner, loading bar and “Updating accounts…” subtitle render before data arrives.

## Notes

- The table keeps its header visible during loading so the layout does not jump.
- Skeleton rows are used for every fetch; this is intentional so filter changes are obvious.
- No backend changes.
