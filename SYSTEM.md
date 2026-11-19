# TCGC EcoTrack: Waste Management and Monitoring System

> **System name.** The system is titled **TCGC EcoTrack**.
> **Source:** the project manuscript ("Waste Management and Monitoring System"). Items marked **(proposed)** are additions that the manuscript does not state. Confirm them with the adviser and school personnel before building.

---

## 1. Overview

TCGC EcoTrack is a web application for **Tangub City Global College (TCGC)**. It replaces manual waste recordkeeping with one place to:

- record waste information (location, date, quantity, status),
- manage garbage collection schedules,
- monitor collection status,
- view dashboard summaries,
- generate reports.

**Primary job:** let the college always know where waste is, whether it has been collected, and what is overdue.

**Problem it solves (from the manuscript):** records, schedules and updates are handled manually. Retrieving old records and preparing reports takes time, and maintenance personnel must ask the administrator for every update.

### Objectives

**General:** organize, record and monitor waste management activities, collection schedules and related information within the school.

**Specific:**
1. Record and manage waste information: location, date, quantity, status.
2. Manage collection schedules and monitor collection status.
3. Let non-admin users view waste records, schedules and status.
4. Produce organized reports and dashboard summaries that show where to improve.

---

## 2. Users and Roles

| Role | Who | What they do |
|---|---|---|
| **Administrator** | Designated college personnel responsible for waste management | Full control: records, schedules, status, concerns, reports, user accounts, master data, audit log |
| **Maintenance Personnel** | Janitorial and maintenance staff who do the collecting | See assigned schedules, update collection status, log waste quantities, report and resolve concerns, view scoped reports |

> **Role change.** The earlier spec included an Office role. The system now has two roles only: Administrator and Maintenance Personnel. Maintenance crews report and manage concerns; the administrator keeps oversight of the same concern list.

### Permission matrix

| Capability | Administrator | Maintenance |
|---|:---:|:---:|
| Log in | Yes | Yes |
| Manage user accounts | Yes | No |
| Add / edit / delete waste records | Yes | No |
| View waste records | All | Own logged records |
| Create / edit / delete schedules | Yes | No |
| View schedules | All | Assigned to them |
| Update collection status | Yes | Assigned schedules |
| View dashboard | Full | Task-focused |
| Generate and export reports | Yes | Own work |
| Submit a concern, e.g. overflowing bin | Yes | Yes |
| Manage concern status | Yes | Yes |
| View audit log | Yes | No |

---

## 3. Scope and Delimitation

**In scope**
- Waste recording and monitoring inside the TCGC campus.
- Collection scheduling and status monitoring.
- Dashboard summaries and reports.
- Role-based access for administrators and maintenance personnel.

**Out of scope (from the manuscript)**
- Waste management outside school premises.
- Automatic waste measurement, sensors or GPS tracking.
- The actual collection service. The system only records it.
- All data is **entered manually**.

---

## 4. Modules and Features

### M1. Authentication and Access Control
| ID | Requirement |
|---|---|
| M1.1 | Users log in with email or username and password. |
| M1.2 | Passwords are hashed. Sessions expire after inactivity. |
| M1.3 | After login, users go to the dashboard for their role. |
| M1.4 | Every page and action checks the user's role on the server, not only in the interface. |
| M1.5 | The administrator creates, edits, deactivates and resets accounts, and assigns role and office. |

### M2. Waste Records
| ID | Requirement |
|---|---|
| M2.1 | Admin **adds** a record with location, date, quantity and status. |
| M2.2 | Admin **edits, views and deletes** records (soft delete recommended). |
| M2.3 | Validation: location required, date not in the future, quantity a positive number. |
| M2.4 | **(proposed)** Each record has a waste category: Biodegradable, Recyclable, Residual, Hazardous/Special. |
| M2.5 | **(proposed)** Quantity is stored in **kilograms**, with an optional remarks field. |
| M2.6 | Search, filter (date range, location, category, status) and sort the record list. |
| M2.7 | Maintenance personnel see the records they logged, read-only, limited by their permissions. |

