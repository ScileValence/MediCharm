package com.medicharm.service;

import com.medicharm.model.Appointment;
import com.medicharm.model.AppointmentStatus;
import com.medicharm.model.Doctor;
import com.medicharm.model.DoctorStatus;
import com.medicharm.model.HealthReport;
import com.medicharm.model.Order;
import com.medicharm.model.Role;
import com.medicharm.model.User;
import com.medicharm.repository.AppointmentRepository;
import com.medicharm.repository.DoctorRepository;
import com.medicharm.repository.HealthReportRepository;
import com.medicharm.repository.OrderRepository;
import com.medicharm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    // Mirrors the upload directory used by ReportController so that
    // deleting a report from the admin dashboard also removes the
    // attachment from disk instead of leaving an orphaned file behind.
    private final Path uploadDir = Paths.get("uploads/reports");

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final OrderRepository orderRepository;
    private final HealthReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationHelper notificationHelper;

    // ===================== DASHBOARD STATS =====================

    public Map<String, Object> getStats() {

        Map<String, Object> stats = new LinkedHashMap<>();

        List<User> patients = userRepository.findByRole(Role.PATIENT);
        List<Doctor> doctors = doctorRepository.findAll();
        List<Appointment> appointments = appointmentRepository.findAll();
        List<Order> orders = orderRepository.findAll();
        List<HealthReport> reports = reportRepository.findAll();

        long pendingDoctors = doctors.stream()
                .filter(d -> d.getStatus() == DoctorStatus.PENDING)
                .count();

        long activeAppointments = appointments.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED)
                .count();

        long cancelledAppointments = appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                .count();

        long activeOrders = orders.stream()
                .filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()))
                .count();

        long cancelledOrders = orders.stream()
                .filter(o -> "CANCELLED".equalsIgnoreCase(o.getStatus()))
                .count();

        stats.put("totalPatients", patients.size());
        stats.put("totalDoctors", doctors.size());
        stats.put("pendingDoctors", pendingDoctors);
        stats.put("totalAppointments", appointments.size());
        stats.put("activeAppointments", activeAppointments);
        stats.put("cancelledAppointments", cancelledAppointments);
        stats.put("totalOrders", orders.size());
        stats.put("activeOrders", activeOrders);
        stats.put("cancelledOrders", cancelledOrders);
        stats.put("totalReports", reports.size());

        return stats;
    }

    // ===================== DOCTORS =====================

    // Doctors created directly by an admin are auto-approved, unlike
    // self-registration via /api/doctors/register which starts
    // PENDING and waits for admin review. An admin creating the
    // account themselves is already the approval step.
    public Doctor createDoctor(Doctor doctor) {

        if (doctorRepository.existsByEmail(doctor.getEmail())) {
            throw new RuntimeException(
                    "A doctor with this email already exists"
            );
        }

        doctor.setPassword(
                passwordEncoder.encode(doctor.getPassword())
        );

        doctor.setStatus(DoctorStatus.APPROVED);

        if (doctor.getAvailable() == null) {
            doctor.setAvailable(true);
        }

        return doctorRepository.save(doctor);
    }

    // Same fallback reset mechanism as resetUserPassword, for
    // doctors. Returns the plaintext temp password for the admin to
    // relay manually.
    public String resetDoctorPassword(Long id) {

        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found")
                );

        String tempPassword = generateTempPassword();

        doctor.setPassword(passwordEncoder.encode(tempPassword));

        doctorRepository.save(doctor);

        return tempPassword;
    }

    // Shared by both resetUserPassword and resetDoctorPassword.
    // Produces something readable enough to relay over the phone
    // (no ambiguous characters like 0/O or 1/l), 10 characters long.
    private String generateTempPassword() {

        String chars =
                "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

        java.security.SecureRandom random =
                new java.security.SecureRandom();

        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 10; i++) {
            sb.append(
                    chars.charAt(
                            random.nextInt(chars.length())
                    )
            );
        }

        return sb.toString();
    }

    // ===================== USERS =====================

    public List<User> getAllPatients() {
        return userRepository.findByRole(Role.PATIENT);
    }

    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // Hibernate's ddl-auto=update does not add ON DELETE CASCADE
        // at the database level for appointments or health reports, so
        // those rows must be removed explicitly before the user row
        // itself, or the delete will fail on a foreign key constraint.
        // Orders are removed via the cascading relationship already
        // declared on User.orders, so they are handled automatically.
        appointmentRepository.deleteAll(
                appointmentRepository.findByUserId(id)
        );

        reportRepository.deleteAll(
                reportRepository.findByUserId(id)
        );

        userRepository.delete(user);
    }

    // Generates a fresh temporary password for a patient and sets it
    // directly, bypassing email entirely. Returns the PLAINTEXT temp
    // password so the admin can relay it to the patient themselves
    // (phone, in person, etc.) — this is meant as a fallback for when
    // SMTP isn't configured or a patient can't access their email,
    // not a replacement for the self-service forgot-password flow.
    public String resetUserPassword(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        String tempPassword = generateTempPassword();

        user.setPassword(passwordEncoder.encode(tempPassword));

        userRepository.save(user);

        return tempPassword;
    }

    // ===================== APPOINTMENTS =====================

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment cancelAppointment(Long id) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Appointment not found")
                );

        if (appointment.getStatus() == AppointmentStatus.COMPLETED
                || appointment.getStatus() == AppointmentStatus.REJECTED) {

            throw new RuntimeException(
                    "Cannot cancel an appointment that is already "
                            + appointment.getStatus().name().toLowerCase()
            );
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);

        Appointment saved = appointmentRepository.save(appointment);

        // Admin-initiated cancellation — notify the patient using
        // the same "cancelled by someone else" phrasing as a
        // doctor-initiated cancel, since from the patient's
        // perspective the result is identical either way.
        notificationHelper.appointmentCancelled(saved, false);

        return saved;
    }

    public void deleteAppointment(Long id) {

        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found");
        }

        appointmentRepository.deleteById(id);
    }

    // ===================== ORDERS =====================

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order cancelOrder(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found")
                );

        order.setStatus("CANCELLED");

        Order saved = orderRepository.save(order);

        notificationHelper.orderCancelled(saved);

        return saved;
    }

    public void deleteOrder(Long id) {

        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Order not found");
        }

        orderRepository.deleteById(id);
    }

    // ===================== REPORTS =====================

    public List<HealthReport> getAllReports() {
        return reportRepository.findAll();
    }

    public void deleteReport(Long id) {

        HealthReport report = reportRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Report not found")
                );

        String filename = report.getReportFile();

        reportRepository.delete(report);

        if (filename != null && !filename.isBlank()) {

            try {

                Path file = uploadDir.resolve(filename);
                Files.deleteIfExists(file);

            } catch (IOException e) {
                // Deletion of the underlying DB record already
                // succeeded; a stray file on disk is logged but not
                // treated as a failure of the admin action.
                System.err.println(
                        "Warning: failed to delete report file '"
                                + filename + "': " + e.getMessage()
                );
            }
        }
    }
}
