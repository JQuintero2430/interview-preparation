package dev.interview.springtransactions.m17.s14;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** A booked seat; the table has a unique constraint on {@code seat}. */
@Entity
public class Ticket {

    @Id
    private Long id;

    private String seat;

    protected Ticket() {}

    public Ticket(long id, String seat) {
        this.id = id;
        this.seat = seat;
    }
}
