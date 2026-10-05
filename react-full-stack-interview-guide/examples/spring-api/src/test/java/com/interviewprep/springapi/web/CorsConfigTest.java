package com.interviewprep.springapi.web;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import com.interviewprep.springapi.project.InMemoryProjectRepository;
import com.interviewprep.springapi.project.ProjectController;

// Why: CorsConfig is not imported explicitly. WebMvcConfigurer beans are part of the
// @WebMvcTest include filter, so a missing registration shows up as a CORS assertion
// failure instead of being masked by a hand-wired bean.
// The POST case mutates the singleton repository, hence the discarded context.
@WebMvcTest(ProjectController.class)
@Import(InMemoryProjectRepository.class)
@DirtiesContext(classMode = ClassMode.AFTER_CLASS)
class CorsConfigTest {

    private static final String PATH = "/api/projects";
    private static final String ALLOWED_ORIGIN = "http://localhost:5173";
    private static final String EVIL_ORIGIN = "http://evil.example";
    private static final String VALID_BODY = "{\"name\":\"New project\"}";
    private static final String GET_METHOD = "GET";
    private static final String POST_METHOD = "POST";
    private static final String OPTIONS_METHOD = "OPTIONS";
    private static final String DELETE_METHOD = "DELETE";
    private static final String REQUEST_HEADERS = "content-type";
    private static final String TRUE = "true";
    private static final String MAX_AGE_SECONDS = "3600";

    private final MockMvc mockMvc;

    @Autowired
    CorsConfigTest(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    void preflight_returnsCorsHeaders_whenOriginAllowed() throws Exception {
        mockMvc.perform(preflight(ALLOWED_ORIGIN, POST_METHOD))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ALLOWED_ORIGIN))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, TRUE))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_MAX_AGE, MAX_AGE_SECONDS));
    }

    @Test
    void preflight_allowsGetPostAndOptions_whenOriginAllowed() throws Exception {
        mockMvc.perform(preflight(ALLOWED_ORIGIN, POST_METHOD))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, containsString(GET_METHOD)))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, containsString(POST_METHOD)))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, containsString(OPTIONS_METHOD)));
    }

    @Test
    void preflight_isForbiddenWithoutAllowOrigin_whenOriginNotAllowed() throws Exception {
        mockMvc.perform(preflight(EVIL_ORIGIN, POST_METHOD))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }

    @Test
    void preflight_isForbidden_whenMethodNotAllowed() throws Exception {
        mockMvc.perform(preflight(ALLOWED_ORIGIN, DELETE_METHOD))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }

    @Test
    void list_carriesAllowOriginAndCredentials_whenOriginAllowed() throws Exception {
        mockMvc.perform(get(PATH).header(HttpHeaders.ORIGIN, ALLOWED_ORIGIN))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ALLOWED_ORIGIN))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, TRUE));
    }

    @Test
    void list_isForbiddenWithoutAllowOrigin_whenOriginNotAllowed() throws Exception {
        mockMvc.perform(get(PATH).header(HttpHeaders.ORIGIN, EVIL_ORIGIN))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }

    @Test
    void list_omitsAllowOrigin_whenNoOriginSent() throws Exception {
        mockMvc.perform(get(PATH))
                .andExpect(status().isOk())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }

    // Why: Expose-Headers is asserted only on the actual response because browsers ignore it
    // on preflights (Fetch standard), and Spring may send it on both, so a preflight
    // assertion would pin framework behavior the product does not need.
    @Test
    void create_exposesLocationHeader_whenOriginAllowed() throws Exception {
        mockMvc.perform(post(PATH)
                        .header(HttpHeaders.ORIGIN, ALLOWED_ORIGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ALLOWED_ORIGIN))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, containsString(HttpHeaders.LOCATION)));
    }

    private static MockHttpServletRequestBuilder preflight(String origin, String requestMethod) {
        return options(PATH)
                .header(HttpHeaders.ORIGIN, origin)
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, requestMethod)
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, REQUEST_HEADERS);
    }
}
