package dev.interview.javalanguage.m05.s01;

import java.util.function.Supplier;

// The same "describe yourself" request, written as a lambda and as an anonymous class.
public final class Greeter {

    private final String name;

    public Greeter(String name) {
        this.name = name;
    }

    // In a lambda body, this is the Greeter that created the lambda.
    public Supplier<String> lambdaThis() {
        return () -> this.toString();
    }

    // In an anonymous class body, this is the anonymous object itself.
    public Supplier<String> anonymousThis() {
        return new Supplier<>() {
            @Override
            public String get() {
                return this.toString();
            }

            @Override
            public String toString() {
                return "anonymous supplier";
            }
        };
    }

    // An anonymous class may declare fields; a lambda cannot.
    public static Supplier<Integer> countingSupplier() {
        return new Supplier<>() {
            private int calls;

            @Override
            public Integer get() {
                calls++;
                return calls;
            }
        };
    }

    @Override
    public String toString() {
        return "Greeter for " + name;
    }
}
