package dev.interview.javalanguage.m03.ex2;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.function.Predicate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Module 03 Ex03.2: max and copyMatching with the bounds and wildcards that let real callers in. One group per
// criterion.
class SelectionsTest {

    private static final LocalDate JAN_10 = LocalDate.of(2026, 1, 10);
    private static final LocalDate MAR_02 = LocalDate.of(2026, 3, 2);
    private static final LocalDate FEB_14 = LocalDate.of(2026, 2, 14);
    private static final double SEED = 2.5;

    private static final String CANNOT_APPLY = "compiler.err.cant.apply.symbol";
    private static final String INCOMPATIBLE_TYPES = "compiler.err.prob.found.req";
    private static final String CLASSPATH_FLAG = "-cp";

    private static final String MAX_CALLER_NAME = "MaxCaller";
    private static final String MAX_CALLER = """
            import dev.interview.javalanguage.m03.ex2.Selections;
            import java.time.LocalDate;
            import java.util.List;
            class MaxCaller {
                LocalDate latest(List<LocalDate> dates) {
                    return Selections.max(dates);
                }
            }
            """;
    private static final String STRICT_MAX_NAME = "StrictMax";
    private static final String STRICT_MAX = """
            import java.time.LocalDate;
            import java.util.Collection;
            import java.util.List;
            class StrictMax {
                static <T extends Comparable<T>> T max(Collection<T> values) {
                    return values.iterator().next();
                }
                LocalDate latest(List<LocalDate> dates) {
                    return max(dates);
                }
            }
            """;
    private static final String STRICT_COPY_NAME = "StrictCopy";
    private static final String STRICT_COPY = """
            import java.util.Collection;
            import java.util.List;
            import java.util.function.Predicate;
            class StrictCopy {
                static <T> void copyMatching(List<T> src, Predicate<T> keep, Collection<T> dst) {}
                void run(List<Integer> ints, Predicate<Object> keep, List<Number> numbers) {
                    copyMatching(ints, keep, numbers);
                }
            }
            """;
    private static final String WRITE_INTO_SRC_NAME = "WriteIntoSource";
    private static final String WRITE_INTO_SRC = """
            import java.util.List;
            class WriteIntoSource {
                static <T> void putBack(List<? extends T> src, T element) {
                    src.add(element);
                }
            }
            """;
    private static final String WRITE_INTO_SINK_NAME = "WriteIntoSink";
    private static final String WRITE_INTO_SINK = """
            import java.util.Collection;
            class WriteIntoSink {
                static <T> void putBack(Collection<? super T> dst, T element) {
                    dst.add(element);
                }
            }
            """;

    @Test
    @DisplayName("Ex03.2 · (1) max returns the latest LocalDate of a List<LocalDate>")
    void max_returnsLatestDate_whenListHoldsLocalDates() {
        List<LocalDate> dates = List.of(JAN_10, MAR_02, FEB_14);

        LocalDate latest = Selections.max(dates);

        assertThat(latest).isEqualTo(MAR_02);
    }

    @Test
    @DisplayName("Ex03.2 · (1) a max(List<LocalDate>) caller compiles; the Comparable<T> look-alike rejects it")
    void compile_acceptsLocalDatesOnlyWithSuperBound_whenMaxIsCalled() throws Exception {
        assertThat(compile(MAX_CALLER_NAME, MAX_CALLER).success()).isTrue();
        assertThat(compile(STRICT_MAX_NAME, STRICT_MAX).errorCodes()).contains(CANNOT_APPLY);
    }

    @Test
    @DisplayName("Ex03.2 · (2) max of an empty collection throws NoSuchElementException")
    void max_throwsNoSuchElementException_whenCollectionIsEmpty() {
        List<LocalDate> none = List.of();

        assertThatThrownBy(() -> Selections.max(none))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessage(Selections.EMPTY);
    }

    @Test
    @DisplayName("Ex03.2 · (3) copyMatching copies Integers into a List<Number> with a Predicate<Object>")
    void copyMatching_appendsKeptIntegers_whenDestinationHoldsNumbers() {
        List<Integer> source = Arrays.asList(1, null, 3);
        Predicate<Object> notNull = Objects::nonNull;
        List<Number> destination = new ArrayList<>(List.of(SEED));

        Selections.copyMatching(source, notNull, destination);

        assertThat(destination).containsExactly(SEED, 1, 3);
    }

    @Test
    @DisplayName("Ex03.2 · (3) the invariant look-alike rejects the same Integer, Object, Number call")
    void compile_rejectsMixedTypes_whenSignatureHasNoWildcards() throws Exception {
        assertThat(compile(STRICT_COPY_NAME, STRICT_COPY).errorCodes()).contains(CANNOT_APPLY);
    }

    @Test
    @DisplayName("Ex03.2 · (4) writing a T into List<? extends T> does not compile; into Collection<? super T> it does")
    void compile_rejectsWriteOnlyIntoProducer_whenBodyAddsAnElement() throws Exception {
        assertThat(compile(WRITE_INTO_SRC_NAME, WRITE_INTO_SRC).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(WRITE_INTO_SINK_NAME, WRITE_INTO_SINK).success()).isTrue();
    }

    private static InMemoryCompiler.Result compile(String name, String source) throws Exception {
        Path classes = Path.of(Selections.class
                .getProtectionDomain()
                .getCodeSource()
                .getLocation()
                .toURI());
        return InMemoryCompiler.compile(Map.of(name, source), CLASSPATH_FLAG, classes.toString());
    }
}
