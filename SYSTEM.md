# EcoTrack TCGC: Waste Management and Monitoring System

> **Working name.** "EcoTrack TCGC" is a proposed name. Replace it everywhere once the final name is chosen.
> **Source:** the project manuscript ("Waste Management and Monitoring System"). Items marked **(proposed)** are additions that the manuscript does not state. Confirm them with the adviser and the offices before building.

---

## 1. Overview

EcoTrack TCGC is a web application for **Tangub City Global College (TCGC)**. It replaces manual waste recordkeeping with one place to:

- record waste information (location, date, quantity, status),
- manage garbage collection schedules,
- monitor collection status,
- view dashboard summaries,
- generate reports.

**Primary job:** let the college always know where waste is, whether it has been collected, and what is overdue.

**Problem it solves (from the manuscript):** records, schedules and updates are handled manually. Retrieving old records and preparing reports takes time, and offices must ask the administrator for every update.

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
| **Administrator** | Designated college personnel responsible for waste management | Full control: records, schedules, status, reports, user accounts |
| **Maintenance Personnel** | Janitorial and maintenance staff who do the collecting | See assigned schedules and **update collection status** (proposed) |
| **Office** | Offices and departments of TCGC | View records, schedules and status that apply to them, **view-only** |

> **Manuscript conflict to resolve.** The manuscript says "only the administrator can log in" and that staff have view-only access. It also needs those staff to see data. This spec gives every role its own login so access can be restricted properly. Maintenance updating status and offices submitting concerns are **proposed** extensions.

### Permission matrix

| Capability | Administrator | Maintenance | Office |
|---|:---:|:---:|:---:|
| Log in | Yes | Yes | Yes |
| Manage user accounts | Yes | No | No |
| Add / edit / delete waste records | Yes | No | No |
| View waste records | All | All (proposed) | Own office / locations |
| Create / edit / delete schedules | Yes | No | No |
| View schedules | All | Assigned to them | Their locations |
| Update collection status | Yes | Assigned schedules (proposed) | No |
| View dashboard | Full | Task-focused | Office summary |
| Generate and export reports | Yes | No | Own office only (proposed) |
| Submit a concern, e.g. overflowing bin | Yes | Yes | Yes (proposed) |
| View audit log | Yes | No | No |

---

## 3. Scope and Delimitation

**In scope**
- Waste recording and monitoring inside the TCGC campus.
- Collection scheduling and status monitoring.
- Dashboard summaries and reports.
- Role-based, view-only access for non-admin users.

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
| M2.7 | Non-admin roles see the same list, read-only, limited by their permissions. |

### M3. Collection Schedules
| ID | Requirement |
|---|---|
| M3.1 | Admin creates a schedule with date, time window and location(s). |
| M3.2 | Admin assigns a schedule to a maintenance personnel account (proposed). |
| M3.3 | Schedules can be one-time or recurring, e.g. every Monday and Thursday (proposed). |
| M3.4 | Admin edits, reschedules or cancels a schedule. Changes are logged. |
| M3.5 | Calendar view and list view of schedules. |
| M3.6 | Offices see upcoming collections for their own locations. |

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
| M5.3 | Office: its own recent records and next scheduled collection. |
| M5.4 | The period filter offers Today, This week, This month and Custom range. |

### M6. Reports
| ID | Requirement |
|---|---|
| M6.1 | Waste summary by period, location, office and category. |
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
 ADMIN                       MAINTENANCE                  OFFICE
   |                              |                          |
 1. Log in                        |                          |
   |                              |                          |
 2. Record waste ------------------------------------------> (appears in office view)
   |   (location, date, qty,      |                          |
   |    category, status=Pending) |                          |
   |                              |                          |
 3. Create schedule,              |                          |
   assign to maintenance -------> 4. Sees task on phone      |
   |                              |                          |
   |                           5. Starts: status = In Progress|
   |                           6. Finishes: status = Collected|
   |                              |   (or Missed + reason)   |
   |<-- dashboard updates --------+--------------------------> sees updated status
   |                                                         |
 7. Reviews dashboard,                                       |
    handles Overdue / Missed                                 |
   |                                                         |
 8. Generates report                                         |
```

**Step by step**
1. The admin logs in.
2. The admin adds waste records. Initial status is **Pending**.
3. The admin creates a collection schedule for one or more locations and assigns it.
4. The maintenance personnel log in and see their assigned collections.
5. When collection begins, they set the status to **In Progress**.
6. When done, they set it to **Collected**, or **Missed** with a reason. Linked waste records update to Collected.
7. The system flags anything not collected by the end of its time window as **Overdue**.
8. Offices log in to see the status of waste records and the next collection for their locations.
9. The admin reviews dashboard summaries, follows up on missed items, and generates reports.

### Status lifecycles

**Waste record:** `Pending → Scheduled → Collected` (and `Cancelled`)

**Collection schedule:** `Scheduled → In Progress → Collected`
Side paths: `Scheduled → Missed → Rescheduled`, and `Scheduled → Cancelled`.

**Concern (proposed):** `Open → Acknowledged → Resolved`

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
| `users` | id, full_name, email, password_hash, role (`admin` / `maintenance` / `office`), office_id, is_active, created_at |
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
- Report a Concern

**Office**
- Office Dashboard
- Records for my locations
- Schedules for my locations
- Report a Concern

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
| View request from office or maintenance | Check role, return permitted data | Viewable waste management information |

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

1. Do offices get **their own logins**, or one shared view per office?
2. Can maintenance personnel **update status** themselves, or does only the admin?
3. What is the **unit of quantity**: kg, sacks or bags?
4. What **waste categories** does TCGC use? Check them against the campus segregation scheme and local government requirements.
5. Are **concerns** (M7) in scope?
6. Is the system hosted **on campus** or online?
7. What data must be **exportable** for compliance or reporting to the school administration?
8. Who owns the **final system name**?
