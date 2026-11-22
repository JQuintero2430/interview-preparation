package dev.interview.javalanguage.m05.s08;

import static java.util.Spliterator.ORDERED;
import static java.util.Spliterator.SIZED;
import static java.util.Spliterator.SUBSIZED;
import static org.assertj.core.api.Assertions.assertThat;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Spliterator;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SplittingTest {

    @Test
    @DisplayName("M05 §8 · ArrayList reports SIZED, SUBSIZED and ORDERED and splits off the first half")
    void arrayList_splitsExactlyInHalf() {
        var list = new ArrayList<>(IntStream.range(0, 1_000).boxed().toList());
        Spliterator<Integer> rest = list.spliterator();

        assertThat(rest.hasCharacteristics(SIZED | SUBSIZED | ORDERED)).isTrue();
        Spliterator<Integer> prefix = rest.trySplit();

        assertThat(prefix.estimateSize()).isEqualTo(500);
        assertThat(rest.estimateSize()).isEqualTo(500);
        List<Integer> firstHalf = new ArrayList<>();
        prefix.forEachRemaining(firstHalf::add);
        assertThat(firstHalf).hasSize(500).startsWith(0).endsWith(499); // ORDERED: a strict prefix
    }

    @Test
    @DisplayName("M05 §8 · IntStream.range is SUBSIZED: the two halves add up to the whole")
    void intRange_splitSizesAddUp() {
        Spliterator.OfInt rest = IntStream.range(0, 1_000).spliterator();

        assertThat(rest.hasCharacteristics(SIZED | SUBSIZED | ORDERED)).isTrue();
        Spliterator.OfInt prefix = rest.trySplit();

        assertThat(prefix.estimateSize() + rest.estimateSize()).isEqualTo(1_000);
        assertThat(prefix.estimateSize()).isPositive();
        assertThat(rest.estimateSize()).isPositive();
    }

    @Test
    @DisplayName("M05 §8 · in JDK 25 LinkedList splits off growing batches copied into arrays, not halves")
    void linkedList_splitsInBatches() {
        var list = new LinkedList<>(IntStream.range(0, 10_000).boxed().toList());
        Spliterator<Integer> rest = list.spliterator();

        Spliterator<Integer> firstBatch = rest.trySplit();
        Spliterator<Integer> secondBatch = rest.trySplit();

        // LLSpliterator: batch sizes grow by BATCH_UNIT (1 << 10) on each split.
        assertThat(firstBatch.estimateSize()).isEqualTo(1_024);
        assertThat(secondBatch.estimateSize()).isEqualTo(2_048);
        assertThat(rest.estimateSize()).isEqualTo(10_000 - 1_024 - 2_048);
    }

    @Test
    @DisplayName("M05 §8 · Stream.iterate has no known size and splits off batches")
    void streamIterate_hasUnknownSize() {
        Spliterator<Integer> source = Stream.iterate(1, n -> n + 1).spliterator();

        assertThat(source.hasCharacteristics(SIZED)).isFalse();
        assertThat(source.estimateSize()).isEqualTo(Long.MAX_VALUE);
        // Each element depends on the previous one, so a split must compute and copy the elements
        // it hands off: in JDK 25 the first batch holds 1_024 of them.
        List<Integer> firstBatch = new ArrayList<>();
        source.trySplit().forEachRemaining(firstBatch::add);
        assertThat(firstBatch).hasSize(1_024).startsWith(1).endsWith(1_024);
    }

    @Test
    @DisplayName("M05 §8 · BufferedReader.lines has no known size")
    void bufferedReaderLines_hasUnknownSize() throws IOException {
        try (var reader = new BufferedReader(new StringReader("a\nb\nc"))) {
            Spliterator<String> lines = reader.lines().spliterator();

            assertThat(lines.hasCharacteristics(SIZED)).isFalse();
            assertThat(lines.estimateSize()).isEqualTo(Long.MAX_VALUE);
        }
    }
}
