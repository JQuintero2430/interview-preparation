package dev.interview.javalanguage.m05.outputs;

import java.util.Optional;

// Module 05 Q05.29: orElse evaluates its argument before the call; orElseGet runs its supplier only when empty.
public final class Q05_29 {

    private int calls;

    public static void main(String[] args) {
        new Q05_29().run();
    }

    void run() {
        Optional<String> present = Optional.of("cached");
        Optional<String> empty = Optional.empty();
        System.out.println(present.orElse(loadDefault()));
        System.out.println(present.orElseGet(this::loadDefault));
        System.out.println(empty.orElse(loadDefault()));
        System.out.println(empty.orElseGet(this::loadDefault));
        System.out.println("calls " + calls);
    }

    String loadDefault() {
        calls++;
        System.out.println("loadDefault #" + calls);
        return "default";
    }
}
