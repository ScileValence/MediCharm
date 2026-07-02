package com.medicharm.repository;

import com.medicharm.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
  List<Medicine> findByNameContainingIgnoreCase(String q);
}
