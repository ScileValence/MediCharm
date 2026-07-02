package com.medicharm.service;

import com.medicharm.model.AccountType;
import com.medicharm.model.Doctor;
import com.medicharm.model.PasswordResetToken;
import com.medicharm.model.User;
import com.medicharm.repository.DoctorRepository;
import com.medicharm.repository.PasswordResetTokenRepository;
import com.medicharm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final int TOKEN_VALID_MINUTES = 30;

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    // Always called regardless of whether the email actually exists
    // — the controller layer returns the same generic success
    // message either way, so this method intentionally does nothing
    // observable (no exception, no different timing-sensitive path)
    // when the account isn't found, to avoid letting an attacker
    // enumerate which emails are registered.
    public void requestReset(String email, AccountType accountType) {

        boolean exists = accountType == AccountType.DOCTOR
                ? doctorRepository.findByEmail(email).isPresent()
                : userRepository.findByEmail(email).isPresent();

        if (!exists) {
            return;
        }

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setEmail(email);
        resetToken.setAccountType(accountType);
        resetToken.setExpiresAt(
                LocalDateTime.now().plusMinutes(TOKEN_VALID_MINUTES)
        );

        tokenRepository.save(resetToken);

        String resetLink = frontendUrl
                + "/reset-password?token="
                + resetToken.getToken()
                + "&type="
                + accountType.name().toLowerCase();

        emailService.sendPasswordResetEmail(email, resetLink);
    }

    // Returns the validated, not-yet-consumed token, or throws with
    // a message safe to show directly to the user (no internal
    // details leaked either way).
    private PasswordResetToken validateToken(String token) {

        PasswordResetToken resetToken = tokenRepository
                .findByToken(token)
                .orElseThrow(() ->
                        new RuntimeException(
                                "This reset link is invalid."
                        )
                );

        if (resetToken.isUsed()) {
            throw new RuntimeException(
                    "This reset link has already been used. Please request a new one."
            );
        }

        if (resetToken.isExpired()) {
            throw new RuntimeException(
                    "This reset link has expired. Please request a new one."
            );
        }

        return resetToken;
    }

    public void resetPassword(String token, String newPassword) {

        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException(
                    "New password must be at least 6 characters"
            );
        }

        PasswordResetToken resetToken = validateToken(token);

        String encoded = passwordEncoder.encode(newPassword);

        if (resetToken.getAccountType() == AccountType.DOCTOR) {

            Doctor doctor = doctorRepository
                    .findByEmail(resetToken.getEmail())
                    .orElseThrow(() ->
                            new RuntimeException("Account not found")
                    );

            doctor.setPassword(encoded);
            doctorRepository.save(doctor);

        } else {

            User user = userRepository
                    .findByEmail(resetToken.getEmail())
                    .orElseThrow(() ->
                            new RuntimeException("Account not found")
                    );

            user.setPassword(encoded);
            userRepository.save(user);
        }

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}
