package dev.interview.javalanguage.m05.s06;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.IntStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PrimitiveStreamsTest {

    private static final String BOXED_SUM = """
            import java.util.List;
            class BoxedSum { int total(List<Integer> xs) { return xs.stream().sum(); } }
            """;
    private static final String UNBOXED_SUM = """
            import java.util.List;
            class BoxedSum { int total(List<Integer> xs) { return xs.stream().mapToInt(Integer::intValue).sum(); } }
            """;

    @Test
    @DisplayName("M05 §6 · IntStream.average of an empty stream is empty")
    void average_ofEmptyStream_isEmpty() {
        var average = IntStream.empty().average();

        assertThat(average).isEmpty();
        assertThat(IntStream.empty().sum()).isZero();
        assertThatThrownBy(average::getAsDouble).isInstanceOf(NoSuchElementException.class);
    }

    @Test
    @DisplayName("M05 §6 · summaryStatistics of an empty stream reports 0 and the extreme int values")
    void summaryStatistics_ofEmptyStream_usesDefaults() {
        var stats = IntStream.empty().summaryStatistics();

        assertThat(stats.getCount()).isZero();
        assertThat(stats.getAverage()).isZero();
        assertThat(stats.getMin()).isEqualTo(Integer.MAX_VALUE);
        assertThat(stats.getMax()).isEqualTo(Integer.MIN_VALUE);
    }

    @Test
    @DisplayName("M05 §6 · IntStream.sum overflows silently; average and summaryStatistics sum in long")
    void sum_overflowsInt_whileAverageAndStatisticsDoNot() {
        assertThat(IntStream.of(Integer.MAX_VALUE, 1).sum()).isEqualTo(Integer.MIN_VALUE);
        assertThat(IntStream.of(Integer.MAX_VALUE, 1).average()).hasValue(1_073_741_824.0);
        assertThat(IntStream.of(Integer.MAX_VALUE, 1).summaryStatistics().getSum())
                .isEqualTo(2_147_483_648L);
        assertThat(IntStream.of(Integer.MAX_VALUE, 1).asLongStream().sum()).isEqualTo(2_147_483_648L);
    }

    @Test
    @DisplayName("M05 §6 · range excludes its end and rangeClosed includes it")
    void range_excludesEnd_rangeClosedIncludesIt() {
        assertThat(IntStream.range(1, 5).toArray()).containsExactly(1, 2, 3, 4);
        assertThat(IntStream.rangeClosed(1, 5).toArray()).containsExactly(1, 2, 3, 4, 5);
        assertThat(IntStream.range(5, 5).count()).isZero();
    }

    @Test
    @DisplayName("M05 §6 · boxed reuses cached Integers up to 127 and allocates one per element beyond")
    void boxed_allocatesOutsideIntegerCache() {
        List<Integer> first = IntStream.of(127, 1_000).boxed().toList();
        List<Integer> second = IntStream.of(127, 1_000).boxed().toList();

        assertThat(first.get(0)).isSameAs(second.get(0));
        assertThat(first.get(1)).isEqualTo(second.get(1)).isNotSameAs(second.get(1));
    }

    @Test
    @DisplayName("M05 §6 · Stream<Integer> has no sum(); mapToInt does")
    void boxedStream_hasNoSum() {
        assertThat(InMemoryCompiler.compile(Map.of("BoxedSum", BOXED_SUM)).errorCodes())
                .containsExactly("compiler.err.cant.resolve.location.args");
        assertThat(InMemoryCompiler.compile(Map.of("BoxedSum", UNBOXED_SUM)).success())
                .isTrue();
    }
}
