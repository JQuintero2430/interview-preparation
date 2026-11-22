package dev.interview.javalanguage.m05.s05;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CustomCollectorTest {

    private static final List<String> WORDS =
            IntStream.range(0, 2_000).mapToObj(i -> "w" + (i % 300)).toList();

    @Test
    @DisplayName("M05 §5 · a Collector.of collector gives the same result sequentially and in parallel")
    void customCollector_sameResult_sequentialAndParallel() {
        Set<String> sequential = WORDS.stream().collect(FirstSeen.toSet());
        var parallelStream = WORDS.parallelStream();
        assertThat(parallelStream.isParallel()).isTrue();
        Set<String> parallel = parallelStream.collect(FirstSeen.toSet());

        assertThat(sequential).hasSize(300);
        assertThat(parallel).containsExactlyElementsOf(sequential);
        assertThat(sequential).first().isEqualTo("w0");
    }

    @Test
    @DisplayName("M05 §5 · the result of the finisher is unmodifiable")
    void finisher_wrapsResultUnmodifiable() {
        Set<String> words = WORDS.stream().collect(FirstSeen.toSet());

        assertThatThrownBy(() -> words.add("new")).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M05 §5 · a sequential collect calls the supplier once, the finisher once and the combiner never")
    void sequentialCollect_neverCallsTheCombiner() {
        var counts = new CallCounts();

        WORDS.stream().collect(CountingCollector.counting(FirstSeen.toSet(), counts));

        assertThat(counts.supplier()).isEqualTo(1);
        assertThat(counts.accumulator()).isEqualTo(2_000);
        assertThat(counts.combiner()).isZero();
        assertThat(counts.finisher()).isEqualTo(1);
    }

    @Test
    @DisplayName("M05 §5 · Collector.of without a finisher has IDENTITY_FINISH")
    void collectorOfWithoutFinisher_hasIdentityFinish() {
        Collector<String, ?, Set<String>> plain = Collector.of(HashSet::new, Set::add, (left, right) -> {
            left.addAll(right);
            return left;
        });

        assertThat(plain.characteristics()).containsExactly(Collector.Characteristics.IDENTITY_FINISH);
        assertThat(FirstSeen.toSet().characteristics()).isEmpty();
    }

    @Test
    @DisplayName("M05 §5 · toSet is UNORDERED and IDENTITY_FINISH, toList only IDENTITY_FINISH")
    void builtInCollectors_declareTheirCharacteristics() {
        assertThat(Collectors.toSet().characteristics())
                .containsExactlyInAnyOrder(
                        Collector.Characteristics.UNORDERED, Collector.Characteristics.IDENTITY_FINISH);
        assertThat(Collectors.toList().characteristics()).containsExactly(Collector.Characteristics.IDENTITY_FINISH);
    }
}
