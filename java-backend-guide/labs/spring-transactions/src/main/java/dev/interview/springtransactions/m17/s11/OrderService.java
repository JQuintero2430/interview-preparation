package dev.interview.springtransactions.m17.s11;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;

public class OrderService {

    private final ApplicationEventPublisher events;

    public OrderService(ApplicationEventPublisher events) {
        this.events = events;
    }

    @Transactional
    public void place(String orderId) {
        events.publishEvent(new OrderPlaced(orderId)); // held until the transaction completes
    }

    @Transactional
    public void placeThenFail(String orderId) {
        events.publishEvent(new OrderPlaced(orderId));
        throw new IllegalStateException("payment declined");
    }

    public void placeWithoutTransaction(String orderId) {
        events.publishEvent(new OrderPlaced(orderId));
    }
}
