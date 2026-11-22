package dev.interview.javalanguage.m05.s01;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class LengthOrderTest {

    private static final List<String> WORDS = List.of("stream", "map", "lambda", "of");

    @Test
    @DisplayName("M05 §1 · an anonymous Comparator and its lambda conversion sort the same way")
    void anonymousAndLambdaComparators_sortIdentically() {
        List<String> byAnonymous = new ArrayList<>(WORDS);
        List<String> byLambda = new ArrayList<>(WORDS);

        byAnonymous.sort(LengthOrder.ANONYMOUS);
        byLambda.sort(LengthOrder.LAMBDA);

        assertThat(byLambda).isEqualTo(byAnonymous).containsExactly("of", "map", "stream", "lambda");
    }
}
