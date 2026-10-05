package com.interviewprep.springapi.project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@WebMvcTest(ProjectController.class)
@Import(InMemoryProjectRepository.class)
class ProjectControllerTest {

    private static final String PATH = "/api/projects";
    private static final String PAGE_PARAM = "page";
    private static final String SIZE_PARAM = "size";
    private static final String PROBLEM_JSON = "application/problem+json";
    private static final String ITEM_PATH = PATH + "/{id}";
    private static final String NOT_FOUND_TYPE = "https://example.com/problems/project-not-found";
    private static final String NOT_FOUND_TITLE = "Project not found";
    private static final String FIRST_PROJECT_NAME = "Project 01";
    private static final String LAST_PROJECT_NAME = "Project 25";
    private static final String MISSING_ID_DETAIL = "Project 999 does not exist";
    private static final String ZERO_ID_DETAIL = "Project 0 does not exist";
    private static final String MISSING_ID_SUFFIX = "/999";
    private static final String ZERO_ID_SUFFIX = "/0";
    private static final String NOT_NUMERIC = "abc";
    private static final String NOT_NUMERIC_SUFFIX = "/abc";
    private static final String PAGE_TWO = "2";
    private static final String PAGE_THREE = "3";
    private static final String SIZE_TEN = "10";
    private static final String SIZE_ONE = "1";
    private static final String SIZE_MAXIMUM = "50";
    private static final String SIZE_ABOVE_MAXIMUM = "51";
    private static final String ZERO = "0";
    private static final String NEGATIVE_ONE = "-1";
    private static final int BAD_REQUEST = 400;
    private static final int NOT_FOUND = 404;

    private final MockMvc mockMvc;

    @Autowired
    ProjectControllerTest(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    void list_returnsFirstTenWithDefaults_whenNoParams() throws Exception {
        mockMvc.perform(get(PATH))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content.length()").value(10))
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].name").value(FIRST_PROJECT_NAME))
                .andExpect(jsonPath("$.content[9].id").value(10))
                .andExpect(jsonPath("$.page.size").value(10))
                .andExpect(jsonPath("$.page.number").value(0))
                .andExpect(jsonPath("$.page.totalElements").value(25))
                .andExpect(jsonPath("$.page.totalPages").value(3));
    }

    @Test
    void list_returnsFiveItems_whenLastPartialPage() throws Exception {
        mockMvc.perform(get(PATH).param(PAGE_PARAM, PAGE_TWO).param(SIZE_PARAM, SIZE_TEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(5))
                .andExpect(jsonPath("$.content[0].id").value(21))
                .andExpect(jsonPath("$.content[4].id").value(25))
                .andExpect(jsonPath("$.page.number").value(2));
    }

    @Test
    void list_returnsEmptyContentNot400_whenPageBeyondRange() throws Exception {
        mockMvc.perform(get(PATH).param(PAGE_PARAM, PAGE_THREE).param(SIZE_PARAM, SIZE_TEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(0))
                .andExpect(jsonPath("$.page.totalElements").value(25))
                .andExpect(jsonPath("$.page.totalPages").value(3));
    }

    @Test
    void list_returnsSingleItem_whenSizeIsOne() throws Exception {
        mockMvc.perform(get(PATH).param(SIZE_PARAM, SIZE_ONE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.page.totalPages").value(25));
    }

    @Test
    void list_returnsAllItems_whenSizeIsMaximum() throws Exception {
        mockMvc.perform(get(PATH).param(SIZE_PARAM, SIZE_MAXIMUM))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(25))
                .andExpect(jsonPath("$.page.totalPages").value(1));
    }

    @Test
    void list_returnsProblemDetail_whenPageNegative() throws Exception {
        assertProblem(get(PATH).param(PAGE_PARAM, NEGATIVE_ONE));
    }

    @Test
    void list_returnsProblemDetail_whenSizeZero() throws Exception {
        assertProblem(get(PATH).param(SIZE_PARAM, ZERO));
    }

    @Test
    void list_returnsProblemDetail_whenSizeAboveMaximum() throws Exception {
        assertProblem(get(PATH).param(SIZE_PARAM, SIZE_ABOVE_MAXIMUM));
    }

    @Test
    void list_returnsProblemDetail_whenPageNotNumeric() throws Exception {
        assertProblem(get(PATH).param(PAGE_PARAM, NOT_NUMERIC));
    }

    @Test
    void get_returnsProject_whenIdExists() throws Exception {
        mockMvc.perform(get(ITEM_PATH, 1))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value(FIRST_PROJECT_NAME));
    }

    @Test
    void get_returnsProject_whenIdIsLastSeeded() throws Exception {
        mockMvc.perform(get(ITEM_PATH, 25))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(25))
                .andExpect(jsonPath("$.name").value(LAST_PROJECT_NAME));
    }

    @Test
    void get_returnsNotFoundProblem_whenIdMissing() throws Exception {
        mockMvc.perform(get(ITEM_PATH, 999))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value(NOT_FOUND_TYPE))
                .andExpect(jsonPath("$.title").value(NOT_FOUND_TITLE))
                .andExpect(jsonPath("$.status").value(NOT_FOUND))
                .andExpect(jsonPath("$.detail").value(MISSING_ID_DETAIL))
                .andExpect(jsonPath("$.instance").value(PATH + MISSING_ID_SUFFIX));
    }

    @Test
    void get_returnsNotFoundProblem_whenIdIsZero() throws Exception {
        mockMvc.perform(get(ITEM_PATH, 0))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value(NOT_FOUND_TYPE))
                .andExpect(jsonPath("$.title").value(NOT_FOUND_TITLE))
                .andExpect(jsonPath("$.detail").value(ZERO_ID_DETAIL))
                .andExpect(jsonPath("$.instance").value(PATH + ZERO_ID_SUFFIX));
    }

    @Test
    void get_returnsBadRequestProblem_whenIdNotNumeric() throws Exception {
        mockMvc.perform(get(ITEM_PATH, NOT_NUMERIC))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(PROBLEM_JSON))
                .andExpect(jsonPath("$.type").exists())
                .andExpect(jsonPath("$.status").value(BAD_REQUEST))
                .andExpect(jsonPath("$.instance").value(PATH + NOT_NUMERIC_SUFFIX));
    }

    private void assertProblem(MockHttpServletRequestBuilder request) throws Exception {
        mockMvc.perform(request)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(PROBLEM_JSON))
                .andExpect(jsonPath("$.type").exists())
                .andExpect(jsonPath("$.title").exists())
                .andExpect(jsonPath("$.status").value(BAD_REQUEST))
                .andExpect(jsonPath("$.detail").exists())
                .andExpect(jsonPath("$.instance").value(PATH));
    }
}
