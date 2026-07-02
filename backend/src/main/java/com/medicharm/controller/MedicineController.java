package com.medicharm.controller;

import com.medicharm.model.Medicine;
import com.medicharm.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    @Autowired
    private MedicineService medicineService;

    // ✅ Fetch all medicines
    @GetMapping("/all")
    public ResponseEntity<List<Medicine>> getAll() {
        return ResponseEntity.ok(medicineService.getAll());
    }

    // ✅ Add a new medicine
    @PostMapping("/add")
    public ResponseEntity<Medicine> addMedicine(@RequestBody @NonNull Medicine m) {
        Medicine saved = medicineService.save(m);
        return ResponseEntity.ok(saved);
    }

    // ✅ Fetch a single medicine by ID
    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getById(@PathVariable @NonNull Long id) {
        Medicine med = medicineService.getById(id);
        if (med == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(med);
    }

    // ✅ Delete a medicine by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable @NonNull Long id) {
        medicineService.delete(id);
        return ResponseEntity.ok().body("Medicine deleted successfully");
    }
}
