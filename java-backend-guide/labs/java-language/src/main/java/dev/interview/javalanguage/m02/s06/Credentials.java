package dev.interview.javalanguage.m02.s06;

/** Module 02 §6: the generated toString prints every component, so a secret needs an override. */
public record Credentials(String user, String password) {

    private static final String FORMAT = "Credentials[user=%s, password=***]";

    @Override
    public String toString() {
        return FORMAT.formatted(user);
    }
}
