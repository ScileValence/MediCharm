package com.medicharm.controller;

import com.medicharm.util.ErrorResponse;

import com.medicharm.model.User;
import com.medicharm.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Patient self-service profile management. Every endpoint here
// resolves "who am I" from the JWT (Authentication.getName() is the
// email subject) rather than taking an id/email as a path or body
// parameter — this sidesteps the whole class of "user A can edit
// user B's data" bug entirely, since there's no id for a caller to
// substitute in the first place.
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    private User currentUser(Authentication authentication) {
        return userService
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(
            Authentication authentication
    ) {

        try {
            return ResponseEntity.ok(currentUser(authentication));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to load profile", e)
            );
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> payload,
            Authentication authentication
    ) {

        try {
            User user = currentUser(authentication);

            String name = payload.get("name");

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Name cannot be empty")
                );
            }

            // Email is intentionally not editable here — it's the
            // login identifier and the JWT subject, and changing it
            // is out of scope for this self-service form.
            user.setName(name.trim());

            User saved = userService.register(user);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to update profile", e)
            );
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> payload,
            Authentication authentication
    ) {

        try {
            User user = currentUser(authentication);

            String currentPassword = payload.get("currentPassword");
            String newPassword = payload.get("newPassword");

            if (currentPassword == null || newPassword == null
                    || newPassword.trim().isEmpty()) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "error",
                                "Current and new password are required"
                        )
                );
            }

            if (!passwordEncoder.matches(
                    currentPassword,
                    user.getPassword()
            )) {

                return ResponseEntity.status(401).body(
                        Map.of(
                                "error",
                                "Current password is incorrect"
                        )
                );
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "error",
                                "New password must be at least 6 characters"
                        )
                );
            }

            user.setPassword(
                    passwordEncoder.encode(newPassword)
            );

            userService.register(user);

            return ResponseEntity.ok(
                    Map.of("message", "Password updated successfully")
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to update password", e)
            );
        }
    }
}
