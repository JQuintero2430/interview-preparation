package dev.interview.springtransactions.m17.outputs;

import dev.interview.springtransactions.m17.s03.TxSnapshot;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Q17.06: a REQUIRES_NEW method called on `this`. */
public class Q17_06 {

    @Transactional
    public String placeOrder() {
        return writeAudit().name(); // self-invocation: the proxy never sees this call
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public TxSnapshot writeAudit() {
        return TxSnapshot.current();
    }
}
