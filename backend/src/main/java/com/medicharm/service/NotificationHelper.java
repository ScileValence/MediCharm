package com.medicharm.service;

import com.medicharm.model.AccountType;
import com.medicharm.model.Appointment;
import com.medicharm.model.Doctor;
import com.medicharm.model.HealthReport;
import com.medicharm.model.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class NotificationHelper {

    private static final DateTimeFormatter WHEN_FORMAT =
            DateTimeFormatter.ofPattern("MMM d, yyyy 'at' h:mm a");

    private final NotificationService notificationService;

    private void safeCreate(
            String email,
            AccountType type,
            String title,
            String message,
            String eventType,
            String link
    ) {
        try {
            notificationService.create(email, type, title, message, eventType, link);
        } catch (Exception e) {
            System.err.println(
                    "Failed to create notification for " + email + ": " + e.getMessage()
            );
        }
    }

    private String doctorName(Appointment appt) {
        return appt.getDoctor() != null ? appt.getDoctor().getName() : "your doctor";
    }

    private String patientName(Appointment appt) {
        return appt.getUser() != null ? appt.getUser().getName() : "the patient";
    }

    private String when(Appointment appt) {
        return appt.getAppointmentTime() != null
                ? appt.getAppointmentTime().format(WHEN_FORMAT)
                : "the scheduled time";
    }

    // ===================== APPOINTMENTS =====================

    public void appointmentScheduled(Appointment appt) {
        try {
            if (appt.getDoctor() == null || appt.getDoctor().getEmail() == null) return;

            safeCreate(
                    appt.getDoctor().getEmail(),
                    AccountType.DOCTOR,
                    "New appointment request",
                    patientName(appt) + " requested an appointment on " + when(appt) + ".",
                    "APPOINTMENT_REQUESTED",
                    "/doctor-dashboard"
            );
        } catch (Exception e) {
            System.err.println("appointmentScheduled notification failed: " + e);
        }
    }

    public void appointmentConfirmed(Appointment appt) {
        try {
            if (appt.getUser() == null || appt.getUser().getEmail() == null) return;

            safeCreate(
                    appt.getUser().getEmail(),
                    AccountType.PATIENT,
                    "Appointment confirmed",
                    doctorName(appt) + " confirmed your appointment on " + when(appt) + ".",
                    "APPOINTMENT_CONFIRMED",
                    "/appointment-history"
            );
        } catch (Exception e) {
            System.err.println("appointmentConfirmed notification failed: " + e);
        }
    }

    public void appointmentRejected(Appointment appt) {
        try {
            if (appt.getUser() == null || appt.getUser().getEmail() == null) return;

            safeCreate(
                    appt.getUser().getEmail(),
                    AccountType.PATIENT,
                    "Appointment declined",
                    doctorName(appt) + " was unable to accept your appointment request for "
                            + when(appt) + ". Please book another time.",
                    "APPOINTMENT_REJECTED",
                    "/appointment-history"
            );
        } catch (Exception e) {
            System.err.println("appointmentRejected notification failed: " + e);
        }
    }

    public void appointmentCompleted(Appointment appt) {
        try {
            if (appt.getUser() == null || appt.getUser().getEmail() == null) return;

            safeCreate(
                    appt.getUser().getEmail(),
                    AccountType.PATIENT,
                    "Appointment completed",
                    "Your appointment with " + doctorName(appt) + " has been marked completed. "
                            + "Check your reports for any notes.",
                    "APPOINTMENT_COMPLETED",
                    "/reports"
            );
        } catch (Exception e) {
            System.err.println("appointmentCompleted notification failed: " + e);
        }
    }

    public void appointmentCancelled(Appointment appt, boolean cancelledByPatient) {
        try {
            if (cancelledByPatient) {
                if (appt.getDoctor() == null || appt.getDoctor().getEmail() == null) return;

                safeCreate(
                        appt.getDoctor().getEmail(),
                        AccountType.DOCTOR,
                        "Appointment cancelled",
                        patientName(appt) + " cancelled their appointment scheduled for " + when(appt) + ".",
                        "APPOINTMENT_CANCELLED",
                        "/doctor-dashboard"
                );
            } else {
                if (appt.getUser() == null || appt.getUser().getEmail() == null) return;

                safeCreate(
                        appt.getUser().getEmail(),
                        AccountType.PATIENT,
                        "Appointment cancelled",
                        "Your appointment with " + doctorName(appt) + " on " + when(appt)
                                + " has been cancelled.",
                        "APPOINTMENT_CANCELLED",
                        "/appointment-history"
                );
            }
        } catch (Exception e) {
            System.err.println("appointmentCancelled notification failed: " + e);
        }
    }

    // ===================== ORDERS =====================

    public void orderPlaced(Order order) {
        try {
            if (order.getUser() == null || order.getUser().getEmail() == null) return;

            safeCreate(
                    order.getUser().getEmail(),
                    AccountType.PATIENT,
                    "Order placed",
                    "Your medicine order #" + order.getId() + " has been placed successfully.",
                    "ORDER_PLACED",
                    "/order-history"
            );
        } catch (Exception e) {
            System.err.println("orderPlaced notification failed: " + e);
        }
    }

    public void orderCancelled(Order order) {
        try {
            if (order.getUser() == null || order.getUser().getEmail() == null) return;

            safeCreate(
                    order.getUser().getEmail(),
                    AccountType.PATIENT,
                    "Order cancelled",
                    "Your medicine order #" + order.getId() + " has been cancelled.",
                    "ORDER_CANCELLED",
                    "/order-history"
            );
        } catch (Exception e) {
            System.err.println("orderCancelled notification failed: " + e);
        }
    }

    // ===================== REPORTS =====================

    public void reportAdded(HealthReport report) {
        try {
            if (report.getUser() == null || report.getUser().getEmail() == null) return;

            String doctorPart = report.getDoctorName() != null
                    ? report.getDoctorName()
                    : "your doctor";

            safeCreate(
                    report.getUser().getEmail(),
                    AccountType.PATIENT,
                    "New medical report",
                    doctorPart + " added a new report to your medical records.",
                    "REPORT_ADDED",
                    "/reports"
            );
        } catch (Exception e) {
            System.err.println("reportAdded notification failed: " + e);
        }
    }

    // ===================== DOCTOR ACCOUNT =====================

    public void doctorApproved(Doctor doctor) {
        try {
            if (doctor.getEmail() == null) return;

            safeCreate(
                    doctor.getEmail(),
                    AccountType.DOCTOR,
                    "Application approved",
                    "Welcome aboard! Your MediCharm doctor account has been approved. You can now log in and manage appointments.",
                    "DOCTOR_APPROVED",
                    "/doctor-dashboard"
            );
        } catch (Exception e) {
            System.err.println("doctorApproved notification failed: " + e);
        }
    }

    public void doctorRejected(Doctor doctor) {
        try {
            if (doctor.getEmail() == null) return;

            safeCreate(
                    doctor.getEmail(),
                    AccountType.DOCTOR,
                    "Application not approved",
                    "Your MediCharm doctor application was not approved at this time.",
                    "DOCTOR_REJECTED",
                    null
            );
        } catch (Exception e) {
            System.err.println("doctorRejected notification failed: " + e);
        }
    }

    public void doctorSuspended(Doctor doctor) {
        try {
            if (doctor.getEmail() == null) return;

            safeCreate(
                    doctor.getEmail(),
                    AccountType.DOCTOR,
                    "Account suspended",
                    "Your MediCharm doctor account has been suspended. Please contact support for details.",
                    "DOCTOR_SUSPENDED",
                    null
            );
        } catch (Exception e) {
            System.err.println("doctorSuspended notification failed: " + e);
        }
    }
}
