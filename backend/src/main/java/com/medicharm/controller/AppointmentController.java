package com.medicharm.controller;

import com.medicharm.util.ErrorResponse;

import com.medicharm.model.Appointment;
import com.medicharm.model.AppointmentStatus;
import com.medicharm.model.Doctor;
import com.medicharm.model.User;
import com.medicharm.repository.DoctorRepository;
import com.medicharm.repository.UserRepository;
import com.medicharm.service.AppointmentService;
import com.medicharm.service.NotificationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {


private final AppointmentService appointmentService;
private final UserRepository userRepository;
private final DoctorRepository doctorRepository;
private final NotificationHelper notificationHelper;

// Returns true if the currently authenticated principal is an
// admin, OR is the doctor actually assigned to this appointment.
// Used to guard confirm/complete/reject so one doctor can't act on
// another doctor's appointments just because they both hold
// ROLE_DOCTOR. Admins bypass this check entirely, matching the
// existing hasAnyRole("DOCTOR", "ADMIN") rule in SecurityConfig.
private boolean canManage(
        Authentication authentication,
        Appointment appointment
) {

    boolean isAdmin = authentication.getAuthorities()
            .stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(a -> a.equals("ROLE_ADMIN"));

    if (isAdmin) {
        return true;
    }

    if (appointment.getDoctor() == null) {
        return false;
    }

    String email = authentication.getName();

    Doctor doctor =
            doctorRepository
                    .findByEmail(email)
                    .orElse(null);

    return doctor != null
            && doctor.getId().equals(
                    appointment.getDoctor().getId()
            );
}

// Returns true if the currently authenticated principal is an
// admin, OR is the patient identified by userId. Used to guard the
// patient-facing appointment endpoints below so one logged-in
// patient can't read another patient's appointment data just by
// guessing/incrementing a userId in the URL.
private boolean canViewUserData(
        Authentication authentication,
        Long userId
) {

    boolean isAdmin = authentication.getAuthorities()
            .stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(a -> a.equals("ROLE_ADMIN"));

    if (isAdmin) {
        return true;
    }

    String email = authentication.getName();

    User user =
            userRepository
                    .findByEmail(email)
                    .orElse(null);

    return user != null && user.getId().equals(userId);
}

@GetMapping("/test")
public String test() {
    return "APPOINTMENT TEST OK";
}

@PostMapping("/schedule")
public ResponseEntity<?> schedule(
        @RequestBody Map<String, String> body
) {

    try {

        Long userId =
                Long.parseLong(
                        body.get("userId")
                );

        String dept =
                body.get("department");

        String doctorName =
                body.get("doctor");

        String date =
                body.get("date");

        String time =
                body.get("time");

        String description =
                body.getOrDefault(
                        "description",
                        ""
                );

        User user =
                userRepository
                        .findById(userId)
                        .orElse(null);

        if (user == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    "Invalid user"
                            )
                    );
        }

        Doctor doctor =
                doctorRepository
                        .findByDeptIgnoreCase(dept)
                        .stream()
                        .filter(
                                d ->
                                        d.getName()
                                                .equalsIgnoreCase(
                                                        doctorName
                                                )
                        )
                        .findFirst()
                        .orElse(null);

        if (doctor == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    "Doctor not found"
                            )
                    );
        }

        Appointment appointment =
                new Appointment();

        appointment.setUser(user);
        appointment.setDoctor(doctor);
        appointment.setDept(dept);

        appointment.setAppointmentTime(
                LocalDateTime.parse(
                        date + "T" + time
                )
        );

        appointment.setNotes(description);

        appointment.setStatus(
                AppointmentStatus.PENDING
        );

        Appointment saved =
                appointmentService.save(
                        appointment
                );

        notificationHelper.appointmentScheduled(saved);

        return ResponseEntity.ok(saved);

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity
                .internalServerError()
                .body(
                        ErrorResponse.of("Failed to schedule appointment", e)
                );
    }
}

@GetMapping("/user/{userId}")
public ResponseEntity<?> getUserAppointments(
        @PathVariable Long userId,
        Authentication authentication
) {

    try {

        if (!canViewUserData(authentication, userId)) {

            return ResponseEntity
                    .status(403)
                    .body(
                            Map.of(
                                    "error",
                                    "You are not authorized to view these appointments"
                            )
                    );
        }

        return ResponseEntity.ok(
                appointmentService.forUser(
                        userId
                )
        );

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity
                .internalServerError()
                .body(
                        ErrorResponse.of("Failed to fetch appointments", e)
                );
    }
}

