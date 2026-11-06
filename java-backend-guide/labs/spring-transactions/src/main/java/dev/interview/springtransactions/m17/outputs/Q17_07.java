package dev.interview.springtransactions.m17.outputs;

import dev.interview.springtransactions.m17.s03.TxSnapshot;
import org.springframework.transaction.annotation.Transactional;

/** Q17.07: three annotated methods, called through a class-based proxy. */
public class Q17_07 {

    @Transactional
    private TxSnapshot reserveStock() {
        return TxSnapshot.current();
    }

    @Transactional
    public final TxSnapshot chargeCard() {
        return TxSnapshot.current();
    }

    @Transactional
    protected TxSnapshot shipOrder() {
        return TxSnapshot.current();
    }
}
