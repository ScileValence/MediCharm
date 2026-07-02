package com.medicharm.controller;

import com.medicharm.util.ErrorResponse;

import com.medicharm.model.Doctor;
import com.medicharm.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ===================== DASHBOARD =====================

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            return ResponseEntity.ok(adminService.getStats());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to load dashboard stats", e)
            );
        }
    }

    // ===================== DOCTORS =====================

    @PostMapping("/doctors")
    public ResponseEntity<?> createDoctor(@RequestBody Doctor doctor) {
        try {
            Doctor saved = adminService.createDoctor(doctor);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    ErrorResponse.of("Request failed", e)
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to create doctor", e)
            );
        }
    }

    // Generates a new temporary password for a doctor and returns it
    // in plaintext in the response — shown once to the admin so they
    // can relay it to the doctor directly. This bypasses email
    // entirely, which is the point: it works even with no SMTP
    // configured, as a fallback to the self-service forgot-password
    // flow.
    @PostMapping("/doctors/{id}/reset-password")
    public ResponseEntity<?> resetDoctorPassword(@PathVariable Long id) {
        try {
            String tempPassword = adminService.resetDoctorPassword(id);
            return ResponseEntity.ok(
                    Map.of(
                            "message", "Password reset successfully",
                            "temporaryPassword", tempPassword
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    ErrorResponse.of("Request failed", e)
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to reset doctor password", e)
            );
        }
    }

    // ===================== USERS =====================

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(adminService.getAllPatients());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to fetch users", e)
            );
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok(
                    Map.of("message", "User deleted successfully")
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to delete user", e)
            );
        }
    }

    // Same idea as the doctor version above — generates and returns
    // a plaintext temporary password for the admin to relay to the
    // patient directly.
    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetUserPassword(@PathVariable Long id) {
        try {
            String tempPassword = adminService.resetUserPassword(id);
            return ResponseEntity.ok(
                    Map.of(
                            "message", "Password reset successfully",
                            "temporaryPassword", tempPassword
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    ErrorResponse.of("Request failed", e)
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to reset user password", e)
            );
        }
    }

    // ===================== APPOINTMENTS =====================

    @GetMapping("/appointments")
    public ResponseEntity<?> getAllAppointments() {
        try {
            return ResponseEntity.ok(adminService.getAllAppointments());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to fetch appointments", e)
            );
        }
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.cancelAppointment(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to cancel appointment", e)
            );
        }
    }

    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        try {
            adminService.deleteAppointment(id);
            return ResponseEntity.ok(
                    Map.of("message", "Appointment deleted successfully")
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to delete appointment", e)
            );
        }
    }

    // ===================== ORDERS =====================

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        try {
            return ResponseEntity.ok(adminService.getAllOrders());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to fetch orders", e)
            );
        }
    }

    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.cancelOrder(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to cancel order", e)
            );
        }
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            adminService.deleteOrder(id);
            return ResponseEntity.ok(
                    Map.of("message", "Order deleted successfully")
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to delete order", e)
            );
        }
    }

    // ===================== REPORTS =====================

    @GetMapping("/reports")
    public ResponseEntity<?> getAllReports() {
        try {
            return ResponseEntity.ok(adminService.getAllReports());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to fetch reports", e)
            );
        }
    }

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        try {
            adminService.deleteReport(id);
            return ResponseEntity.ok(
                    Map.of("message", "Report deleted successfully")
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    ErrorResponse.of("Failed to delete report", e)
            );
        }
    }
}
