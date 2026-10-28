package dev.interview.springtransactions.m17.s04;

import dev.interview.springtransactions.m17.s03.TxSnapshot;
import java.time.Clock;
import java.time.Instant;
import org.springframework.transaction.annotation.Transactional;

/** Every way a @Transactional method on this class runs without a transaction. */
public class OrderWorkflow {

    private final Clock clock;

    public OrderWorkflow(Clock clock) {
        this.clock = clock;
    }

    public TxSnapshot placeOrder() {
        return saveOrder(); // self-invocation: `this` is the target, not the proxy
    }

    @Transactional
    public TxSnapshot saveOrder() {
        return TxSnapshot.current();
    }

    @Transactional
    protected TxSnapshot saveProtected() {
        return TxSnapshot.current();
    }

    @Transactional
    private TxSnapshot savePrivate() {
        return TxSnapshot.current();
    }

    @Transactional
    public final TxSnapshot saveFinal() {
        return TxSnapshot.current();
    }

    @Transactional
    public final Instant stampFinal() {
        return clock.instant(); // on the proxy instance `clock` is null
    }

    @Transactional
    public static TxSnapshot saveStatic() {
        return TxSnapshot.current();
    }
}
