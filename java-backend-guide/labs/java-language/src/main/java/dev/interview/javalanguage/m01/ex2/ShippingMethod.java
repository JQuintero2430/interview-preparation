package dev.interview.javalanguage.m01.ex2;

import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum ShippingMethod {
    STANDARD {
        @Override
        public long costCents(int weightGrams) {
            return tariff(weightGrams, 499, 100);
        }
    },
    EXPRESS {
        @Override
        public long costCents(int weightGrams) {
            return tariff(weightGrams, 999, 250);
        }
    },
    PICKUP {
        @Override
        public long costCents(int weightGrams) {
            return tariff(weightGrams, 0, 0);
        }
    };

    private static final int GRAMS_PER_KG = 1000;

    // Map lookup instead of valueOf: unknown names are an expected input, not an exceptional one.
    private static final Map<String, ShippingMethod> BY_NAME =
            Arrays.stream(values()).collect(Collectors.toUnmodifiableMap(ShippingMethod::name, Function.identity()));

    public abstract long costCents(int weightGrams);

    public static Optional<ShippingMethod> parse(String name) {
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }
        return Optional.ofNullable(BY_NAME.get(name.strip().toUpperCase(Locale.ROOT)));
    }

    // Single validation point so no constant body can forget to reject negative weights.
    private static long tariff(int weightGrams, long baseCents, long perKgCents) {
        if (weightGrams < 0) {
            throw new IllegalArgumentException("weightGrams must not be negative: " + weightGrams);
        }
        return baseCents + perKgCents * Math.ceilDiv(weightGrams, GRAMS_PER_KG);
    }
}
