package dev.interview.javalanguage.m05.ex4;

/** Module 05 Ex05.4: a configuration value the application cannot run without is missing or unusable. */
public final class ConfigException extends RuntimeException {

    private final String key;

    private ConfigException(String key, String message, Throwable cause) {
        super(message, cause);
        this.key = key;
    }

    static ConfigException missing(String key) {
        return new ConfigException(key, "missing required key '" + key + "'", null);
    }

    // The message names the key only: the raw value may be a secret, and messages end up in logs.
    static ConfigException notAnInteger(String key, NumberFormatException cause) {
        return new ConfigException(key, "key '" + key + "' is not an integer", cause);
    }

    public String key() {
        return key;
    }
}
