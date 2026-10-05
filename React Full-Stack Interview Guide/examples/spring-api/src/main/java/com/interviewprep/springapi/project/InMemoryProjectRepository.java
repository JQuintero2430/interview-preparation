package com.interviewprep.springapi.project;

import java.util.List;
import java.util.NavigableMap;
import java.util.Optional;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryProjectRepository {

    private static final int SEED_COUNT = 25;
    private static final long FIRST_ID = 1L;
    // Two-digit padding keeps alphabetical name order identical to id order, so a client
    // sorting by name sees the same sequence the API returns.
    private static final String NAME_FORMAT = "Project %02d";

    // A sorted concurrent map gives id-ascending iteration for free and tolerates concurrent
    // requests without explicit locking; a plain HashMap would need sorting on every read.
    private final NavigableMap<Long, Project> store = new ConcurrentSkipListMap<>();
    private final AtomicLong nextId = new AtomicLong(FIRST_ID);

    public InMemoryProjectRepository() {
        for (int i = 0; i < SEED_COUNT; i++) {
            long id = nextId.getAndIncrement();
            store.put(id, new Project(id, NAME_FORMAT.formatted(id)));
        }
    }

    public PageResponse<Project> findPage(int number, int size) {
        // Page content and totals come from one snapshot so a concurrent write cannot make
        // totalElements disagree with the returned slice.
        List<Project> snapshot = List.copyOf(store.values());
        List<Project> content = snapshot.stream()
                .skip((long) number * size)
                .limit(size)
                .toList();
        return PageResponse.of(content, number, size, snapshot.size());
    }

    // Optional rather than throwing keeps HTTP semantics out of the repository; the controller
    // decides that absence means 404.
    public Optional<Project> findById(long id) {
        return Optional.ofNullable(store.get(id));
    }

    // Ids come from the same AtomicLong used for seeding, so new rows continue after the seed
    // (26, 27, ...) and two concurrent creates can never share an id; reusing a map-size based
    // id was rejected because it races under concurrent writes.
    public Project save(String name) {
        long id = nextId.getAndIncrement();
        Project project = new Project(id, name);
        store.put(id, project);
        return project;
    }
}
