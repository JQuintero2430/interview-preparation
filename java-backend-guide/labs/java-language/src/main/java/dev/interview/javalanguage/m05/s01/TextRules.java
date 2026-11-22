package dev.interview.javalanguage.m05.s01;

import java.util.Locale;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Predicate;

// Rules as values: small lambdas combined with the default methods of Function and Predicate.
public final class TextRules {

    private TextRules() {}

    public static Function<String, String> normalizer() {
        Function<String, String> strip = s -> s.strip();
        Function<String, String> lower = s -> s.toLowerCase(Locale.ROOT);
        return strip.andThen(lower);
    }

    public static Predicate<String> acceptedTag(Set<String> banned) {
        Predicate<String> blank = s -> s.isBlank();
        Predicate<String> isBanned = s -> banned.contains(s);
        Predicate<String> rule = Predicate.not(blank).and(isBanned.negate());
        Function<String, String> normalize = normalizer();
        return tag -> rule.test(normalize.apply(tag));
    }
}
