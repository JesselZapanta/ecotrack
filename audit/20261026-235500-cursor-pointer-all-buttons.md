# Audit: Add cursor: pointer to all buttons

**Date**: 2026-10-26 23:55
**Task**: All buttons in the system should show a pointer cursor.

## Files Changed
| File | Changes |
|------|---------|
| `frontend/src/components/ui/button.tsx` | Added `cursor-pointer` to the `buttonVariants` base class (covers every `<Button>`) |
| `frontend/src/index.css` | Added global rule: `button, a, [role="button"], [role="tab"], [role="menuitem"], [role="menuitemcheckbox"], [role="option"], summary { cursor: pointer; }` (covers hand-rolled `<button>`s, links, and Radix role elements) |

## Summary

Every interactive control now shows a pointer cursor — both shadcn `<Button>` components (via the cva base) and hand-rolled `<button>`/`<a>`/role-based elements (via the global CSS rule).

**Verification**
- `npm run build` ✓ · `npm run lint` clean
- Browser: Create schedule, Update status, calendar nav, MultiSelectField trigger all report `cursor: pointer`

## Notes
- Tailwind's default `cursor` for `<button>` is `default` (arrow) in some setups; the global rule overrides it app-wide.
- No per-component changes needed.
