package dev.interview.javalanguage.m06.s01;

import java.io.IOException;
import java.util.Objects;

public final class RateCardLoader {

    private final RateSource source;

    public RateCardLoader(RateSource source) {
        this.source = Objects.requireNonNull(source, "source");
    }

    // IOException is declared: the storage can fail and the caller can do something about it.
    // A null or blank name is the caller's bug, reported with unchecked exceptions.
    public RateCard load(String name) throws IOException {
        Objects.requireNonNull(name, "name");
        if (name.isBlank()) {
            throw new IllegalArgumentException("rate card name is blank");
        }
        String text = source.read(name);
        return RateCard.parse(name, text);
    }
}
