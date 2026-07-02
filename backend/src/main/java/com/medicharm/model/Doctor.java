package com.medicharm.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "doctors",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        }
)
@Getter
@Setter
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Doctor name is required")
    @Size(min = 2, max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @NotBlank(message = "Department is required")
    @Column(nullable = false)
    private String dept;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String availability;

    @Column(name = "consultation_fee")
    private Double consultationFee;

    @Column(length = 255)
    private String hospital;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(length = 150)
    private String specialization;

    @Column(length = 150)
    private String qualification;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DoctorStatus status = DoctorStatus.PENDING;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(nullable = false)
    private Boolean accountNonLocked = true;

    @Column(nullable = false)
    private Boolean enabled = true;

    @PrePersist
    protected void onCreate() {

        if (status == null) {
            status = DoctorStatus.PENDING;
        }

        if (available == null) {
            available = true;
        }

        if (enabled == null) {
            enabled = true;
        }

        if (accountNonLocked == null) {
            accountNonLocked = true;
        }
    }
}