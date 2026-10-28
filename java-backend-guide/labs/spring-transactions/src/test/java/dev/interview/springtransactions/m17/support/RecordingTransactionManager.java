package dev.interview.springtransactions.m17.support;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.transaction.SavepointManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;
import org.springframework.transaction.support.SmartTransactionObject;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * A transaction manager with no database: it records every decision AbstractPlatformTransactionManager takes
 * ("begin tx1", "suspend tx1", "savepoint sp1", "commit tx2", ...) so tests can assert propagation, rollback
 * rules and synchronization without Docker. Like DataSourceTransactionManager, it binds its resource to the
 * current thread through TransactionSynchronizationManager, keyed by itself.
 */
public class RecordingTransactionManager extends AbstractPlatformTransactionManager {

    private final List<String> events = new CopyOnWriteArrayList<>();
    private final AtomicInteger transactionIds = new AtomicInteger();
    private final AtomicInteger savepointIds = new AtomicInteger();

    public RecordingTransactionManager() {
        setNestedTransactionAllowed(true);
    }

    public List<String> events() {
        return List.copyOf(events);
    }

    public void clear() {
        events.clear();
    }

    @Override
    protected Object doGetTransaction() {
        return new TxObject((Holder) TransactionSynchronizationManager.getResource(this));
    }

    @Override
    protected boolean isExistingTransaction(Object transaction) {
        return ((TxObject) transaction).holder != null;
    }

    @Override
    protected void doBegin(Object transaction, TransactionDefinition definition) {
        Holder holder = new Holder("tx" + transactionIds.incrementAndGet());
        ((TxObject) transaction).holder = holder;
        TransactionSynchronizationManager.bindResource(this, holder);
        events.add("begin " + holder.name);
    }

    @Override
    protected Object doSuspend(Object transaction) {
        Holder holder = (Holder) TransactionSynchronizationManager.unbindResource(this);
        ((TxObject) transaction).holder = null;
        events.add("suspend " + holder.name);
        return holder;
    }

    @Override
    protected void doResume(Object transaction, Object suspendedResources) {
        Holder holder = (Holder) suspendedResources;
        TransactionSynchronizationManager.bindResource(this, holder);
        events.add("resume " + holder.name);
    }

    @Override
    protected void doCommit(DefaultTransactionStatus status) {
        events.add("commit " + holderOf(status).name);
    }

    @Override
    protected void doRollback(DefaultTransactionStatus status) {
        events.add("rollback " + holderOf(status).name);
    }

    @Override
    protected void doSetRollbackOnly(DefaultTransactionStatus status) {
        Holder holder = holderOf(status);
        holder.rollbackOnly = true;
        events.add("set rollback-only " + holder.name);
    }

    @Override
    protected void doCleanupAfterCompletion(Object transaction) {
        TransactionSynchronizationManager.unbindResource(this);
    }

    private static Holder holderOf(DefaultTransactionStatus status) {
        return ((TxObject) status.getTransaction()).holder;
    }

    private static final class Holder {
        private final String name;
        private boolean rollbackOnly;

        private Holder(String name) {
            this.name = name;
        }
    }

    private final class TxObject implements SmartTransactionObject, SavepointManager {
        private Holder holder;

        private TxObject(Holder holder) {
            this.holder = holder;
        }

        @Override
        public boolean isRollbackOnly() {
            return holder != null && holder.rollbackOnly;
        }

        @Override
        public void flush() {
            events.add("flush " + holder.name);
        }

        @Override
        public Object createSavepoint() {
            String savepoint = "sp" + savepointIds.incrementAndGet();
            events.add("savepoint " + savepoint);
            return savepoint;
        }

        @Override
        public void rollbackToSavepoint(Object savepoint) {
            events.add("rollback to " + savepoint);
        }

        @Override
        public void releaseSavepoint(Object savepoint) {
            events.add("release " + savepoint);
        }
    }
}
