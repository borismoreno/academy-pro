# AcademyPro — Product Requirements Document (PRD)

> Version 1.0 — April 2025
> Use this document as context at the start of every Claude conversation.

---

## 1. Product Description

**AcademyPro** is a B2B SaaS platform targeting soccer academies in Latin America (starting in Ecuador). It enables academy staff to manage players, teams, attendance, and performance evaluations. Parents have read-only access to a portal to track their child's progress.

---

## 2. Tech Stack

| Layer            | Technology                     |
| ---------------- | ------------------------------ |
| Frontend         | React + Vite                   |
| Backend          | NestJS                         |
| Database         | PostgreSQL (managed with Neon) |
| Auth             | JWT + Guards (NestJS)          |
| Hosting          | Railway or Render              |
| Storage (photos) | Cloudinary or S3               |

---

## 3. System Roles

| Role               | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| `saas_owner`       | Platform owner (Boris). Global access to all academies.            |
| `academy_director` | Owner/director of an academy. Full control over their academy.     |
| `coach`            | Trainer assigned to one or more teams within an academy.           |
| `parent`           | Father/mother of a player. Read-only access to their child's info. |

> A user can hold different roles in different academies (e.g. coach in academy A and parent in academy B). This is handled by the `user_academy_roles` table.

---

## 4. Permissions by Role

| Feature                           | saas_owner | academy_director | coach              | parent              |
| --------------------------------- | ---------- | ---------------- | ------------------ | ------------------- |
| View all academies                | ✅         | ❌               | ❌                 | ❌                  |
| Create / suspend academies        | ✅         | ❌               | ❌                 | ❌                  |
| Invite director to new academy    | ✅         | ❌               | ❌                 | ❌                  |
| View global SaaS metrics          | ✅         | ❌               | ❌                 | ❌                  |
| Manage academy subscription       | ✅         | ❌               | ❌                 | ❌                  |
| View academy dashboard            | ❌         | ✅               | ✅ (own team only) | ❌                  |
| Manage academy settings           | ❌         | ✅               | ❌                 | ❌                  |
| Create / edit / delete teams      | ❌         | ✅               | ❌                 | ❌                  |
| Assign coaches to teams           | ❌         | ✅               | ❌                 | ❌                  |
| Invite coaches and parents        | ❌         | ✅               | ❌                 | ❌                  |
| Create / edit players             | ❌         | ✅               | ✅ (own team only) | ❌                  |
| View player list                  | ❌         | ✅               | ✅ (own team only) | ❌                  |
| Record attendance                 | ❌         | ✅               | ✅ (own team only) | ❌                  |
| View attendance                   | ❌         | ✅               | ✅ (own team only) | ✅ (own child only) |
| Create evaluations                | ❌         | ✅               | ✅ (own team only) | ❌                  |
| View evaluations                  | ❌         | ✅               | ✅ (own team only) | ✅ (own child only) |
| Customize evaluation metrics      | ❌         | ✅               | ❌                 | ❌                  |
| View notifications                | ❌         | ✅               | ✅                 | ✅                  |
| View child's profile and progress | ❌         | ❌               | ❌                 | ✅                  |

---

## 5. MVP Screens

### 5.1 Login

- Email and password only.
- System automatically detects the user's role and redirects to the appropriate view.
- Password recovery via email.

### 5.2 Dashboard (academy_director / coach)

- Metrics: active players, teams, average attendance, coaches.
- Alerts: players with low attendance.
- Upcoming training sessions.

### 5.3 Players

- List with filter by category/team.
- Player profile: personal info, performance metrics, attendance history.
- Registration form: first name, last name, birth date, position, category, parent contact.

### 5.4 Teams

- Cards by category (U8 to U18) with assigned coach and average attendance.
- Form to create a team: name, category, head coach, assistant coach, field, schedule.

### 5.5 Attendance

- Session registration: present / absent per player.
- Monthly calendar history per player.
- Monthly attendance percentage.

### 5.6 Evaluations

- Rating by configurable metrics (technical, physical, tactical, attitude) on a 1–10 scale.
- Coach comment.
- Evaluation history with progress chart.

### 5.7 Parent Portal

- Simplified view: child's profile, latest evaluation metrics, monthly attendance.
- Notifications: new evaluation available, session recorded.

### 5.8 Settings (academy_director)

- Academy data: name, logo, city, phone, email, address.
- User management: invite coaches and parents by email.
- Evaluation metrics: enable/disable/add custom metrics.

---

