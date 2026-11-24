package dev.interview.javalanguage.m06.s01;

import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;

public record RateCard(String name, Map<String, BigDecimal> rates) {

    public RateCard {
        rates = Map.copyOf(rates);
    }

    // Each non-blank line is CODE=rate. A malformed line is a defect in the deployed file, so it is unchecked.
    static RateCard parse(String name, String text) {
        Map<String, BigDecimal> rates = text.lines()
                .filter(line -> !line.isBlank())
                .map(RateCard::entry)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        return new RateCard(name, rates);
    }

    private static Map.Entry<String, BigDecimal> entry(String line) {
        int separator = line.indexOf('=');
        if (separator < 1) {
            throw new IllegalArgumentException("not a CODE=rate line: " + line);
        }
        String code = line.substring(0, separator).strip();
        BigDecimal rate = new BigDecimal(line.substring(separator + 1).strip());
        return Map.entry(code, rate);
    }
}
