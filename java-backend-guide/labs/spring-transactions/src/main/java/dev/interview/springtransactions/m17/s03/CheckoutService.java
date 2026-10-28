package dev.interview.springtransactions.m17.s03;

import org.springframework.transaction.annotation.Transactional;

public class CheckoutService {

    @Transactional
    public TxSnapshot placeOrder() {
        return TxSnapshot.current();
    }

    @jakarta.transaction.Transactional
    public TxSnapshot placeOrderWithJakartaAnnotation() {
        return TxSnapshot.current();
    }

    public TxSnapshot quote() {
        return TxSnapshot.current();
    }
}
