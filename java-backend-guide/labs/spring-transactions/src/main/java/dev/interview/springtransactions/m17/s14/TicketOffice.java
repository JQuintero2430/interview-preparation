package dev.interview.springtransactions.m17.s14;

import jakarta.persistence.EntityManager;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Books a seat: persists the ticket, audits in a separate transaction, and notifies after commit. */
@Service
public class TicketOffice {

    private final EntityManager entityManager;
    private final ApplicationEventPublisher events;
    private final BookingAudit audit;

    public TicketOffice(EntityManager entityManager, ApplicationEventPublisher events, BookingAudit audit) {
        this.entityManager = entityManager;
        this.events = events;
        this.audit = audit;
    }

    @Transactional
    public void book(long id, String seat) {
        entityManager.persist(new Ticket(id, seat)); // the INSERT waits for the next flush
        audit.record(seat);
        events.publishEvent(new TicketBooked(seat));
    }
}
