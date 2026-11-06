package dev.interview.springtransactions.m17.ex4;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

/** Sends the confirmation once the order's transaction has committed. */
@Component
public class OrderConfirmations {

    private final ConfirmationChannel channel;

    public OrderConfirmations(ConfirmationChannel channel) {
        this.channel = channel;
    }

    @TransactionalEventListener // phase = AFTER_COMMIT: never on rollback
    public void onOrderPlaced(OrderPlaced event) {
        channel.send(event.orderId());
    }
}
