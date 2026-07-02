package com.medicharm.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// CORS is configured centrally in CorsConfig (env-driven via app.allowed-origins).
// This class previously duplicated CORS setup with a hardcoded localhost origin,
// which could conflict with the CorsFilter bean in CorsConfig. Kept as a
// WebMvcConfigurer extension point for any future non-CORS MVC config.
@Configuration
public class WebConfig implements WebMvcConfigurer {
}
