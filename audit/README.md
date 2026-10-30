# Audit Log (newest first)

| # | Audit File | Date | Task |
|---|-----------|------|------|
| 1 | 20261030-091611-audit-check-and-push.md | 2026-10-30 09:16 | Audit check, debug cleanup and push to GitHub (dev + PR to main) |
| 2 | 20261030-091100-account-profile-module.md | 2026-10-30 09:11 | Account/profile module for all roles |
| 3 | 20261029-230100-concern-detail-resolution.md | 2026-10-29 23:01 | Concern detail view + required resolution note |
| 4 | 20261029-222800-concern-photo-404.md | 2026-10-29 22:28 | Fix concern photo 404 (relative storage URL) |
| 5 | 20261029-215800-office-concerns-scoping.md | 2026-10-29 21:58 | Office concerns scoped to the office (no cross-office sharing) |
| 6 | 20261029-214800-concerns-module.md | 2026-10-29 21:48 | Concerns module (report a concern - admin + office) |
| 7 | 20261029-023000-office-dashboard.md | 2026-10-29 02:30 | Office dashboard module (server-driven) |
| 8 | 20261029-021500-audit-log-module.md | 2026-10-29 02:15 | Audit log module (records every action) |
| 9 | 20261029-020000-toggle-confirmation.md | 2026-10-29 02:00 | Confirmation dialog before activating/deactivating |
| 10 | 20261029-014500-no-hard-deletes.md | 2026-10-29 01:45 | No hard deletes - deactivate categories, locations, offices |
| 11 | 20261029-013000-categories-stack.md | 2026-10-29 01:30 | Categories column stacks when multiple |
| 12 | 20261029-012000-waste-record-per-category.md | 2026-10-29 01:20 | Waste records per category (multi-category collection) |
| 13 | 20261029-011000-office-table-time-window.md | 2026-10-29 01:10 | Office schedules table - hide location, rename Window to Time window |
| 14 | 20261029-010000-locations-floor-groups.md | 2026-10-29 01:00 | Locations are the floor/side groups from the room list |
| 15 | 20261029-005000-locations-office-count.md | 2026-10-29 00:50 | Locations table shows office count instead of office list |
| 16 | 20261029-004500-rooms-as-offices.md | 2026-10-29 00:45 | Seed rooms as offices (locations = buildings) |
| 17 | 20261029-003000-categories-three.md | 2026-10-29 00:30 | Categories reduced to 3 (Biodegradable, Non-biodegradable, Recyclable) |
| 18 | 20261029-002000-schema-alignment.md | 2026-10-29 00:20 | Align modules with updated schema (office -> location) |
| 19 | 20261029-001000-one-migration-per-table.md | 2026-10-29 00:10 | One migration per table |
| 20 | 20261029-000000-offices-require-location.md | 2026-10-29 00:00 | Offices require a location (schema + seeder) |
| 21 | 20261026-235900-waste-record-seeder-collected.md | 2026-10-26 23:59 | Waste record seeder - only collected schedules |
| 22 | 20261026-235900-consolidate-office-location-migration.md | 2026-10-26 23:59 | Consolidate office/location migration (users -> offices -> location) |
| 23 | 20261026-235900-remove-collections-sidebar.md | 2026-10-26 23:59 | Remove Collections from sidebar |
| 24 | 20261026-235800-office-location-chain.md | 2026-10-26 23:58 | Office schedules - show office -> location chain |
| 25 | 20261026-235800-remove-collections-board.md | 2026-10-26 23:58 | Remove redundant /admin/collections board |
| 26 | 20261026-235800-records-view-only.md | 2026-10-26 23:58 | Admin waste records -> view-only |
| 27 | 20261026-235800-missed-priority-section.md | 2026-10-26 23:58 | Missed schedules as a separate high-priority section |
| 28 | 20261026-235500-cursor-pointer-all-buttons.md | 2026-10-26 23:55 | Add cursor: pointer to all buttons |
| 29 | 20261026-235000-status-single-row.md | 2026-10-26 23:50 | Status buttons on a single row |
| 30 | 20261026-234500-status-dialog-layout.md | 2026-10-26 23:45 | Status dialog - 1 row per status, colored, remarks last |
| 31 | 20261026-233000-waste-records-module.md | 2026-10-26 23:30 | Waste records module (backend + maintenance KG input) |
| 32 | 20261026-231500-combine-maintenance-dashboard.md | 2026-10-26 23:15 | Combine maintenance dashboard + My route |
| 33 | 20261026-230000-route-strip-legend-cleanup.md | 2026-10-26 23:00 | Remove stale In progress legend from RouteStrip |
| 34 | 20261026-225000-my-route-module.md | 2026-10-26 22:50 | My route module - sweep on mount + completeness |
| 35 | 20261026-223500-update-status-any.md | 2026-10-26 22:35 | Status action button + update regardless of current status |
| 36 | 20261026-222000-auto-sweep-past-due.md | 2026-10-26 22:20 | Auto-sweep past-due schedules to Missed on page open |
| 37 | 20261026-221000-past-due-flag.md | 2026-10-26 22:10 | Flag past-due scheduled rows on the list |
| 38 | 20261026-220000-today-highlight-visible.md | 2026-10-26 22:00 | Make today's row highlight visible |
| 39 | 20261026-215500-highlight-today-rows.md | 2026-10-26 21:55 | Highlight today's scheduled rows |
| 40 | 20261026-214500-status-priority-sort.md | 2026-10-26 21:45 | Default schedule sort by status priority |
| 41 | 20261026-213000-remove-overdue-status.md | 2026-10-26 21:30 | Remove Overdue from schedule statuses |
| 42 | 20261026-211500-lessen-schedule-statuses.md | 2026-10-26 21:15 | Reduce schedule statuses (drop In Progress & Rescheduled) |
| 43 | 20261026-210420-role-prefixed-routes.md | 2026-10-26 21:04 | All frontend routes prefixed with the user role |
| 44 | 20261026-205221-maintenance-sidebar-layout.md | 2026-10-26 20:52 | Maintenance layout - sidebar (matches admin/office) |
| 45 | 20261026-203813-location-select-close-fix.md | 2026-10-26 20:38 | Location dropdown closes after selecting |
| 46 | 20261026-203151-location-select-field.md | 2026-10-26 20:31 | Schedule form location picker - dropdown select |
| 47 | 20261026-201654-schedules-module.md | 2026-10-26 20:16 | Schedules module (multi-category, server-driven) |
| 48 | 20261026-143500-office-belongs-to-location.md | 2026-10-26 14:35 | Offices belong to locations (inverted relationship) |
| 49 | 20261026-135000-locations-module.md | 2026-10-26 13:50 | Locations module (same pattern as Users/Categories/Offices) |
| 50 | 20261026-125000-id-column-tables.md | 2026-10-26 12:50 | ID column on users, categories and offices tables |
| 51 | 20261026-123500-default-sort-id-desc.md | 2026-10-26 12:35 | Default sort id desc on users, categories, offices |
| 52 | 20261026-122000-offices-module.md | 2026-10-26 12:20 | Offices module (same pattern as Users/Categories) |
| 53 | 20261026-120000-categories-module.md | 2026-10-26 12:00 | Categories module (same pattern as Users) |
| 54 | 20261026-111546-confirm-actions.md | 2026-10-26 11:15 | Confirmation modals for actions |
| 55 | 20261026-110016-users-loading-state.md | 2026-10-26 11:00 | Users table loading state |
| 56 | 20261026-093937-role-first-structure.md | 2026-10-26 09:39 | Role-first folder structure |
| 57 | 20261025-233523-modular-restructure.md | 2026-10-25 23:35 | Modular restructure + role layouts |
| 58 | 20261025-231412-users-module.md | 2026-10-25 23:14 | Users backend module (search, filters, pagination) |
| 59 | 20261025-221050-typography-refresh.md | 2026-10-25 22:10 | Typography refresh (drop serif) |
| 60 | 20261025-215358-fieldwork-ui-redesign.md | 2026-10-25 21:53 | Fieldwork UI redesign (independent direction) |
| 61 | 20261025-211255-jwt-login-module.md | 2026-10-25 21:12 | JWT login module + role dashboards |
| 62 | 20261025-204626-logo-integration.md | 2026-10-25 20:46 | Integrate EcoTrack logo into the app |
| 63 | 20261025-203151-modern-frontend-redesign.md | 2026-10-25 20:31 | Modern frontend redesign (Harbor Glass v2) |
