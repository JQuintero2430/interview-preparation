package dev.interview.springtransactions.m17.s11;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.transaction.event.TransactionalEventListener;

public class ConfirmationSender {

    private final List<String> sent = new CopyOnWriteArrayList<>();

    @TransactionalEventListener // phase = AFTER_COMMIT, fallbackExecution = false
    public void onOrderPlaced(OrderPlaced event) {
        sent.add(event.orderId()); // stands in for an e-mail or a broker send
    }

    public List<String> sent() {
        return List.copyOf(sent);
    }
}
