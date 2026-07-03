package com.medicharm.repository;

import com.medicharm.model.Doctor;
import com.medicharm.model.DoctorStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Doctor> findByDeptIgnoreCase(String dept);

    List<Doctor> findByStatus(DoctorStatus status);

    List<Doctor> findByAvailableTrue();

    List<Doctor> findByDeptIgnoreCaseAndAvailableTrue(String dept);

    List<Doctor> findByStatusAndAvailableTrue(DoctorStatus status);
}