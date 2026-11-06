package dev.interview.springtransactions.m17.s14;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

/** Stands in for an e-mail sent after the booking commits. */
@Component
public class BookingNotifier {

    private final List<String> notified = new CopyOnWriteArrayList<>();

    @TransactionalEventListener // phase = AFTER_COMMIT
    public void onBooked(TicketBooked event) {
        notified.add(event.seat());
    }

    public List<String> notified() {
        return List.copyOf(notified);
    }

    public void clear() {
        notified.clear();
    }
}
