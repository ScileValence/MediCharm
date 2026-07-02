package com.medicharm.controller;

import com.medicharm.util.ErrorResponse;

import com.medicharm.model.AccountType;
import com.medicharm.model.Doctor;
import com.medicharm.model.DoctorStatus;
import com.medicharm.model.User;
import com.medicharm.security.CustomUserDetailsService;
import com.medicharm.security.JwtUtil;
import com.medicharm.service.DoctorService;
import com.medicharm.service.PasswordResetService;
import com.medicharm.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {


@Autowired
private UserService userService;

@Autowired
private DoctorService doctorService;

@Autowired
private JwtUtil jwtUtil;

@Autowired
private PasswordEncoder passwordEncoder;

@Autowired
private CustomUserDetailsService userDetailsService;

@Autowired
private PasswordResetService passwordResetService;

@GetMapping("/ping")
public String ping() {
    System.out.println("PING ENDPOINT HIT");
    return "AUTH OK";
}

@GetMapping("/hash")
public String hashPassword(@RequestParam String password) {
    return passwordEncoder.encode(password);
}

// ==========================
// PATIENT SIGNUP
// ==========================
@PostMapping("/signup")
public ResponseEntity<?> signup(@RequestBody User user) {

    if (userService.findByEmail(user.getEmail()).isPresent()) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", "Email already exists"));
    }

    user.setPassword(
            passwordEncoder.encode(user.getPassword())
    );

    User savedUser = userService.register(user);

    UserDetails userDetails =
            userDetailsService.loadUserByUsername(
                    savedUser.getEmail()
            );

    String token =
            jwtUtil.generateToken(userDetails);

    return ResponseEntity.ok(
            Map.of(
                    "user", savedUser,
                    "token", token
            )
    );
}

// ==========================
// PATIENT LOGIN
// ==========================
@PostMapping("/login")
public ResponseEntity<?> login(
        @RequestBody Map<String, String> payload
) {

    String email = payload.get("email");
    String password = payload.get("password");

    User user = userService
            .findByEmail(email)
            .orElse(null);

    if (user == null) {
        return ResponseEntity.status(401)
                .body(Map.of(
                        "error",
                        "Invalid credentials"
                ));
    }

    if (!passwordEncoder.matches(
            password,
            user.getPassword()
    )) {

        return ResponseEntity.status(401)
                .body(Map.of(
                        "error",
                        "Invalid credentials"
                ));
    }

    UserDetails userDetails =
            userDetailsService.loadUserByUsername(
                    user.getEmail()
            );

    String token =
            jwtUtil.generateToken(userDetails);

    return ResponseEntity.ok(
            Map.of(
                    "user", user,
                    "token", token
            )
    );
}

// ==========================
// DOCTOR LOGIN
// ==========================
@PostMapping("/doctor/login")
public ResponseEntity<?> doctorLogin(
        @RequestBody Map<String, String> payload
) {

    String email = payload.get("email");
    String password = payload.get("password");

    System.out.println("========== DOCTOR LOGIN ==========");
    System.out.println("EMAIL = " + email);

    Doctor doctor = doctorService
            .findByEmail(email)
            .orElse(null);

    System.out.println("DOCTOR FOUND = " + (doctor != null));

    if (doctor == null) {
        return ResponseEntity.status(401)
                .body(Map.of(
                        "error",
                        "Doctor not found"
                ));
    }

    System.out.println("DB PASSWORD = " + doctor.getPassword());
    System.out.println("STATUS = " + doctor.getStatus());
    System.out.println("ENABLED = " + doctor.getEnabled());
    System.out.println("ACCOUNT NON LOCKED = " + doctor.getAccountNonLocked());

    boolean matches = passwordEncoder.matches(
            password,
            doctor.getPassword()
    );

    System.out.println("PASSWORD MATCHES = " + matches);

    if (doctor.getStatus() != DoctorStatus.APPROVED) {
        return ResponseEntity.status(403)
                .body(Map.of(
                        "error",
                        "Doctor account is not approved"
                ));
    }

    if (!matches) {
        return ResponseEntity.status(401)
                .body(Map.of(
                        "error",
                        "Invalid credentials"
                ));
    }

    UserDetails userDetails =
            userDetailsService.loadUserByUsername(
                    doctor.getEmail()
            );

    String token =
            jwtUtil.generateToken(userDetails);

    System.out.println("DOCTOR LOGIN SUCCESS");

    return ResponseEntity.ok(
            Map.of(
                    "doctor", doctor,
                    "token", token
            )
    );
}

// Accepts { "email": "...", "accountType": "PATIENT" | "DOCTOR" }.
// Always returns the same generic success message whether or not
// the email is actually registered — this is deliberate. Responding
// differently for "email not found" vs "email found, link sent"
// would let anyone probe which addresses have accounts just by
// submitting this form repeatedly.
@PostMapping("/forgot-password")
public ResponseEntity<?> forgotPassword(
        @RequestBody Map<String, String> payload
) {

    try {

        String email = payload.get("email");
        String accountTypeRaw = payload.get("accountType");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Email is required")
            );
        }

        AccountType accountType;

        try {
            accountType = AccountType.valueOf(
                    accountTypeRaw == null
                            ? "PATIENT"
                            : accountTypeRaw.toUpperCase()
            );
        } catch (IllegalArgumentException e) {
            accountType = AccountType.PATIENT;
        }

        passwordResetService.requestReset(
                email.trim(),
                accountType
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "If an account with that email exists, a password reset link has been sent."
                )
        );

    } catch (Exception e) {

        e.printStackTrace();

        // Even on an unexpected internal error, don't leak details —
        // still return the same generic message rather than a 500,
        // for the same enumeration-prevention reason as above.
        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "If an account with that email exists, a password reset link has been sent."
                )
        );
    }
}

// Accepts { "token": "...", "newPassword": "..." }. Unlike
// forgot-password, this one's errors ARE shown directly to the user
// (invalid/expired/already-used link, password too short) — at this
// point the person already has a token in hand from their email, so
// there's no enumeration risk left to protect against, and clear
// feedback here is actually useful.
@PostMapping("/reset-password")
public ResponseEntity<?> resetPassword(
        @RequestBody Map<String, String> payload
) {

    try {

        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Reset token is required")
            );
        }

        passwordResetService.resetPassword(token, newPassword);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Your password has been reset. You can now log in."
                )
        );

    } catch (RuntimeException e) {

        return ResponseEntity.badRequest().body(
                ErrorResponse.of("Request failed", e)
        );

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity.internalServerError().body(
                ErrorResponse.of("Failed to reset password", e)
        );
    }
}


}
