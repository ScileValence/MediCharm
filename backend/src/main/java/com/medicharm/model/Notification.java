package com.medicharm.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// An in-app notification for a patient or doctor. Identified by
// email + accountType rather than a foreign key to User/Doctor,
// mirroring the same pattern already used by PasswordResetToken —
// keeps this table independent of which of the two tables the
// recipient actually lives in, since a single notifications table
// covering both avoids two near-identical entities/repositories for
// the same concept.
@Entity
@Table(name = "notifications")
@Getter
@Setter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipientEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType recipientType;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    // Loosely typed on purpose (not an enum) — covers appointment,
    // order, and doctor-approval events today, and new event types
    // can be added later without a schema migration. Used on the
    // frontend only to pick an icon/color, never branched on
    // server-side.
    @Column(nullable = false)
    private String type;

    // Where clicking the notification should take the person, e.g.
    // "/appointment-history". Nullable — not every notification
    // needs to link anywhere.
    private String link;

    // Explicitly named "is_read", not "read" — close enough to
    // several MySQL 8 reserved keywords (READS, etc.) that leaving
    // Hibernate to default the column name to the bare word "read"
    // was a real, confirmed cause of every query against this table
    // failing with a 500 at runtime, even though the entity looked
    // completely fine in Java and the app started up without error.
    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
