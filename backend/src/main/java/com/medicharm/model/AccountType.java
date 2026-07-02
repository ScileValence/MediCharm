package com.medicharm.model;

// Which table a PasswordResetToken applies to. Admins reset via the
// same PATIENT path since an admin account is just a User row with
// role = ADMIN — there's no separate admin table to distinguish.
public enum AccountType {
    PATIENT,
    DOCTOR
}
