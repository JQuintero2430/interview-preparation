package dev.interview.springtransactions.m17.outputs;

import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Q17.11: what the thread reports inside a real transaction and inside SUPPORTS without one. */
public class Q17_11 {

    @Transactional
    public Probe required() {
        return Probe.current();
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public Probe supports() {
        return Probe.current();
    }

    public record Probe(boolean actualTransaction, boolean synchronization) {

        static Probe current() {
            return new Probe(
                    TransactionSynchronizationManager.isActualTransactionActive(),
                    TransactionSynchronizationManager.isSynchronizationActive());
        }
    }
}
