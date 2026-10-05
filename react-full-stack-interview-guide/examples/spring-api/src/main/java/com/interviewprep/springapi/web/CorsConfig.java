package com.interviewprep.springapi.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// WebMvcConfigurer rather than a CorsConfigurationSource bean: there is no Spring Security filter
// chain to consume such a bean, so MVC's own handler-mapping CORS processing is the only consumer.
// Switch to a CorsConfigurationSource once Spring Security is added, otherwise the security filter
// would reject preflights before MVC ever sees them.
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private static final String API_PATH_PATTERN = "/api/**";
    // Exact origin, not a pattern: credentials are allowed, and the CORS spec forbids pairing them
    // with a wildcard, which would also let any site act with the user's cookies.
    private static final String DEV_CLIENT_ORIGIN = "http://localhost:5173";
    // Only the methods the API serves; anything else (e.g. DELETE) is rejected at preflight.
    private static final String[] ALLOWED_METHODS = {
        HttpMethod.GET.name(), HttpMethod.POST.name(), HttpMethod.OPTIONS.name()
    };
    // Location is exposed so the client can follow the URI of a newly created project; browsers
    // hide non-safelisted response headers from scripts otherwise.
    private static final String EXPOSED_HEADER = HttpHeaders.LOCATION;
    // One hour of preflight caching trades faster config rollout for fewer OPTIONS round trips.
    private static final long PREFLIGHT_MAX_AGE_SECONDS = 3600L;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping(API_PATH_PATTERN)
                .allowedOrigins(DEV_CLIENT_ORIGIN)
                .allowedMethods(ALLOWED_METHODS)
                .allowCredentials(true)
                .exposedHeaders(EXPOSED_HEADER)
                .maxAge(PREFLIGHT_MAX_AGE_SECONDS);
    }
}
