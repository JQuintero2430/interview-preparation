package dev.interview.javalanguage.m03.outputs;

import dev.interview.javalanguage.m03.s02.Settings;
import dev.interview.javalanguage.m03.s07.TypedSettings;

// Module 03 Q03.06: Settings.get is <T> T get(String key); the caller's target type chooses T and receives the cast.
public final class Q03_06 {

    private static final String PORT = "port";
    private static final String PORT_TEXT = "8080";

    private Q03_06() {}

    public static void main(String[] args) {
        Settings settings = new Settings();
        settings.put(PORT, PORT_TEXT);

        Integer port = settings.get(PORT);
        System.out.println(port + 1);
    }

    public static Object asObject() {
        Object port = settings().get(PORT);
        return port;
    }

    // Overload resolution picks the most specific applicable valueOf, valueOf(char[]), so T is inferred as char[].
    public static String throughValueOf() {
        return String.valueOf(settings().get(PORT));
    }

    // The fix: a Class<T> token, so the check happens inside get (§7).
    public static String checked() {
        TypedSettings typed = new TypedSettings();
        typed.put(PORT, PORT_TEXT);
        return typed.get(PORT, String.class);
    }

    private static Settings settings() {
        Settings settings = new Settings();
        settings.put(PORT, PORT_TEXT);
        return settings;
    }
}
