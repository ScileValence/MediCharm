---

# Version 1.5 — Admin Module, Doctor Workflow, and History Views

## Release Date

June 2026

## Overview

Version 1.5 delivers the Admin Module and Doctor Workflow planned in
1.4, plus patient-facing appointment and order history — closing out
everything listed under "Planned Work for Version 1.5" above.

## Admin Module

* Admin login (reuses the existing patient login endpoint for users
  with the `ADMIN` role — no separate admin auth system).
* Admin Dashboard with tabbed sections: Overview, Doctors, Users,
  Appointments, Orders, Reports.
* Doctor approval system — approve, reject, suspend, or delete any
  doctor application.
* Direct doctor creation from the Admin Dashboard (auto-approved,
  bypassing the pending-review queue).
* User management — view and delete registered patients.
* Appointment, order, and report oversight — view all records across
  every patient, with cancel/delete actions where appropriate.
* Dashboard summary stats (patient/doctor/appointment/order/report
  counts, pending doctor count).

## Doctor Workflow

* Appointment confirmation, rejection, and completion, with status
  badges and action buttons on the Doctor Dashboard.

## Patient Enhancements

* Appointment History page — filterable by upcoming/completed/
  cancelled, shows full history including appointments the active
  dashboard view no longer displays.
* Order History page — filterable by active/cancelled, itemized with
  subtotal/shipping breakdown.
* Dynamic Departments page — now pulls real, approved doctors from
  the database and groups them by department automatically, instead
  of a fixed hardcoded roster. "Book Appointment" carries the chosen
  doctor through to the booking form.

## Bug Fixes

* Fixed doctor self-registration storing passwords in plaintext
  (passwords are now hashed before saving, matching how login already
  verified them — self-registered doctors could not previously log in
  at all).
* Fixed doctor management endpoints (approve/reject/suspend/delete)
  being reachable without authentication.
* Fixed password hashes being included in API responses for users and
  doctors.
* Fixed the patient Dashboard always showing a "Cancel" button on
  every appointment regardless of status, including completed ones —
  it now shows a status badge and only offers Cancel while an
  appointment is still pending or confirmed.
* Fixed the Admin Dashboard's appointments table offering "Cancel" on
  completed and rejected appointments — cancel is now only available
  for appointments that are still pending or confirmed.
* Fixed a duplicated "Dr. Dr. [Name]" display caused by doctor names
  already including the "Dr." prefix in the database.

For full session-by-session detail on what changed and why, see
`CLAUDE.md` at the project root.

---

# Version Summary

Version: 1.5

Status: Stable

Core Workflow Completion:

Patient → Appointment → Doctor → Report → Download

Admin → Doctor Approval → Oversight

Completed Successfully.