## 6. Database Schema

### `users`

Global user identity. No `academy_id` or `role` (those live in `user_academy_roles`).

| Field         | Type      | Notes  |
| ------------- | --------- | ------ |
| id            | uuid PK   |        |
| full_name     | string    |        |
| email         | string    | unique |
| password_hash | string    |        |
| is_active     | boolean   |        |
| created_at    | timestamp |        |
| updated_at    | timestamp |        |

---

### `academies`

An academy is the main tenant of the system.

| Field      | Type      | Notes |
| ---------- | --------- | ----- |
| id         | uuid PK   |       |
| name       | string    |       |
| city       | string    |       |
| address    | string    |       |
| phone      | string    |       |
| email      | string    |       |
| logo_url   | string    |       |
| created_at | timestamp |       |
| updated_at | timestamp |       |

---

### `user_academy_roles`

N:M relationship between users and academies. Allows a user to have different roles in different academies.

| Field      | Type                | Notes                                               |
| ---------- | ------------------- | --------------------------------------------------- |
| id         | uuid PK             |                                                     |
| user_id    | uuid FK → users     |                                                     |
| academy_id | uuid FK → academies |                                                     |
| role       | enum                | `saas_owner`, `academy_director`, `coach`, `parent` |
| is_active  | boolean             |                                                     |
| created_at | timestamp           |                                                     |

> Unique constraint: (user_id, academy_id) — a user cannot have two roles in the same academy.

---

### `academy_subscriptions`

Subscription plan and status per academy, managed by `saas_owner`.

| Field      | Type                | Notes                              |
| ---------- | ------------------- | ---------------------------------- |
| id         | uuid PK             |                                    |
| academy_id | uuid FK → academies |                                    |
| plan       | enum                | `free`, `pro`, `enterprise`        |
| status     | enum                | `active`, `suspended`, `cancelled` |
| starts_at  | date                |                                    |
| ends_at    | date                |                                    |
| created_at | timestamp           |                                    |

---

### `invitations`

Handles the invitation flow for coaches and parents sent by the `academy_director`.

| Field       | Type                | Notes                            |
| ----------- | ------------------- | -------------------------------- |
| id          | uuid PK             |                                  |
| academy_id  | uuid FK → academies |                                  |
| invited_by  | uuid FK → users     |                                  |
| email       | string              | invitee's email                  |
| role        | enum                | `coach` or `parent`              |
| token       | string              | unique token to accept invite    |
| status      | enum                | `pending`, `accepted`, `expired` |
| expires_at  | timestamp           |                                  |
| accepted_at | timestamp           | nullable                         |
| created_at  | timestamp           |                                  |

---

### `teams`

Teams within an academy, grouped by age category.

| Field      | Type                | Notes           |
| ---------- | ------------------- | --------------- |
| id         | uuid PK             |                 |
| academy_id | uuid FK → academies |                 |
| name       | string              | e.g. "U14"      |
| category   | string              | e.g. "Under 14" |
| is_active  | boolean             |                 |
| created_at | timestamp           |                 |

---

### `fields`

Physical fields belonging to an academy. An academy can have one or more fields. Each field belongs to one academy.

| Field      | Type                | Notes    |
| ---------- | ------------------- | -------- |
| id         | uuid PK             |          |
| academy_id | uuid FK → academies |          |
| name       | string              |          |
| location   | string              | nullable |
| is_active  | boolean             |          |
| created_at | timestamp           |          |
| updated_at | timestamp           |          |

---

### `team_schedules`

Training schedule entries for a team. A team can have multiple schedules across different days and fields.

| Field       | Type               | Notes                    |
| ----------- | ------------------ | ------------------------ |
| id          | uuid PK            |                          |
| team_id     | uuid FK → teams    |                          |
| field_id    | uuid FK → fields   |                          |
| day_of_week | DayOfWeek enum     | see DayOfWeek enum below |
| start_time  | string             | format HH:MM             |
| end_time    | string             | format HH:MM             |
| created_at  | timestamp          |                          |

**DayOfWeek enum:** `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`

---

### `team_coaches`

N:M relationship between teams and coaches. A coach can manage multiple teams.

| Field      | Type            | Notes                     |
| ---------- | --------------- | ------------------------- |
| id         | uuid PK         |                           |
| team_id    | uuid FK → teams |                           |
| user_id    | uuid FK → users |                           |
| is_primary | boolean         | identifies the head coach |
| created_at | timestamp       |                           |

---

### `players`