@GetMapping("/user/{userId}/history")
public ResponseEntity<?> getUserAppointmentHistory(
        @PathVariable Long userId,
        Authentication authentication
) {

    try {

        if (!canViewUserData(authentication, userId)) {

            return ResponseEntity
                    .status(403)
                    .body(
                            Map.of(
                                    "error",
                                    "You are not authorized to view this appointment history"
                            )
                    );
        }

        return ResponseEntity.ok(
                appointmentService.fullHistoryForUser(
                        userId
                )
        );

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity
                .internalServerError()
                .body(
                        ErrorResponse.of("Failed to fetch appointment history", e)
                );
    }
}

@GetMapping("/doctor/{doctorId}")
public ResponseEntity<?> getDoctorAppointments(
        @PathVariable Long doctorId
) {

    try {

        return ResponseEntity.ok(
                appointmentService.forDoctor(
                        doctorId
                )
        );

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity
                .internalServerError()
                .body(
                        ErrorResponse.of("Failed to fetch doctor appointments", e)
                );
    }
}

@GetMapping("/{id}")
public ResponseEntity<?> getAppointmentById(
        @PathVariable Long id
) {

    try {

        Appointment appointment =
                appointmentService
                        .findById(id);

        return ResponseEntity.ok(
                appointment
        );

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity
                .internalServerError()
                .body(
                        ErrorResponse.of("Failed to fetch appointment", e)
                );
    }
}

@PutMapping("/{id}/cancel")
public ResponseEntity<?> cancelAppointment(
        @PathVariable Long id,
        Authentication authentication
) {

    try {

        Appointment updated =
                appointmentService
                        .cancelAppointment(id);

        boolean cancelledByDoctor = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));

        notificationHelper.appointmentCancelled(updated, !cancelledByDoctor);

        return ResponseEntity.ok(updated);

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity
                .internalServerError()
                .body(
                        ErrorResponse.of("Failed to cancel appointment", e)
                );
    }
}

@PutMapping("/{id}/confirm")
public ResponseEntity<?> confirmAppointment(
        @PathVariable Long id,
        Authentication authentication
) {

    try {

        Appointment appointment =
                appointmentService.findById(id);

        if (!canManage(authentication, appointment)) {

            return ResponseEntity
                    .status(403)
                    .body(
                            Map.of(
                                    "error",
                                    "You are not authorized to act on this appointment"
                            )
                    );
        }

        Appointment updated =
                appointmentService
                        .confirmAppointment(id);

        notificationHelper.appointmentConfirmed(updated);

        return ResponseEntity.ok(updated);

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity
                .internalServerError()
                .body(
                        ErrorResponse.of("Failed to confirm appointment", e)
                );
    }
}

@PutMapping("/{id}/complete")
public ResponseEntity<?> completeAppointment(
        @PathVariable Long id,
        Authentication authentication
) {

    try {

        Appointment appointment =
                appointmentService.findById(id);

        if (!canManage(authentication, appointment)) {

            return ResponseEntity
                    .status(403)
                    .body(
                            Map.of(
                                    "error",
                                    "You are not authorized to act on this appointment"
                            )
                    );
        }

        Appointment updated =
                appointmentService
                        .completeAppointment(id);

        notificationHelper.appointmentCompleted(updated);

        return ResponseEntity.ok(updated);

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity
                .internalServerError()
                .body(
                        ErrorResponse.of("Failed to complete appointment", e)
                );
    }
}

@PutMapping("/{id}/reject")
public ResponseEntity<?> rejectAppointment(
        @PathVariable Long id,
        Authentication authentication
) {

    try {

        Appointment appointment =
                appointmentService.findById(id);

        if (!canManage(authentication, appointment)) {

            return ResponseEntity
                    .status(403)
                    .body(
                            Map.of(
                                    "error",
                                    "You are not authorized to act on this appointment"
                            )
                    );
        }

        Appointment updated =
                appointmentService
                        .rejectAppointment(id);

        notificationHelper.appointmentRejected(updated);

        return ResponseEntity.ok(updated);

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity
                .internalServerError()
                .body(
                        ErrorResponse.of("Failed to reject appointment", e)
                );
    }
}


}
