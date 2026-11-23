package dev.interview.javalanguage.m05.s10;

import java.util.Optional;

// referrerId may be null in storage; the field stays a plain reference and the accessor says "maybe".
public record Customer(String id, String name, String referrerId) {

    public Optional<String> referrer() {
        return Optional.ofNullable(referrerId);
    }
}