Players registered in an academy, assigned to a team.

| Field      | Type                | Notes          |
| ---------- | ------------------- | -------------- |
| id         | uuid PK             |                |
| academy_id | uuid FK → academies |                |
| team_id    | uuid FK → teams     |                |
| full_name  | string              |                |
| birth_date | date                |                |
| position   | string              | e.g. "Forward" |
| photo_url  | string              | nullable       |
| is_active  | boolean             |                |
| created_at | timestamp           |                |
| updated_at | timestamp           |                |

---

### `player_parents`

Relationship between a player and their registered parent(s)/guardian(s).

| Field        | Type              | Notes                               |
| ------------ | ----------------- | ----------------------------------- |
| id           | uuid PK           |                                     |
| player_id    | uuid FK → players |                                     |
| user_id      | uuid FK → users   |                                     |
| relationship | string            | e.g. "father", "mother", "guardian" |
| created_at   | timestamp         |                                     |

---

### `attendance_sessions`

Each training session where attendance is recorded.

| Field        | Type            | Notes           |
| ------------ | --------------- | --------------- |
| id           | uuid PK         |                 |
| team_id      | uuid FK → teams |                 |
| coach_id     | uuid FK → users | who recorded it |
| session_date | date            |                 |
| notes        | text            | nullable        |
| created_at   | timestamp       |                 |

---

### `attendance_records`

Individual attendance record per player per session.

| Field      | Type                          | Notes |
| ---------- | ----------------------------- | ----- |
| id         | uuid PK                       |       |
| session_id | uuid FK → attendance_sessions |       |
| player_id  | uuid FK → players             |       |
| present    | boolean                       |       |
| created_at | timestamp                     |       |

---

### `evaluation_metrics`

Configurable metrics per academy. Allows customizing what gets evaluated.

| Field       | Type                | Notes                        |
| ----------- | ------------------- | ---------------------------- |
| id          | uuid PK             |                              |
| academy_id  | uuid FK → academies |                              |
| metric_name | string              | e.g. "Technical", "Attitude" |
| is_active   | boolean             |                              |
| sort_order  | integer             | display order                |
| created_at  | timestamp           |                              |

---

### `evaluations`

Periodic evaluation of a player by a coach.

| Field        | Type              | Notes    |
| ------------ | ----------------- | -------- |
| id           | uuid PK           |          |
| player_id    | uuid FK → players |          |
| coach_id     | uuid FK → users   |          |
| evaluated_at | date              |          |
| coach_notes  | text              | nullable |
| created_at   | timestamp         |          |

---

### `evaluation_scores`

Score per metric within an evaluation. Dynamic based on configured metrics.

| Field         | Type                         | Notes   |
| ------------- | ---------------------------- | ------- |
| id            | uuid PK                      |         |
| evaluation_id | uuid FK → evaluations        |         |
| metric_id     | uuid FK → evaluation_metrics |         |
| score         | integer                      | 1 to 10 |

---

### `notifications`

Notifications for coaches and parents (new evaluation, session recorded, etc.).

| Field      | Type                | Notes     |
| ---------- | ------------------- | --------- |
| id         | uuid PK             |           |
| user_id    | uuid FK → users     | recipient |
| academy_id | uuid FK → academies |           |
| title      | string              |           |
| message    | string              |           |
| is_read    | boolean             |           |
| created_at | timestamp           |           |

---

## 7. Key Relationships

```
users              ──< user_academy_roles >── academies
academies          ──< academy_subscriptions
academies          ──< invitations
academies          ──< teams
academies          ──< players
academies          ──< evaluation_metrics
academies          ──< fields
fields             ──< team_schedules
teams              ──< team_schedules
teams              ──< team_coaches >── users
teams              ──< players
players            ──< player_parents >── users
teams              ──< attendance_sessions
attendance_sessions──< attendance_records
players            ──< attendance_records
players            ──< evaluations
users              ──< evaluations
evaluations        ──< evaluation_scores
evaluation_metrics ──< evaluation_scores
users              ──< notifications
```

---

## 8. Business Context

- Initial market: soccer academies in Ecuador.
- First validated customer: founder's uncle's academy (anchor client).
- MVP goal: 2 months of solo development.
- Growth strategy: validate with first academy → referrals to other academies in Ecuador → regional expansion across Latin America.
- Business model: subscription SaaS (free / pro / enterprise plans per academy).
- App UI language: Spanish (target users are Spanish-speaking).

---

_Document generated on 09/04/2026. Update as the product evolves._
