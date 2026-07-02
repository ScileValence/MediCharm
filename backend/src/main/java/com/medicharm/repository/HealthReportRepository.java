// src/main/java/com/medicharm/repository/HealthReportRepository.java
package com.medicharm.repository;

import com.medicharm.model.HealthReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HealthReportRepository extends JpaRepository<HealthReport, Long> {
    List<HealthReport> findByUserId(Long userId);
}
