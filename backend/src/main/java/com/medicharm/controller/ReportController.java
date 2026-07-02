package com.medicharm.controller;

import com.medicharm.util.ErrorResponse;

import com.medicharm.model.Appointment;
import com.medicharm.model.Doctor;
import com.medicharm.model.HealthReport;
import com.medicharm.model.User;
import com.medicharm.repository.AppointmentRepository;
import com.medicharm.repository.DoctorRepository;
import com.medicharm.repository.HealthReportRepository;
import com.medicharm.repository.UserRepository;
import com.medicharm.service.NotificationHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {


private final Path uploadDir = Paths.get("uploads/reports");

@Autowired
private HealthReportRepository reportRepo;

@Autowired
private UserRepository userRepo;

@Autowired
private DoctorRepository doctorRepo;

@Autowired
private AppointmentRepository apptRepo;

@Autowired
private NotificationHelper notificationHelper;

// Returns true if the currently authenticated principal is an
// admin or doctor, OR is the patient identified by userId.
// Doctors are allowed through since they legitimately create and
// review reports for patients who aren't themselves; patients are
// restricted to their own records, same as the equivalent checks
// added to AppointmentController and OrderController.
private boolean canViewUserData(
        Authentication authentication,
        Long userId
) {

    boolean isAdminOrDoctor = authentication.getAuthorities()
            .stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(a ->
                    a.equals("ROLE_ADMIN") || a.equals("ROLE_DOCTOR")
            );

    if (isAdminOrDoctor) {
        return true;
    }

    User user = userRepo.findByEmail(
            authentication.getName()
    ).orElse(null);

    return user != null && user.getId().equals(userId);
}

@PostMapping(
        value = "/upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
)
public ResponseEntity<?> uploadReport(
        @RequestParam(required = false) Long appointmentId,
        @RequestParam(required = false) Long userId,
        @RequestParam(required = false) Long doctorId,
        @RequestParam(required = false) String text,
        @RequestParam(required = false) String comments,
        @RequestPart(required = false) MultipartFile file
) {

    try {

        System.out.println("===== REPORT UPLOAD =====");
        System.out.println("appointmentId = " + appointmentId);
        System.out.println("userId = " + userId);
        System.out.println("doctorId = " + doctorId);
        System.out.println("text = " + text);
        System.out.println("comments = " + comments);

        if (file != null) {
            System.out.println("file = " + file.getOriginalFilename());
        } else {
            System.out.println("file = NULL");
        }

        User user = null;
        Doctor doctor = null;

        if (appointmentId != null) {

            Appointment appt = apptRepo.findById(appointmentId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Appointment not found"
                            )
                    );

            user = appt.getUser();
            doctor = appt.getDoctor();
        }

        if (user == null && userId != null) {

            user = userRepo.findById(userId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "User not found"
                            )
                    );
        }

        if (doctor == null && doctorId != null) {

            doctor = doctorRepo.findById(doctorId)
                    .orElse(null);
        }

        if (user == null) {
            throw new RuntimeException(
                    "User not found for this report"
            );
        }

        HealthReport report = new HealthReport();

        report.setUser(user);
        report.setReportText(
                text != null ? text : ""
        );

        report.setComments(
                comments != null ? comments : ""
        );

        report.setCreatedAt(
                LocalDateTime.now()
        );

        if (doctor != null) {

            report.setDoctorName(
                    doctor.getName()
            );

            report.setDepartment(
                    doctor.getDept()
            );
        }

        if (file != null && !file.isEmpty()) {

            Files.createDirectories(
                    uploadDir
            );

            String filename =
                    System.currentTimeMillis()
                            + "_"
                            + file.getOriginalFilename();

            Path destination =
                    uploadDir.resolve(
                            filename
                    );

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            report.setReportFile(
                    filename
            );

            System.out.println(
                    "FILE SAVED = " + filename
            );
        }

        HealthReport saved =
                reportRepo.save(report);

        notificationHelper.reportAdded(saved);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Report uploaded successfully",
                        "reportId",
                        saved.getId()
                )
        );

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity.internalServerError()
                .body(
                        ErrorResponse.of("Failed to upload report", e)
                );
    }
}

@GetMapping("/user/{userId}")
public ResponseEntity<?> getReports(
        @PathVariable Long userId,
        Authentication authentication
) {

    if (!canViewUserData(authentication, userId)) {

        return ResponseEntity
                .status(403)
                .body(
                        Map.of(
                                "error",
                                "You are not authorized to view these reports"
                        )
                );
    }

    List<HealthReport> reports =
            reportRepo.findByUserId(userId);

    reports.sort(
            (a, b) ->
                    b.getCreatedAt()
                            .compareTo(
                                    a.getCreatedAt()
                            )
    );

    return ResponseEntity.ok(reports);
}

@GetMapping("/file/{filename:.+}")
public ResponseEntity<Resource> getFile(
        @PathVariable String filename
) {

    try {

        Path file =
                uploadDir.resolve(filename);

        Resource resource =
                new UrlResource(
                        file.toUri()
                );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                filename +
                                "\""
                )
                .body(resource);

    } catch (MalformedURLException e) {

        return ResponseEntity.notFound()
                .build();
    }
}


}
