# MediCharm Development Log

## Release Date

June 2026

---

# Overview

Version 1.4 marks the completion of the core healthcare workflow within MediCharm.

This release focuses on authentication, appointment scheduling, medicine ordering, doctor-side report generation, and patient-side report access.

The complete Patient → Doctor → Report → Download workflow is now operational.

---

# Major Milestones Achieved

## Authentication System

### Patient Authentication

* Implemented patient registration.
* Implemented patient login.
* Added JWT token generation.
* Added JWT token validation.
* Added BCrypt password encryption.
* Protected frontend routes using JWT.

### Doctor Authentication

* Implemented dedicated doctor login.
* Added doctor account validation.
* Added role-based authentication.
* Integrated doctor JWT workflow.

### Security

* Configured Spring Security.
* Implemented JwtAuthenticationFilter.
* Configured protected API routes.
* Added CORS support for React frontend.

---

# Appointment Module

## Backend

* Created appointment scheduling API.
* Implemented appointment retrieval by patient.
* Implemented appointment retrieval by doctor.
* Added appointment status management.

## Frontend

* Developed appointment booking page.
* Added doctor selection by department.
* Implemented appointment listing in dashboard.
* Added appointment cancellation functionality.

## Current Status

Working.

---

# Medicine Ordering Module

## Backend

* Created medicine retrieval APIs.
* Implemented medicine order creation.
* Implemented user-specific order retrieval.
* Added order cancellation support.

## Frontend

* Developed medicine ordering interface.
* Added dashboard order tracking.
* Added order status display.
* Implemented cancellation actions.

## Current Status

Working.

---

# Dashboard Module

## Patient Dashboard

Implemented:

* Appointment overview
* Medicine order overview
* Dashboard navigation
* Dynamic data loading

Fixed:

* Dashboard rendering failures
* Undefined array mapping issues
* Data refresh issues

## Current Status

Working.

---

# Doctor Dashboard

## Implemented

* Doctor authentication integration
* Doctor appointment retrieval
* Appointment display table
* Report creation navigation

## Fixed

* Doctor JWT authorization issues
* Doctor appointment visibility issues
* Doctor account validation problems

## Current Status

Working.

---

# Medical Report Module

## Report Creation

Implemented:

* Report text entry
* Doctor comments
* File attachment support
* Appointment-linked reports

## File Upload Support

Supported file types:

* PDF
* TXT
* DOC
* DOCX
* JPG
* PNG

## Report Viewing

Implemented:

* Patient report listing
* Doctor information display
* Observation display
* Comments display

## File Downloads

Implemented:

* Secure file storage
* Download endpoint
* Patient-side attachment downloads

## Bugs Resolved

### Report Upload

Resolved multipart/form-data issues.

### File Persistence

Resolved report file storage issues.

### Security Restrictions

Resolved Spring Security download blocking.

### Appointment Retrieval

Resolved appointment lookup issues for report creation.

## Current Status

Working.

---

# Database Progress

Verified working integration for:

* users
* doctors
* appointments
* medicines
* orders
* health_reports

Implemented audit-style retention for:

* Cancelled appointments
* Cancelled medicine orders

Records remain in database while being hidden from active dashboard views.

---

# Important Fixes Completed

### JWT Authentication

Fixed user authorization issues.

### 403 Errors

Resolved multiple security configuration issues.

### Dashboard Rendering

Resolved React rendering crashes caused by undefined collections.

### Doctor Login

Implemented full doctor authentication flow.

### Medical Reports

Completed upload and download functionality.

### File Attachments

Implemented persistent file storage and retrieval.

---

# Current System Status

## Functional Modules

✅ Authentication

✅ Appointment Scheduling

✅ Appointment Cancellation

✅ Medicine Ordering

✅ Medicine Order Tracking

✅ Doctor Dashboard

✅ Medical Reports

✅ File Uploads

✅ File Downloads

✅ JWT Security

✅ MySQL Persistence

---

# Planned Work for Version 1.5

## Admin Module

* Admin Login
* Admin Dashboard
* Doctor Approval System
* User Management

## Doctor Workflow

* Appointment Confirmation
* Appointment Rejection
* Appointment Completion

## Patient Enhancements

* Profile Management
* Appointment History
* Order History

## UI Improvements

* Dashboard Analytics
* Enhanced User Experience
* Responsive Design Refinements

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
