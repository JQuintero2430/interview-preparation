package dev.interview.javalanguage.m01.outputs;

import java.util.ArrayList;
import java.util.List;

// Q01.13: an overridable method called from a super constructor runs before subclass field initializers.
public final class Q01_13 {

    private Q01_13() {}

    abstract static class Handler {
        Handler() {
            register();
        }

        abstract void register();
    }

    static final class AuditHandler extends Handler {
        private final List<String> topics = new ArrayList<>();

        @Override
        void register() {
            topics.add("audit");
        }

        List<String> topics() {
            return topics;
        }
    }

    // Java 25 flexible constructor bodies allow assigning a field before super().
    static final class FixedAuditHandler extends Handler {
        private final List<String> topics;

        FixedAuditHandler() {
            topics = new ArrayList<>();
            super();
        }

        @Override
        void register() {
            topics.add("audit");
        }

        List<String> topics() {
            return topics;
        }
    }

    public static void main(String[] args) {
        new AuditHandler();
    }
}
