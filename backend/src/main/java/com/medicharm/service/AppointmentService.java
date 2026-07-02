package com.medicharm.service;

import com.medicharm.model.Appointment;
import com.medicharm.model.AppointmentStatus;
import com.medicharm.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {


private final AppointmentRepository repo;

public Appointment save(Appointment appointment) {
    return repo.save(appointment);
}

public Appointment findById(Long id) {
    return repo.findById(id)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Appointment not found"
                    )
            );
}

public List<Appointment> getAllAppointments() {
    return repo.findAll();
}

public List<Appointment> forUser(Long userId) {
    return repo.findByUserId(userId)
            .stream()
            .filter(a ->
                    a.getStatus() != AppointmentStatus.CANCELLED
            )
            .toList();
}

// Unlike forUser(), this intentionally includes cancelled and
// rejected appointments too — it backs the patient-facing
// appointment history view, which is meant to show everything that
// ever happened, not just what's currently active.
public List<Appointment> fullHistoryForUser(Long userId) {
    return repo.findByUserIdOrderByAppointmentTimeDesc(userId);
}

public List<Appointment> forDoctor(Long doctorId) {
    return repo.findByDoctorId(doctorId)
            .stream()
            .filter(a ->
                    a.getStatus() != AppointmentStatus.CANCELLED
            )
            .toList();
}

public Appointment cancelAppointment(Long appointmentId) {

    Appointment appointment =
            repo.findById(appointmentId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Appointment not found"
                            )
                    );

    if (appointment.getStatus() == AppointmentStatus.COMPLETED
            || appointment.getStatus() == AppointmentStatus.REJECTED) {

        throw new RuntimeException(
                "Cannot cancel an appointment that is already "
                        + appointment.getStatus().name().toLowerCase()
        );
    }

    appointment.setStatus(
            AppointmentStatus.CANCELLED
    );

    return repo.save(appointment);
}

public Appointment confirmAppointment(Long appointmentId) {

    Appointment appointment =
            repo.findById(appointmentId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Appointment not found"
                            )
                    );

    appointment.setStatus(
            AppointmentStatus.CONFIRMED
    );

    return repo.save(appointment);
}

public Appointment completeAppointment(Long appointmentId) {

    Appointment appointment =
            repo.findById(appointmentId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Appointment not found"
                            )
                    );

    appointment.setStatus(
            AppointmentStatus.COMPLETED
    );

    return repo.save(appointment);
}

public Appointment rejectAppointment(Long appointmentId) {

    Appointment appointment =
            repo.findById(appointmentId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Appointment not found"
                            )
                    );

    appointment.setStatus(
            AppointmentStatus.REJECTED
    );

    return repo.save(appointment);
}


}
