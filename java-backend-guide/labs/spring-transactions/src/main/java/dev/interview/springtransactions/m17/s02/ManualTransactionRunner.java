package dev.interview.springtransactions.m17.s02;

import java.util.function.Supplier;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;

/** The begin/commit/rollback template that TransactionTemplate and the @Transactional interceptor implement. */
public final class ManualTransactionRunner {

    private final PlatformTransactionManager transactionManager;

    public ManualTransactionRunner(PlatformTransactionManager transactionManager) {
        this.transactionManager = transactionManager;
    }

    public <T> T inTransaction(TransactionDefinition definition, Supplier<T> work) {
        TransactionStatus status = transactionManager.getTransaction(definition);
        T result;
        try {
            result = work.get();
        } catch (RuntimeException | Error ex) {
            transactionManager.rollback(status);
            throw ex;
        }
        transactionManager.commit(status);
        return result;
    }
}