### M3. Collection Schedules
| ID | Requirement |
|---|---|
| M3.1 | Admin creates a schedule with date, time window and location(s). |
| M3.2 | Admin assigns a schedule to a maintenance personnel account (proposed). |
| M3.3 | Schedules can be one-time or recurring, e.g. every Monday and Thursday (proposed). |
| M3.4 | Admin edits, reschedules or cancels a schedule. Changes are logged. |
| M3.5 | Calendar view and list view of schedules. |
| M3.6 | Maintenance personnel see their assigned upcoming collections. |

### M4. Collection Status Monitoring
| ID | Requirement |
|---|---|
| M4.1 | Each schedule has a status: **Scheduled, In Progress, Collected, Missed, Rescheduled**. |
| M4.2 | Admin and the assigned maintenance personnel can update status. |
| M4.3 | Each status change stores who changed it, when, and an optional remark. |
| M4.4 | A schedule not marked Collected after its time window is flagged **Overdue** automatically. |
| M4.5 | Linked waste records move to **Collected** when their schedule is marked Collected. |

### M5. Dashboard
| ID | Requirement |
|---|---|
| M5.1 | Admin: totals for the selected period, waste by category, collections completed vs missed, overdue items, and the locations producing the most waste. |
| M5.2 | Maintenance: "My collections today" with status buttons. |
| M5.3 | Maintenance: assigned route, next stop, missed runs and recent waste logged. |
| M5.4 | The period filter offers Today, This week, This month and Custom range. |

### M6. Reports
| ID | Requirement |
|---|---|
| M6.1 | Waste summary by period, location and category. |
| M6.2 | Collection report: scheduled vs collected vs missed. |
| M6.3 | Missed and overdue collections report. |
| M6.4 | Reports can be printed. **(proposed)** CSV and PDF export. |
| M6.5 | Every report shows who generated it and when, plus the filters used. |

### M7. Concerns (proposed)
| ID | Requirement |
|---|---|
| M7.1 | Any logged-in user reports a problem: overflowing bin, improper disposal, missed pickup. |
| M7.2 | A concern has location, description and an optional photo. |
| M7.3 | Admin reviews it and sets it Open, Acknowledged or Resolved. It can be turned into a waste record or schedule. |

> This module backs up the manuscript's introduction, which says the system helps report overflowing bins and improper disposal. The scope section never lists it, so confirm it before building.

### M8. Administration
| ID | Requirement |
|---|---|
| M8.1 | Manage master lists: locations (buildings, floors, areas), offices, waste categories. |
| M8.2 | Audit log of logins, creates, edits, deletes and status changes. |
| M8.3 | Database backup instructions for the administrator. |

---

## 5. Workflow

```
 ADMIN                         MAINTENANCE
   |                              |
 1. Log in                        |
   |                              |
 2. Manage master data,           |
    schedules and reports         |
   |                              |
 3. Create schedule,              |
    assign to maintenance ------> 4. Sees assigned route
   |                              |
   |                           5. Updates status
   |                              (Collected / Missed / Cancelled)
   |                           6. Logs quantities on collection
   |                           7. Reports and resolves concerns
   |<-- dashboards and badges ----+
   |                              |
 8. Reviews reports and audit log |
```

**Step by step**
1. The administrator logs in.
2. The administrator manages master data, users, schedules, concerns and reports.
3. The administrator creates a collection schedule for one or more locations and assigns it to maintenance personnel.
4. The maintenance personnel log in and see only their assigned collections.
5. When a collection is finished, they set it to **Collected**, or **Missed** with a required reason, or **Cancelled**.
6. When marking a collection **Collected**, they can log the quantity per category; the system creates a waste record per category.
7. Maintenance personnel report concerns and can acknowledge and resolve them with a note; the administrator sees the same list.
8. Past-due **Scheduled** collections are swept to **Missed** when schedule views are loaded.
9. Dashboards and badges update; the administrator reviews reports and the audit log.

### Status lifecycles

**Waste record:** generated from a completed collection and displayed as a read-only register.

**Collection schedule:** `Scheduled → Collected`, `Scheduled → Missed`, or `Scheduled → Cancelled`.

**Concern:** `Open → Acknowledged → Resolved`. Reopening returns it to `Open` and clears the resolution.

---

