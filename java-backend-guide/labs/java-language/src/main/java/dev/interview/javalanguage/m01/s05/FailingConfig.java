package dev.interview.javalanguage.m01.s05;

// Module 01 §5: a deliberately broken static initializer; the default value is not a number.
public final class FailingConfig {

    static final int PORT = Integer.parseInt(System.getProperty("m01.s05.port", "not-a-port"));

    private FailingConfig() {}

    public static int port() {
        return PORT;
    }
}
