-- =====================================================================
-- MediCharm v1.5 — Seed the first Admin account
-- =====================================================================
--
-- Run this ONCE, directly against your medicharm PostgreSQL database,
-- after the application has started at least once (so Hibernate has
-- created the `users` table). There is no code-based seeding — this
-- is the manual, one-time insert you asked for.
--
-- HOW TO RUN
--   psql "postgresql://USER:PASSWORD@HOST:PORT/medicharm" -f create_admin.sql
--   (or paste the INSERT statement into pgAdmin / TablePlus / your client)
--
--   On Render: open the Postgres instance's "Connect" tab for the
--   psql command with your real credentials pre-filled.
--
-- LOGIN CREDENTIALS CREATED BY THIS SCRIPT
--   Email:    admin@medicharm.com
--   Password: Admin@123
--
-- ⚠️ IMPORTANT: Change this password immediately after your first
-- login. The password below is hashed with BCrypt already — never
-- store a plaintext password in this column.
--
-- WANT A DIFFERENT EMAIL/PASSWORD?
-- Generate your own BCrypt hash (60 characters, starts with $2a$/$2b$)
-- and swap it into the INSERT below. From the backend project root:
--   curl "http://localhost:8080/api/auth/hash?password=YourNewPassword"
-- (AuthController already exposes this /hash helper endpoint.)
-- =====================================================================

INSERT INTO users (
    name,
    email,
    password,
    role,
    enabled,
    account_non_locked,
    created_at,
    updated_at
) VALUES (
    'System Administrator',
    'admin@medicharm.com',
    '$2b$10$j/9O6zk7Nl1oc0WpnLVd..XJln4dcK6Y7DXckc8JR2xU3tgFZgWf6',
    'ADMIN',
    true,
    true,
    NOW(),
    NOW()
);

-- Sanity check: confirm the row was inserted with the ADMIN role.
SELECT id, name, email, role, enabled FROM users WHERE email = 'admin@medicharm.com';
