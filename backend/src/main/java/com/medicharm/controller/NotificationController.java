package com.medicharm.controller;

import com.medicharm.util.ErrorResponse;

import com.medicharm.model.AccountType;
import com.medicharm.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Every endpoint here resolves "who is asking" from the JWT (via the
// injected Authentication parameter) and "are they a patient or a
// doctor" from their granted role, rather than taking either as a
// path/query parameter — same reasoning as ProfileController: there
// is no {userId}/{accountType} for a caller to spoof, so no separate
// ownership check is needed.
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private AccountType resolveAccountType(Authentication authentication) {
        boolean isDoctor = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_DOCTOR"));

        return isDoctor ? AccountType.DOCTOR : AccountType.PATIENT;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyNotifications(Authentication authentication) {
        try {
            String email = authentication.getName();
            AccountType type = resolveAccountType(authentication);

            return ResponseEntity.ok(
                    notificationService.forRecipient(email, type)
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to load notifications", e)
            );
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        try {
            String email = authentication.getName();
            AccountType type = resolveAccountType(authentication);

            long count = notificationService.unreadCount(email, type);

            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to load unread count", e)
            );
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            String email = authentication.getName();
            AccountType type = resolveAccountType(authentication);

            return ResponseEntity.ok(
                    notificationService.markReadIfOwnedBy(id, email, type)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ErrorResponse.of("Failed to mark notification as read", e));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to mark notification as read", e)
            );
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllRead(Authentication authentication) {
        try {
            String email = authentication.getName();
            AccountType type = resolveAccountType(authentication);

            notificationService.markAllRead(email, type);

            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to mark all as read", e)
            );
        }
    }
}
