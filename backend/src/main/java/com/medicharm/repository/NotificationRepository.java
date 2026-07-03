package com.medicharm.repository;

import com.medicharm.model.AccountType;
import com.medicharm.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientEmailAndRecipientTypeOrderByCreatedAtDesc(
            String recipientEmail,
            AccountType recipientType
    );

    long countByRecipientEmailAndRecipientTypeAndReadFalse(
            String recipientEmail,
            AccountType recipientType
    );

    List<Notification> findByRecipientEmailAndRecipientTypeAndReadFalse(
            String recipientEmail,
            AccountType recipientType
    );
}
