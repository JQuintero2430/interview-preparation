package dev.interview.javalanguage.m05.smoke;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class M05LabSmokeTest {

    @Test
    @DisplayName("M05 smoke · a stream with no terminal operation runs none of its lambdas")
    void stream_runsNoLambda_whenNoTerminalOperationIsCalled() {
        List<String> calls = new ArrayList<>();

        Stream<String> pipeline = Stream.of("a", "b").filter(s -> calls.add("filter " + s));

        assertThat(pipeline).isNotNull();
        assertThat(calls).isEmpty();
    }

    @Test
    @DisplayName("M05 smoke · Collectors.toMap rejects a duplicate key with IllegalStateException")
    void toMap_throwsIllegalStateException_whenTwoElementsShareAKey() {
        Stream<String> words = Stream.of("apple", "avocado");

        assertThatThrownBy(() -> words.collect(Collectors.toMap(w -> w.charAt(0), Function.identity())))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("M05 smoke · Optional.orElse evaluates its argument even when a value is present")
    void orElse_evaluatesItsArgument_whenAValueIsPresent() {
        List<String> calls = new ArrayList<>();

        String value = Optional.of("cached").orElse(fallback(calls));

        assertThat(value).isEqualTo("cached");
        assertThat(calls).containsExactly("fallback");
    }

    private static String fallback(List<String> calls) {
        calls.add("fallback");
        return "default";
    }
}
