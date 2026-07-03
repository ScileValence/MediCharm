package com.medicharm.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        try {

            System.out.println(
                    "\n================ JWT FILTER ================"
            );

            System.out.println(
                    "REQUEST URI = "
                            + request.getRequestURI()
            );

            System.out.println(
                    "AUTH HEADER = "
                            + request.getHeader("Authorization")
            );

            String jwt = extractJwtFromRequest(request);

            System.out.println(
                    "JWT = " + jwt
            );

            if (jwt != null && jwtUtil.validateToken(jwt)) {

                String username =
                        jwtUtil.extractUsername(jwt);

                System.out.println(
                        "JWT USERNAME = "
                                + username
                );

                if (username != null
                        && SecurityContextHolder
                        .getContext()
                        .getAuthentication() == null) {

                    UserDetails userDetails =
                            userDetailsService
                                    .loadUserByUsername(
                                            username
                                    );

                    System.out.println(
                            "USER FOUND = "
                                    + userDetails.getUsername()
                    );

                    if (jwtUtil.validateToken(
                            jwt,
                            userDetails
                    )) {

                        System.out.println(
                                "TOKEN VALID"
                        );

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );

                        authentication.setDetails(
                                new WebAuthenticationDetailsSource()
                                        .buildDetails(request)
                        );

                        SecurityContextHolder
                                .getContext()
                                .setAuthentication(
                                        authentication
                                );

                        System.out.println(
                                "AUTHENTICATION SET"
                        );
                    }
                }
            } else {

                System.out.println(
                        "JWT IS NULL OR INVALID"
                );
            }

        } catch (Exception ex) {

            ex.printStackTrace();

            logger.error(
                    "JWT Authentication Error: "
                            + ex.getMessage()
            );
        }

        filterChain.doFilter(
                request,
                response
        );
    }

    private String extractJwtFromRequest(
            HttpServletRequest request
    ) {

        String bearerToken =
                request.getHeader(
                        "Authorization"
                );

        if (StringUtils.hasText(bearerToken)
                && bearerToken.startsWith(
                "Bearer "
        )) {

            return bearerToken.substring(7);
        }

        return null;
    }
}