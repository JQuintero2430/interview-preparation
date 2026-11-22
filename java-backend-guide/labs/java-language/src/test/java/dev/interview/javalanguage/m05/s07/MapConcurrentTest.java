package dev.interview.javalanguage.m05.s07;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Gatherers;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Invariants only (M05 §1 lab rules): results, order, the kind of thread, and an upper bound. Never timing.
class MapConcurrentTest {

    @Test
    @DisplayName("M05 §7 · mapConcurrent keeps encounter order")
    void mapConcurrent_keepsEncounterOrder() {
        var lookup = new SlowLookup();

        var results = IntStream.rangeClosed(1, 50)
                .boxed()
                .gather(Gatherers.mapConcurrent(8, lookup::describe))
                .toList();

        assertThat(results)
                .isEqualTo(IntStream.rangeClosed(1, 50)
                        .mapToObj(id -> "item-" + id)
                        .toList());
    }

    @Test
    @DisplayName("M05 §7 · mapConcurrent runs the function on virtual threads, never more than maxConcurrency at once")
    void mapConcurrent_usesBoundedVirtualThreads() {
        var lookup = new SlowLookup();

        IntStream.rangeClosed(1, 50)
                .boxed()
                .gather(Gatherers.mapConcurrent(4, lookup::describe))
                .toList();

        assertThat(lookup.ranOnVirtualThreadsOnly()).isTrue();
        assertThat(lookup.maxInFlight()).isBetween(1, 4);
    }

    @Test
    @DisplayName("M05 §7 · an unchecked exception from the mapper is rethrown by the stream")
    void mapConcurrent_rethrowsMapperException() {
        var failing = Stream.of(1, 2, 3).gather(Gatherers.mapConcurrent(2, id -> {
            if (id == 2) {
                throw new IllegalStateException("lookup failed for " + id);
            }
            return id;
        }));

        assertThatThrownBy(failing::toList)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("lookup failed for 2");
    }

    @Test
    @DisplayName("M05 §7 · the recorder reports platform threads, so the virtual-thread check is not vacuous")
    void recorder_seesEveryCall() {
        var lookup = new SlowLookup();

        var results = List.of(1, 2).stream().map(lookup::describe).toList();

        assertThat(results).containsExactly("item-1", "item-2");
        assertThat(lookup.ranOnVirtualThreadsOnly()).isFalse();
    }

    // Records which threads ran the mapper and how many calls overlapped.
    private static final class SlowLookup {
        private final AtomicInteger inFlight = new AtomicInteger();
        private final AtomicInteger maxInFlight = new AtomicInteger();
        private final Set<Boolean> virtualFlags = ConcurrentHashMap.newKeySet();

        String describe(int id) {
            int now = inFlight.incrementAndGet();
            maxInFlight.accumulateAndGet(now, Math::max);
            virtualFlags.add(Thread.currentThread().isVirtual());
            try {
                Thread.sleep(2);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                inFlight.decrementAndGet();
            }
            return "item-" + id;
        }

        boolean ranOnVirtualThreadsOnly() {
            return virtualFlags.equals(Set.of(true));
        }

        int maxInFlight() {
            return maxInFlight.get();
        }
    }
}
