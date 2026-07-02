package com.medicharm.controller;

import com.medicharm.util.ErrorResponse;

import com.medicharm.model.Doctor;
import com.medicharm.model.DoctorStatus;
import com.medicharm.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final PasswordEncoder passwordEncoder;

    // Resolves the calling doctor from the JWT's email subject,
    // rather than trusting a path/body-supplied id — same pattern
    // used in ProfileController for patients. Means /me and
    // /password never need an id at all, so there's nothing for one
    // doctor to substitute to reach another doctor's record.
    private Doctor currentDoctor(Authentication authentication) {
        return doctorService
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found")
                );
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(
            Authentication authentication
    ) {

        try {
            return ResponseEntity.ok(currentDoctor(authentication));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to load profile", e)
            );
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @RequestBody Map<String, Object> payload,
            Authentication authentication
    ) {

        try {
            Doctor doctor = currentDoctor(authentication);

            // Email and status are intentionally excluded — email is
            // the login identifier, and status (approve/reject/
            // suspend) is an admin-only decision, not something a
            // doctor can grant themselves.
            if (payload.containsKey("name")) {
                String name = String.valueOf(payload.get("name")).trim();
                if (!name.isEmpty()) {
                    doctor.setName(name);
                }
            }

            if (payload.containsKey("phone")) {
                doctor.setPhone(
                        valueOrNull(payload.get("phone"))
                );
            }

            if (payload.containsKey("dept")) {
                String dept = valueOrNull(payload.get("dept"));
                if (dept != null) {
                    doctor.setDept(dept);
                }
            }

            if (payload.containsKey("qualification")) {
                doctor.setQualification(
                        valueOrNull(payload.get("qualification"))
                );
            }

            if (payload.containsKey("specialization")) {
                doctor.setSpecialization(
                        valueOrNull(payload.get("specialization"))
                );
            }

            if (payload.containsKey("hospital")) {
                doctor.setHospital(
                        valueOrNull(payload.get("hospital"))
                );
            }

            if (payload.containsKey("experienceYears")) {
                Object val = payload.get("experienceYears");
                doctor.setExperienceYears(
                        val == null ? null : Integer.valueOf(String.valueOf(val))
                );
            }

            if (payload.containsKey("consultationFee")) {
                Object val = payload.get("consultationFee");
                doctor.setConsultationFee(
                        val == null ? null : Double.valueOf(String.valueOf(val))
                );
            }

            if (payload.containsKey("available")) {
                Object val = payload.get("available");
                doctor.setAvailable(
                        val == null ? null : Boolean.valueOf(String.valueOf(val))
                );
            }

            Doctor saved = doctorService.saveDoctor(doctor);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to update profile", e)
            );
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changeMyPassword(
            @RequestBody Map<String, String> payload,
            Authentication authentication
    ) {

        try {
            Doctor doctor = currentDoctor(authentication);

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
                    doctor.getPassword()
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

            doctor.setPassword(
                    passwordEncoder.encode(newPassword)
            );

            doctorService.saveDoctor(doctor);

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

    private String valueOrNull(Object value) {
        if (value == null) return null;
        String str = String.valueOf(value).trim();
        return str.isEmpty() ? null : str;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(
                doctorService.getAllDoctors()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(
            @PathVariable Long id
    ) {
        return doctorService.getDoctorById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    @GetMapping("/by-department/{dept}")
    public ResponseEntity<List<Doctor>> getByDepartment(
            @PathVariable String dept
    ) {
        return ResponseEntity.ok(
                doctorService.getDoctorsByDepartment(dept)
        );
    }

    @GetMapping("/departments")
    public ResponseEntity<List<String>> getUniqueDepartments() {

        List<String> departments =
                doctorService.getAllDoctors()
                        .stream()
                        .map(Doctor::getDept)
                        .filter(dept -> dept != null && !dept.isBlank())
                        .distinct()
                        .sorted()
                        .toList();

        return ResponseEntity.ok(departments);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Doctor>> getAvailableDoctors() {
        return ResponseEntity.ok(
                doctorService.getAvailableDoctors()
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Doctor>> getDoctorsByStatus(
            @PathVariable DoctorStatus status
    ) {
        return ResponseEntity.ok(
                doctorService.getDoctorsByStatus(status)
        );
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerDoctor(
            @RequestBody Doctor doctor
    ) {

        if (doctorService.existsByEmail(doctor.getEmail())) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error",
                            "Doctor email already exists"
                    )
            );
        }

        // Without this, the raw password submitted at registration
        // was stored as-is, and login (which compares via
        // passwordEncoder.matches against a BCrypt hash) would always
        // fail for every self-registered doctor.
        doctor.setPassword(
                passwordEncoder.encode(doctor.getPassword())
        );

        doctor.setStatus(DoctorStatus.PENDING);

        Doctor savedDoctor =
                doctorService.saveDoctor(doctor);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Doctor registration submitted",
                        "doctor",
                        savedDoctor
                )
        );
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveDoctor(
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(
                    doctorService.approveDoctor(id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ErrorResponse.of("Failed to approve doctor", e));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ErrorResponse.of("Failed to approve doctor", e));
        }
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<?> rejectDoctor(
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(
                    doctorService.rejectDoctor(id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ErrorResponse.of("Failed to reject doctor", e));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ErrorResponse.of("Failed to reject doctor", e));
        }
    }

    @PutMapping("/suspend/{id}")
    public ResponseEntity<?> suspendDoctor(
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(
                    doctorService.suspendDoctor(id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ErrorResponse.of("Failed to suspend doctor", e));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ErrorResponse.of("Failed to suspend doctor", e));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(
            @PathVariable Long id
    ) {
        try {
            doctorService.deleteDoctor(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Doctor deleted successfully"
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ErrorResponse.of("Failed to delete doctor", e));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ErrorResponse.of("Failed to delete doctor", e));
        }
    }
}