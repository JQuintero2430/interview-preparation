package dev.interview.javalanguage.m02.s07;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** Module 02 §7: a hand-written builder for an immutable class; build() copies the builder's state. */
public final class Notification {

    public static final int DEFAULT_PRIORITY = 3;

    private static final String MISSING_RECIPIENT = "missing required field: recipient";
    private static final String EMPTY = "";
    private static final String TAG = "tag";

    private final String recipient;
    private final String subject;
    private final int priority;
    private final List<String> tags;

    private Notification(Builder builder) {
        this.recipient = builder.recipient;
        this.subject = builder.subject;
        this.priority = builder.priority;
        this.tags = List.copyOf(builder.tags);
    }

    public static Builder builder() {
        return new Builder();
    }

    public String recipient() {
        return recipient;
    }

    public String subject() {
        return subject;
    }

    public int priority() {
        return priority;
    }

    public List<String> tags() {
        return tags;
    }

    /** Mutable and reusable: each build() snapshots the current state. */
    public static final class Builder {

        private String recipient;
        private String subject = EMPTY;
        private int priority = DEFAULT_PRIORITY;
        private final List<String> tags = new ArrayList<>();

        private Builder() {}

        public Builder recipient(String recipient) {
            this.recipient = recipient;
            return this;
        }

        public Builder subject(String subject) {
            this.subject = subject;
            return this;
        }

        public Builder priority(int priority) {
            this.priority = priority;
            return this;
        }

        public Builder tag(String tag) {
            tags.add(Objects.requireNonNull(tag, TAG));
            return this;
        }

        public Notification build() {
            if (recipient == null) {
                throw new IllegalStateException(MISSING_RECIPIENT);
            }
            return new Notification(this);
        }
    }
}
