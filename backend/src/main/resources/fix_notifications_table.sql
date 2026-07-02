-- Run this once against your database, then restart the backend.
-- The notifications table was originally created with a column
-- literally named "read", which is suspiciously close to several
-- MySQL 8 reserved keywords and was causing every query against
-- this table to fail with a 500 error. The column has been renamed
-- to "is_read" in the entity. Since Hibernate's ddl-auto=update only
-- ADDS new columns, it will not rename the existing one — drop the
-- table so Hibernate recreates it correctly on next startup.

DROP TABLE IF EXISTS notifications;
