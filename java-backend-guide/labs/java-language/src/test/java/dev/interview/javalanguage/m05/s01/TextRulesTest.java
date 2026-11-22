package dev.interview.javalanguage.m05.s01;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Predicate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TextRulesTest {

    @Test
    @DisplayName("M05 §1 · andThen applies this function first, compose applies the argument first")
    void andThenAndCompose_applyFunctionsInOppositeOrders() {
        Function<Integer, Integer> plusOne = x -> x + 1;
        Function<Integer, Integer> twice = x -> x * 2;

        assertThat(plusOne.andThen(twice).apply(3)).isEqualTo(8);
        assertThat(plusOne.compose(twice).apply(3)).isEqualTo(7);
    }

    @Test
    @DisplayName("M05 §1 · Predicate.and skips the second predicate when the first is false")
    void and_skipsSecondPredicate_whenFirstIsFalse() {
        List<String> calls = new ArrayList<>();
        Predicate<String> first = s -> calls.add("first") && false;
        Predicate<String> second = s -> calls.add("second");

        boolean result = first.and(second).test("tag");

        assertThat(result).isFalse();
        assertThat(calls).containsExactly("first");
    }

    @Test
    @DisplayName("M05 §1 · composed rules normalize a tag, then reject blank and banned tags")
    void acceptedTag_rejectsBlankAndBannedTags_afterNormalizing() {
        Predicate<String> accepted = TextRules.acceptedTag(Set.of("spam"));

        assertThat(TextRules.normalizer().apply("  Java ")).isEqualTo("java");
        assertThat(accepted.test("  Java ")).isTrue();
        assertThat(accepted.test(" SPAM")).isFalse();
        assertThat(accepted.test("   ")).isFalse();
    }
}
