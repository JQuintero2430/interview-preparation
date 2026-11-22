package dev.interview.javalanguage.m05.s04;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class LazinessTest {

    private static final List<String> WORDS = List.of("go", "lambda", "stream");

    @Test
    @DisplayName("M05 §4 · no terminal operation means no lambda runs")
    void pipeline_runsNoLambda_withoutTerminalOperation() {
        List<String> events = new ArrayList<>();

        Stream<String> pipeline = Pipelines.withoutTerminal(WORDS, events);

        assertThat(pipeline).isNotNull();
        assertThat(events).isEmpty();
    }

    @Test
    @DisplayName("M05 §4 · stages run per element, not per stage")
    void eachElement_passesThroughAllStages_beforeTheNextOneStarts() {
        List<String> events = new ArrayList<>();

        var first = Pipelines.firstLongWord(WORDS, events);

        assertThat(first).contains("LAMBDA");
        assertThat(events).containsExactly("filter go", "filter lambda", "map lambda");
    }
}
