package dev.interview.javalanguage.m05.s03;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.function.Supplier;

public final class Mailbox {

    private final List<String> messages = new ArrayList<>();

    public void accept(String message) {
        messages.add(message);
    }

    public List<String> received() {
        return List.copyOf(messages);
    }

    // Bound: this is the receiver, so the function takes no arguments.
    public Supplier<List<String>> ownInbox() {
        return this::received;
    }

    // Unbound: the caller passes the receiver as the first argument.
    public static Function<Mailbox, List<String>> anyInbox() {
        return Mailbox::received;
    }
}
