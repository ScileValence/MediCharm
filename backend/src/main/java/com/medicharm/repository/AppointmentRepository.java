package com.medicharm.repository;

import com.medicharm.model.Appointment;
import com.medicharm.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByUserId(Long userId);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByStatus(AppointmentStatus status);

    List<Appointment> findByUserIdOrderByAppointmentTimeDesc(Long userId);

    List<Appointment> findByDoctorIdOrderByAppointmentTimeDesc(Long doctorId);

    List<Appointment> findByDoctorIdAndStatus(
            Long doctorId,
            AppointmentStatus status
    );

    List<Appointment> findByUserIdAndStatus(
            Long userId,
            AppointmentStatus status
    );

    List<Appointment> findByAppointmentTimeBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    boolean existsByDoctorIdAndAppointmentTime(
            Long doctorId,
            LocalDateTime appointmentTime
    );
}