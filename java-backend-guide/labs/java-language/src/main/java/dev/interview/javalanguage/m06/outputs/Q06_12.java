package dev.interview.javalanguage.m06.outputs;

// Module 06 Q06.12: a lookup by name that fails, then a class whose static initializer fails, used twice.
// Class initialization state lives as long as the class loader, so main gives this output once per JVM.
public final class Q06_12 {

    private Q06_12() {}

    static final class Settings {
        static final int PORT = Integer.parseInt(System.getProperty("q06.port", "eighty"));
    }

    public static void main(String[] args) {
        try {
            Class.forName("com.example.MissingDriver");
        } catch (ClassNotFoundException e) {
            System.out.println("1: " + e);
        }
        for (int use = 2; use <= 3; use++) {
            try {
                System.out.println(Settings.PORT);
            } catch (LinkageError e) {
                System.out.println(use + ": " + e.getClass().getSimpleName() + ", message " + e.getMessage());
                System.out.println("   cause " + e.getCause().getClass().getSimpleName());
            }
        }
    }
}
