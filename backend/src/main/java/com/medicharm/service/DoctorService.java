package com.medicharm.service;

import com.medicharm.model.Doctor;
import com.medicharm.model.DoctorStatus;
import com.medicharm.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final NotificationHelper notificationHelper;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public Optional<Doctor> findByEmail(String email) {
        return doctorRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return doctorRepository.existsByEmail(email);
    }

    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }

    public List<Doctor> getDoctorsByDepartment(String dept) {
        return doctorRepository.findByDeptIgnoreCase(dept);
    }

    public List<Doctor> getAvailableDoctors() {
        return doctorRepository.findByAvailableTrue();
    }

    public List<Doctor> getDoctorsByStatus(DoctorStatus status) {
        return doctorRepository.findByStatus(status);
    }

    public Doctor approveDoctor(Long id) {

        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setStatus(DoctorStatus.APPROVED);

        Doctor saved = doctorRepository.save(doctor);

        notificationHelper.doctorApproved(saved);

        return saved;
    }

    public Doctor rejectDoctor(Long id) {

        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setStatus(DoctorStatus.REJECTED);

        Doctor saved = doctorRepository.save(doctor);

        notificationHelper.doctorRejected(saved);

        return saved;
    }

    public Doctor suspendDoctor(Long id) {

        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setStatus(DoctorStatus.SUSPENDED);

        Doctor saved = doctorRepository.save(doctor);

        notificationHelper.doctorSuspended(saved);

        return saved;
    }
}