## 6. Data Model

```
offices ──< users
offices ──< locations
locations ──< waste_records >── waste_categories
locations ──< schedule_locations >── collection_schedules
users (maintenance) ──< collection_schedules
collection_schedules ──< status_history
users ──< concerns >── locations
users ──< audit_log
```

| Table | Key fields |
|---|---|
| `users` | id, full_name, email, password_hash, role (`admin` / `maintenance`), office_id, is_active, created_at |
| `offices` | id, name, contact_person |
| `locations` | id, name, building, floor_or_area, office_id (nullable) |
| `waste_categories` | id, name, color_code, description |
| `waste_records` | id, location_id, category_id, record_date, quantity_kg, status, remarks, created_by, created_at, updated_at, deleted_at |
| `collection_schedules` | id, scheduled_date, window_start, window_end, recurrence_rule, assigned_to, status, notes, created_by |
| `schedule_locations` | schedule_id, location_id |
| `status_history` | id, schedule_id, old_status, new_status, changed_by, remark, changed_at |
| `concerns` | id, location_id, reported_by, description, photo_path, status, created_at, resolved_at |
| `audit_log` | id, user_id, action, entity, entity_id, detail, created_at |

---

## 7. Site Map and Screens

**Administrator**
- Dashboard
- Waste Records (list, add, edit)
- Schedules (calendar, list, add, edit)
- Collections (status board)
- Concerns
- Reports
- Locations, Offices and Categories
- Users
- Audit Log

**Maintenance**
- My Collections (today, upcoming)
- Collection detail with status buttons
- Concerns (report, acknowledge, resolve)
- Reports scoped to own work
- My Account

**Shared:** Login, My Account (change password), Logout.

---

## 8. Input-Process-Output

| Input | Process | Output |
|---|---|---|
| Waste location, date, quantity, category, status | Validate and store | Organized waste records |
| Collection schedule details | Create, update and retrieve schedules | Collection schedules |
| Status update from admin or maintenance | Validate, log history, update linked records | Updated collection status |
| Records and collection activity | Summarize | Dashboard summaries |
| Stored data and report filters | Retrieve and organize | Generated reports |
| View request from maintenance | Check role and assignment scope, return permitted data | Viewable waste management information |

---

## 9. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Security | Server-side role checks, hashed passwords, CSRF protection, input sanitising, prepared SQL statements, session timeout. |
| Usability | Simple screens that work for non-technical staff. The maintenance view is **mobile-first** with large touch targets. |
| Reliability | Stored records are retrieved consistently. Scheduled backups. |
| Performance | Typical pages load in under 3 seconds on the campus network. Lists are paginated. |
| Data integrity | Foreign keys, validation, soft deletes, and a history of every status change. |
| Maintainability | Organized code structure, commented code, and a documented database schema. *(The manuscript repeats the Data Integrity text for this row. This replaces it.)* |
| Compatibility | Current Chrome and Edge on Windows 10/11, and mobile Chrome on Android. |
| Accessibility | Keyboard operable, visible focus, text contrast of at least 4.5:1, status never shown by color alone. |

---

## 10. Technology and Environment

| Item | Choice (from the manuscript) |
|---|---|
| Development model | Waterfall: requirements, design, development, testing, implementation |
| Front end | HTML, CSS, JavaScript |
| Back end | PHP |
| Database | MySQL, managed with phpMyAdmin |
| Local server | XAMPP |
| Editor | Visual Studio Code |
| Browsers | Google Chrome, Microsoft Edge |
| Minimum hardware | Core i3 or equivalent, 4 GB RAM, 128 GB storage, 1366 x 768 display |
| Recommended hardware | Core i5 or equivalent, 8 GB+ RAM, 256 GB SSD, 1920 x 1080 display |

> The manuscript also says the system "may use" PHP. Confirm the stack with your adviser before you start building.

---

## 11. Open Questions

1. What is the **unit of quantity**: kg, sacks or bags?
2. What **waste categories** does TCGC use? Check them against the campus segregation scheme and local government requirements.
3. Is the system hosted **on campus** or online?
4. What data must be **exportable** for compliance or reporting to the school administration?
5. Who owns the **final system name**?
