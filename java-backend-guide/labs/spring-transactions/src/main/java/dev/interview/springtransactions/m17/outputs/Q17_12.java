package dev.interview.springtransactions.m17.outputs;

import dev.interview.springtransactions.m17.s03.TxSnapshot;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

/** Q17.12: two fixes for a self-invoked REQUIRES_NEW method that keep the code in one class. */
public class Q17_12 {

    private static final String AUDIT_TX_NAME = "audit";

    private final ObjectProvider<Q17_12> self; // resolves to this bean's proxy at call time
    private final TransactionTemplate requiresNew;

    public Q17_12(ObjectProvider<Q17_12> self, PlatformTransactionManager transactionManager) {
        this.self = self;
        this.requiresNew = new TransactionTemplate(transactionManager);
        this.requiresNew.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        this.requiresNew.setName(AUDIT_TX_NAME);
    }

    @Transactional
    public String placeOrderViaSelf() {
        return self.getObject().writeAudit().name(); // through the proxy: the attribute is read
    }

    @Transactional
    public String placeOrderViaTemplate() {
        return requiresNew.execute(status -> TxSnapshot.current().name()); // the boundary is this call
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public TxSnapshot writeAudit() {
        return TxSnapshot.current();
    }
}
