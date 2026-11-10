package dev.interview.javalanguage.m02.s07;

import java.util.Objects;

/** Module 02 §7: withers copy a record through the canonical constructor, so its checks run again. */
public record Ticket(String id, Status status, String assignee) {

    private static final String ID = "id";
    private static final String STATUS = "status";

    /** Lifecycle states of a ticket. */
    public enum Status {
        OPEN,
        IN_PROGRESS,
        CLOSED
    }

    public Ticket {
        Objects.requireNonNull(id, ID);
        Objects.requireNonNull(status, STATUS);
    }

    public Ticket withStatus(Status newStatus) {
        return new Ticket(id, newStatus, assignee);
    }

    public Ticket withAssignee(String newAssignee) {
        return new Ticket(id, status, newAssignee);
    }
}
