# CLAUDE.md

Orientation and ground rules for working on MediCharm. Read this
first, every session — it's kept short on purpose. For detailed
history of *why* something was built a certain way, what was already
tried, or what a past session found broken, see `SESSION_LOG.md`
(only open it when you actually need that detail, not by default).

## What this project is

MediCharm is a healthcare appointment/EHR-style web app: patients
book appointments with doctors, order medicine, and view medical
reports; doctors manage their schedule and write reports; admins
approve doctors and oversee the platform. Three account types
(patient, doctor, admin), each with separate login and separate
localStorage session keys (`user`, `doctor`, `admin`).

## Stack

- **Backend**: Spring Boot 3.5.3, Java 17, Spring Security + JWT,
  Spring Data JPA / Hibernate, MySQL, Maven.
- **Frontend**: React 19 + Vite 7, React Router 7, Bootstrap 5
  (customized via CSS variables, not the default theme), axios.
- No test suite exists yet on either side. No CI.

## Repo layout

```
backend/src/main/java/com/medicharm/
  controller/   REST endpoints (one per resource: Auth, Appointment,
                Order, Report, Doctor, Admin, Profile, Notification)
  service/      business logic — controllers stay thin, logic lives here
  model/        JPA entities
  repository/   Spring Data interfaces
  security/     JWT filter, UserDetailsService, JwtUtil
  config/       SecurityConfig (route auth rules live here)

frontend/src/
  pages/        one component per route, wired in App.jsx
  components/   shared UI (Navbar, Footer, NotificationBell, ...)
  components/ui/  design-system primitives (StatusPill, EmptyState,
                ErrorState, Skeleton, icons) — use these, don't
                hand-roll a new badge/empty-state pattern
  utils/        one file per resource, thin axios wrappers
  hooks/        useToast, etc.
```

## Conventions to follow

- **Controllers stay thin.** Business logic and validation belong in
  the matching `service/` class, not inline in the controller method.
- **Identity-sensitive endpoints resolve the caller from the JWT**
  (`Authentication` parameter → email → look up the row), never from
  a client-supplied `{userId}` path/query parameter. This is the
  established pattern for anything "my own data" — see
  `ProfileController` and `NotificationController` for the reference
  shape. If a new endpoint needs "is this person allowed to touch
  this record," check ownership server-side; don't rely on the
  frontend not sending a bad ID.
- **Use the design-system primitives**, not raw Bootstrap classes, for
  anything status- or state-related:
  - Status badges → `<StatusPill status={...} />`
    (`components/ui/StatusPill.jsx`), not a hand-rolled
    `status === "X" ? "bg-warning" : ...` ternary.
  - Empty lists → `<EmptyState ... />`, not a bare `alert-info` div.
  - Page-level load failures → `<ErrorState onRetry={...} />`, not a
    plain alert with no retry action.
  - Loading → skeleton placeholders (`components/ui/Skeleton.jsx`)
    for content-shaped loads; spinners only for short indeterminate
    actions like a button submit.
  - Transient action results (success/failure of a click) →
    `useToast()` + `<Toast />`, never `window.alert()`.
  - `window.confirm()` is still fine — and preferred — for
    irreversible-action confirmations (delete, etc.). That's a
    different, legitimate use of a blocking dialog.
- **Color**: use the CSS variables in `index.css` (`--brand-*`,
  `--gray-*`, `--status-*`), not raw hex or Bootstrap's stock
  `text-success`/`btn-danger` colors directly — though note those
  Bootstrap utility classes ARE remapped to resolve through the same
  tokens, so using them isn't broken, just less explicit than using
  the tokens directly.
- **Container spacing**: top-level page wrapper is
  `<div className="container py-4">` — match this on any new page.
- A model/service/controller change that touches passwords, account
  state, or any `{id}`-based endpoint should get the same "can the
  caller actually do this" scrutiny as the rest of the app. Several
  past sessions found and fixed missing auth/ownership checks — don't
  reintroduce that class of bug.
- Always check `findByEmail`/repository method names actually exist
  before calling them — this project's repositories use Spring Data
  derived query methods, not custom `@Query` strings in most places.

## Known gaps (don't be surprised by these, don't silently fix big ones)

- No automated tests, no CI, no Maven build has been run in the
  environment these sessions are usually executed in (no Maven
  Central access) — verification has been manual (bracket-balance
  checks, method-signature cross-referencing). Treat new backend
  Java changes with extra care for typos/signature mismatches since
  there's no compiler safety net in-session.
- A few intentionally-orphaned dead files exist
  (`components/Sidebar.jsx`, `pages/UserDashboard.jsx`) — confirmed
  unimported, zero runtime impact, left in place rather than deleted
  since cleanup wasn't explicitly requested. Don't be alarmed if you
  find them; don't silently delete them either — ask first.
- No real email delivery is configured (`EmailService` exists and
  degrades gracefully to console-logging when SMTP isn't set up in
  `application.properties` — this is intentional present behavior,
  not a bug to fix without being asked).
- No pagination anywhere (`findAll()` throughout) — fine at current
  data volume.
- No audit log of admin actions.

## Workflow notes

- `test.http` has ready-to-run example requests for every endpoint,
  grouped by feature — check there before writing a new manual test.
- When you finish a unit of work, append a dated entry to
  `SESSION_LOG.md` describing what changed and why (this is where the
  detailed narrative belongs — keep this file, `CLAUDE.md`, lean).
- Don't delete files, rename established patterns, or change a
  cross-cutting convention (color tokens, container spacing, the
  ownership-check pattern, etc.) without flagging it first — these
  sessions build on each other and consistency matters more than any
  single session's local preference.
