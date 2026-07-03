package com.medicharm.service;

import com.medicharm.model.Medicine;
import com.medicharm.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class MedicineService {

    @Autowired
    private MedicineRepository repo;

    // ✅ Safe and null-free
    public @NonNull Medicine save(@NonNull Medicine m) {
        return Objects.requireNonNull(repo.save(m), "Failed to save medicine (repository returned null)");
    }

    public @NonNull List<Medicine> getAll() {
        return Objects.requireNonNull(repo.findAll(), "Repository returned null medicine list");
    }

    public Medicine getById(@NonNull Long id) {
        return repo.findById(id).orElse(null);
    }

    public void delete(@NonNull Long id) {
        repo.deleteById(id);
    }
}
