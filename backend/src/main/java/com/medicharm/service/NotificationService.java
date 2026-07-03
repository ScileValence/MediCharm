package com.medicharm.service;

import com.medicharm.model.AccountType;
import com.medicharm.model.Notification;
import com.medicharm.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // Generic creation method — every specific event (appointment
    // confirmed, order cancelled, doctor approved, etc.) goes through
    // this one method so there's a single place that actually writes
    // a Notification row.
    public Notification create(
            String recipientEmail,
            AccountType recipientType,
            String title,
            String message,
            String type,
            String link
    ) {

        Notification notification = new Notification();

        notification.setRecipientEmail(recipientEmail);
        notification.setRecipientType(recipientType);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setLink(link);

        return notificationRepository.save(notification);
    }

    // Failures here are deliberately swallowed by callers (see
    // NotificationHelper) rather than this method itself, so a
    // notification write failure can never block the actual
    // appointment/order/doctor action it's describing — the
    // notification is a side effect, not part of the core
    // transaction.
    public List<Notification> forRecipient(
            String email,
            AccountType type
    ) {
        return notificationRepository
                .findByRecipientEmailAndRecipientTypeOrderByCreatedAtDesc(
                        email, type
                );
    }

    public long unreadCount(String email, AccountType type) {
        return notificationRepository
                .countByRecipientEmailAndRecipientTypeAndReadFalse(
                        email, type
                );
    }

    // Only marks the notification read if the requesting email/type
    // actually matches its recipient — prevents one logged-in user
    // from marking another user's notification as read by guessing
    // IDs. Low-severity data (read status isn't sensitive), but the
    // same ownership discipline applied everywhere else in this app.
    public Notification markReadIfOwnedBy(
            Long id,
            String email,
            AccountType type
    ) {

        Notification notification = notificationRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found")
                );

        boolean owns = notification.getRecipientEmail().equalsIgnoreCase(email)
                && notification.getRecipientType() == type;

        if (!owns) {
            throw new RuntimeException("You are not authorized to update this notification");
        }

        notification.setRead(true);

        return notificationRepository.save(notification);
    }

    public void markAllRead(String email, AccountType type) {

        List<Notification> unread = notificationRepository
                .findByRecipientEmailAndRecipientTypeAndReadFalse(
                        email, type
                );

        unread.forEach(n -> n.setRead(true));

        notificationRepository.saveAll(unread);
    }
}
