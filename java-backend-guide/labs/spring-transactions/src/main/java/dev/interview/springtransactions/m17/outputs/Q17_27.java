package dev.interview.springtransactions.m17.outputs;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

/** Q17.27: the same event published after a commit, before a rollback, and with no transaction. */
public class Q17_27 {

    private static final String FAILURE = "payment declined";

    private final ApplicationEventPublisher events;

    public Q17_27(ApplicationEventPublisher events) {
        this.events = events;
    }

    @Transactional
    public void place(String orderId) {
        events.publishEvent(new OrderPlaced(orderId));
    }

    @Transactional
    public void placeThenFail(String orderId) {
        events.publishEvent(new OrderPlaced(orderId));
        throw new IllegalStateException(FAILURE);
    }

    public void placeWithoutTransaction(String orderId) {
        events.publishEvent(new OrderPlaced(orderId));
    }

    public record OrderPlaced(String orderId) {}

    public static class Listeners {

        private final List<String> confirmed = new CopyOnWriteArrayList<>();
        private final List<String> audited = new CopyOnWriteArrayList<>();

        @TransactionalEventListener // phase = AFTER_COMMIT, fallbackExecution = false
        public void confirm(OrderPlaced event) {
            confirmed.add(event.orderId());
        }

        @TransactionalEventListener(fallbackExecution = true)
        public void audit(OrderPlaced event) {
            audited.add(event.orderId());
        }

        public List<String> confirmed() {
            return List.copyOf(confirmed);
        }

        public List<String> audited() {
            return List.copyOf(audited);
        }
    }
}
