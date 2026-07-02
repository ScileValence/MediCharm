package com.medicharm.config;

import com.medicharm.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {


private final JwtAuthenticationFilter jwtAuthenticationFilter;

@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

@Bean
public AuthenticationManager authenticationManager(
        AuthenticationConfiguration configuration
) throws Exception {
    return configuration.getAuthenticationManager();
}

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

    http
            .csrf(csrf -> csrf.disable())

            .cors(Customizer.withDefaults())

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            .authorizeHttpRequests(auth -> auth

                    .requestMatchers(
                            "/swagger-ui/**",
                            "/v3/api-docs/**"
                    ).permitAll()

                    .requestMatchers(
                            "/api/auth/**"
                    ).permitAll()

                    .requestMatchers(
                            "/api/medicines/all",
                            "/api/doctors/all",
                            "/api/doctors/by-department/**",
                            "/api/doctors/departments",
                            "/api/doctors/available",
                            "/api/doctors/register"
                    ).permitAll()

                    .requestMatchers(
                            "/api/reports/file/**"
                    ).permitAll()

                    .requestMatchers(
                            "/api/admin/**"
                    ).hasRole("ADMIN")

                    // Doctor approval/rejection/suspension and deletion
                    // are admin-only management actions. These must be
                    // locked down explicitly because they share the
                    // /api/doctors/** prefix with the public browse
                    // endpoints listed above.
                    .requestMatchers(
                            "/api/doctors/approve/**",
                            "/api/doctors/reject/**",
                            "/api/doctors/suspend/**",
                            "/api/doctors/status/**"
                    ).hasRole("ADMIN")

                    // Doctor self-service profile management. These
                    // resolve identity from the JWT, not from a path
                    // parameter, so there's no id for one doctor to
                    // substitute to reach another doctor's record —
                    // restricting to ROLE_DOCTOR just keeps patients
                    // and admins from hitting "my profile" routes
                    // that don't apply to them.
                    .requestMatchers(
                            "/api/doctors/me",
                            "/api/doctors/password"
                    ).hasRole("DOCTOR")

                    .requestMatchers(
                            HttpMethod.DELETE,
                            "/api/doctors/**"
                    ).hasRole("ADMIN")

                    // Medicine catalog management (add/delete) is
                    // admin-only; browsing medicines stays public above.
                    .requestMatchers(
                            "/api/medicines/add"
                    ).hasRole("ADMIN")

                    .requestMatchers(
                            HttpMethod.DELETE,
                            "/api/medicines/**"
                    ).hasRole("ADMIN")

                    .requestMatchers(
                            "/api/doctor/**"
                    ).hasAnyRole(
                            "DOCTOR",
                            "ADMIN"
                    )

                    // Confirming, completing, or rejecting an
                    // appointment is a clinical decision that only the
                    // assigned doctor (or an admin) should be able to
                    // make. Scheduling and cancelling stay open to any
                    // authenticated user via the anyRequest() rule
                    // below, since patients need to do both of those.
                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/appointments/*/confirm",
                            "/api/appointments/*/complete",
                            "/api/appointments/*/reject"
                    ).hasAnyRole(
                            "DOCTOR",
                            "ADMIN"
                    )

                    .anyRequest().authenticated()
            )

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

    return http.build();
}


}
