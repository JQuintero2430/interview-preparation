package com.interviewprep.springapi.project;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.aMapWithSize;
import static org.hamcrest.Matchers.emptyString;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

// Why: created projects live in the singleton repository; discarding the context keeps
// the totals asserted by ProjectControllerTest stable regardless of class execution order.
@WebMvcTest(ProjectController.class)
@Import(InMemoryProjectRepository.class)
@DirtiesContext(classMode = ClassMode.AFTER_CLASS)
class ProjectControllerCreateTest {

    private static final String PATH = "/api/projects";
    private static final String ITEM_PATH = PATH + "/{id}";
    private static final String PROBLEM_JSON = "application/problem+json";
    private static final String LOCATION_PATTERN = "http://localhost/api/projects/\\d+";
    private static final String VALID_BODY = "{\"name\":\"New project\"}";
    private static final String NAME_BODY_FORMAT = "{\"name\":\"%s\"}";
    private static final String NAME_FIELD = "name";
    private static final String PROJECT_NAME = "New project";
    private static final String NAME_CHARACTER = "a";
    private static final String EMPTY_NAME = "";
    private static final String BLANK_NAME = "   ";
    private static final String BLANK_CHARACTER = " ";
    private static final String ERROR_MESSAGES_PATH = "$.errors[*].message";
    private static final String EMPTY_OBJECT_BODY = "{}";
    private static final String MALFORMED_BODY = "{\"name\":";
    private static final int MAX_NAME_LENGTH = 60;
    private static final int LAST_SEEDED_ID = 25;
    private static final int BAD_REQUEST = 400;
    private static final int FIELD_ERROR_ENTRY_SIZE = 2;

    private final MockMvc mockMvc;

    @Autowired
    ProjectControllerCreateTest(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    void create_returnsCreatedWithLocationAndBody_whenNameValid() throws Exception {
        mockMvc.perform(postJson(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string(HttpHeaders.LOCATION, matchesPattern(LOCATION_PATTERN)))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", greaterThan(LAST_SEEDED_ID)))
                .andExpect(jsonPath("$.name").value(PROJECT_NAME));
    }

    @Test
    void create_returnsCreated_whenNameHasMaximumLength() throws Exception {
        mockMvc.perform(postJson(NAME_BODY_FORMAT.formatted(NAME_CHARACTER.repeat(MAX_NAME_LENGTH))))
                .andExpect(status().isCreated());
    }

    @Test
    void create_returnsSingleFieldError_whenNameExceedsMaximumLength() throws Exception {
        ResultActions result = mockMvc.perform(postJson(NAME_BODY_FORMAT.formatted(NAME_CHARACTER.repeat(MAX_NAME_LENGTH + 1))));

        assertNameErrorProblem(result);
    }

    @Test
    void create_returnsSingleFieldError_whenNameEmpty() throws Exception {
        assertNameErrorProblem(mockMvc.perform(postJson(NAME_BODY_FORMAT.formatted(EMPTY_NAME))));
    }

    @Test
    void create_returnsSingleFieldError_whenNameBlank() throws Exception {
        assertNameErrorProblem(mockMvc.perform(postJson(NAME_BODY_FORMAT.formatted(BLANK_NAME))));
    }

    @Test
    void create_returnsSingleFieldError_whenNameMissing() throws Exception {
        assertNameErrorProblem(mockMvc.perform(postJson(EMPTY_OBJECT_BODY)));
    }

    @Test
    void create_returnsBothNameErrorsInMessageOrder_whenNameIsBlankAndTooLong() throws Exception {
        MvcResult result = mockMvc.perform(postJson(NAME_BODY_FORMAT.formatted(BLANK_CHARACTER.repeat(MAX_NAME_LENGTH + 1))))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(PROBLEM_JSON))
                .andExpect(jsonPath("$.errors", hasSize(2)))
                .andExpect(jsonPath("$.errors[0].field").value(NAME_FIELD))
                .andExpect(jsonPath("$.errors[1].field").value(NAME_FIELD))
                .andReturn();
        List<String> messages = JsonPath.read(result.getResponse().getContentAsString(), ERROR_MESSAGES_PATH);

        assertThat(messages.get(0)).isNotEmpty().isLessThan(messages.get(1));
    }

    @Test
    void create_returnsProblemDetail_whenBodyMalformed() throws Exception {
        mockMvc.perform(postJson(MALFORMED_BODY))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(BAD_REQUEST))
                .andExpect(jsonPath("$.instance").value(PATH));
    }

    @Test
    void create_makesProjectRetrievable_whenCreated() throws Exception {
        MvcResult created = mockMvc.perform(postJson(VALID_BODY)).andReturn();
        String location = created.getResponse().getHeader(HttpHeaders.LOCATION);
        String newId = location.substring(location.lastIndexOf('/') + 1);

        mockMvc.perform(get(ITEM_PATH, newId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(Long.parseLong(newId)))
                .andExpect(jsonPath("$.name").value(PROJECT_NAME));
    }

    @Test
    void create_assignsDistinctIds_whenCalledTwice() throws Exception {
        String first = mockMvc.perform(postJson(VALID_BODY)).andReturn().getResponse().getHeader(HttpHeaders.LOCATION);
        String second = mockMvc.perform(postJson(VALID_BODY)).andReturn().getResponse().getHeader(HttpHeaders.LOCATION);

        assertThat(first).isNotEqualTo(second);
    }

    private static MockHttpServletRequestBuilder postJson(String body) {
        return post(PATH).contentType(MediaType.APPLICATION_JSON).content(body);
    }

    private static void assertNameErrorProblem(ResultActions result) throws Exception {
        result.andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(PROBLEM_JSON))
                .andExpect(jsonPath("$.type").exists())
                .andExpect(jsonPath("$.title").exists())
                .andExpect(jsonPath("$.status").value(BAD_REQUEST))
                .andExpect(jsonPath("$.detail").exists())
                .andExpect(jsonPath("$.instance").value(PATH))
                .andExpect(jsonPath("$.errors", hasSize(1)))
                .andExpect(jsonPath("$.errors[0]", aMapWithSize(FIELD_ERROR_ENTRY_SIZE)))
                .andExpect(jsonPath("$.errors[0].field").value(NAME_FIELD))
                .andExpect(jsonPath("$.errors[0].message", not(emptyString())));
    }
}
