package com.medicharm.security;

import com.medicharm.model.Doctor;
import com.medicharm.model.User;
import com.medicharm.repository.DoctorRepository;
import com.medicharm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        // ===== PATIENT / ADMIN =====
        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            return new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPassword(),
                    user.getEnabled(),
                    true,
                    true,
                    user.getAccountNonLocked(),
                    Collections.singletonList(
                            new SimpleGrantedAuthority(
                                    "ROLE_" + user.getRole().name()
                            )
                    )
            );
        }

        // ===== DOCTOR =====
        Doctor doctor = doctorRepository.findByEmail(email).orElse(null);

        if (doctor != null) {

            return new org.springframework.security.core.userdetails.User(
                    doctor.getEmail(),
                    doctor.getPassword(),
                    doctor.getEnabled(),
                    true,
                    true,
                    doctor.getAccountNonLocked(),
                    Collections.singletonList(
                            new SimpleGrantedAuthority("ROLE_DOCTOR")
                    )
            );
        }

        throw new UsernameNotFoundException(
                "User/Doctor not found with email: " + email
        );
    }
}