package dev.interview.javalanguage.m01.ex2;

import java.util.Optional;

public final class ShippingCalculator {

    public Optional<Long> quote(String methodName, int weightGrams) {
        return ShippingMethod.parse(methodName).map(method -> method.costCents(weightGrams));
    }
}
