package dev.interview.javalanguage.m05.s03;

import java.util.function.Consumer;

// Same delivery written two ways: they differ in when current is read.
public final class Router {

    private Mailbox current;

    public Router(Mailbox current) {
        this.current = current;
    }

    public void switchTo(Mailbox next) {
        this.current = next;
    }

    // Reads current once, now, and keeps that Mailbox. Throws here if current is null.
    public Consumer<String> viaReference() {
        return current::accept;
    }

    // Reads current at every call. Throws only when called with current null.
    public Consumer<String> viaLambda() {
        return message -> current.accept(message);
    }
}
