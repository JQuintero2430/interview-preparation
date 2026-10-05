package com.interviewprep.springapi.project;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;
import java.util.stream.LongStream;
import org.junit.jupiter.api.Test;

class InMemoryProjectRepositoryTest {

    private static final int SEEDED_COUNT = 25;
    private static final int FIRST_NEW_ID = 26;
    private static final int DEFAULT_SIZE = 10;
    private static final int OVERSIZED = 50;
    private static final String NAME_FORMAT = "Project %02d";
    private static final String FIRST_PROJECT_NAME = "Project 01";
    private static final String LAST_PROJECT_NAME = "Project 25";
    private static final String NEW_PROJECT_NAME = "New project";
    private static final String FIRST_SAVED_NAME = "First";
    private static final String SECOND_SAVED_NAME = "Second";
    private static final String PAGE_ITEM = "a";

    private final InMemoryProjectRepository repository = new InMemoryProjectRepository();

    @Test
    void findPage_returnsFirstTenSortedById_whenFirstPageRequested() {
        PageResponse<Project> result = repository.findPage(0, DEFAULT_SIZE);

        assertThat(ids(result)).containsExactlyElementsOf(range(1, 10));
        assertThat(result.page().number()).isZero();
        assertThat(result.page().size()).isEqualTo(DEFAULT_SIZE);
        assertThat(result.page().totalElements()).isEqualTo(SEEDED_COUNT);
        assertThat(result.page().totalPages()).isEqualTo(3);
    }

    @Test
    void findPage_seedsNamesMatchingIds_whenRepositoryCreated() {
        PageResponse<Project> result = repository.findPage(0, OVERSIZED);

        assertThat(result.content()).allSatisfy(
                project -> assertThat(project.name()).isEqualTo(NAME_FORMAT.formatted(project.id())));
    }

    @Test
    void findPage_returnsPartialLastPage_whenRemainderIsFive() {
        PageResponse<Project> result = repository.findPage(2, DEFAULT_SIZE);

        assertThat(ids(result)).containsExactlyElementsOf(range(21, 25));
        assertThat(result.page().totalPages()).isEqualTo(3);
    }

    @Test
    void findPage_returnsEmptyContentWithTotals_whenPageBeyondRange() {
        PageResponse<Project> result = repository.findPage(3, DEFAULT_SIZE);

        assertThat(result.content()).isEmpty();
        assertThat(result.page().totalElements()).isEqualTo(SEEDED_COUNT);
        assertThat(result.page().totalPages()).isEqualTo(3);
        assertThat(result.page().number()).isEqualTo(3);
    }

    @Test
    void findPage_returnsSingleElement_whenSizeIsOne() {
        PageResponse<Project> result = repository.findPage(0, 1);

        assertThat(ids(result)).containsExactly(1L);
        assertThat(result.page().totalPages()).isEqualTo(SEEDED_COUNT);
    }

    @Test
    void findPage_returnsLastSingleElement_whenSizeIsOneAndLastPage() {
        PageResponse<Project> result = repository.findPage(SEEDED_COUNT - 1, 1);

        assertThat(ids(result)).containsExactly((long) SEEDED_COUNT);
    }

    @Test
    void findPage_returnsAllElementsInOnePage_whenSizeExceedsTotal() {
        PageResponse<Project> result = repository.findPage(0, OVERSIZED);

        assertThat(ids(result)).containsExactlyElementsOf(range(1, SEEDED_COUNT));
        assertThat(result.page().totalPages()).isEqualTo(1);
    }

    @Test
    void findPage_roundsTotalPagesUp_whenTotalNotMultipleOfSize() {
        PageResponse<Project> result = repository.findPage(0, 7);

        assertThat(result.page().totalPages()).isEqualTo(4);
        assertThat(result.content()).hasSize(7);
    }

    @Test
    void of_computesCeilingTotalPages_whenRemainderPresent() {
        PageResponse<String> result = PageResponse.of(List.of(PAGE_ITEM), 0, 2, 3);

        assertThat(result.page().totalPages()).isEqualTo(2);
        assertThat(result.page().totalElements()).isEqualTo(3);
    }

    @Test
    void findById_returnsProject_whenIdExists() {
        Optional<Project> result = repository.findById(1);

        assertThat(result).contains(new Project(1, FIRST_PROJECT_NAME));
    }

    @Test
    void findById_returnsLastProject_whenIdIsLastSeeded() {
        Optional<Project> result = repository.findById(SEEDED_COUNT);

        assertThat(result).contains(new Project(SEEDED_COUNT, LAST_PROJECT_NAME));
    }

    @Test
    void findById_returnsEmpty_whenIdMissing() {
        assertThat(repository.findById(SEEDED_COUNT + 1)).isEmpty();
    }

    @Test
    void findById_returnsEmpty_whenIdIsZero() {
        assertThat(repository.findById(0)).isEmpty();
    }

    @Test
    void findById_returnsEmpty_whenIdNegative() {
        assertThat(repository.findById(-1)).isEmpty();
    }

    @Test
    void save_assignsIdAfterLastSeeded_whenFirstSave() {
        Project saved = repository.save(NEW_PROJECT_NAME);

        assertThat(saved).isEqualTo(new Project(FIRST_NEW_ID, NEW_PROJECT_NAME));
    }

    @Test
    void save_assignsSequentialIds_whenSavedTwice() {
        Project first = repository.save(FIRST_SAVED_NAME);
        Project second = repository.save(SECOND_SAVED_NAME);

        assertThat(first.id()).isEqualTo(FIRST_NEW_ID);
        assertThat(second.id()).isEqualTo(FIRST_NEW_ID + 1);
    }

    @Test
    void save_makesProjectFindableById_whenSaved() {
        Project saved = repository.save(NEW_PROJECT_NAME);

        assertThat(repository.findById(saved.id())).contains(saved);
    }

    @Test
    void save_appendsProjectAtEndOfPage_whenSaved() {
        Project saved = repository.save(NEW_PROJECT_NAME);

        PageResponse<Project> result = repository.findPage(0, OVERSIZED);

        assertThat(result.content()).hasSize(SEEDED_COUNT + 1);
        assertThat(result.content().getLast()).isEqualTo(saved);
        assertThat(result.page().totalElements()).isEqualTo(SEEDED_COUNT + 1);
    }

    @Test
    void save_keepsSeededProjectsUntouched_whenSaved() {
        repository.save(NEW_PROJECT_NAME);

        assertThat(repository.findById(1)).contains(new Project(1, FIRST_PROJECT_NAME));
    }

    private static List<Long> ids(PageResponse<Project> response) {
        return response.content().stream().map(Project::id).toList();
    }

    private static List<Long> range(long fromInclusive, long toInclusive) {
        return LongStream.rangeClosed(fromInclusive, toInclusive).boxed().toList();
    }
}
