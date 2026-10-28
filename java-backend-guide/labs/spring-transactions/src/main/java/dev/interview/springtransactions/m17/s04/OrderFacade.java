package dev.interview.springtransactions.m17.s04;

import dev.interview.springtransactions.m17.s03.TxSnapshot;

/** The fix for self-invocation: the transactional method lives in another bean, so the call crosses a proxy. */
public class OrderFacade {

    private final OrderWriter writer;

    public OrderFacade(OrderWriter writer) {
        this.writer = writer;
    }

    public TxSnapshot placeOrder() {
        return writer.saveOrder();
    }
}
