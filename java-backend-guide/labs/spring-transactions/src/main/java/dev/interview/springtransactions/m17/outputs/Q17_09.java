package dev.interview.springtransactions.m17.outputs;

import org.springframework.transaction.annotation.Transactional;

/** Q17.09: a checked exception leaves a @Transactional method, without and with rollbackFor. */
public class Q17_09 {

    private static final String FAILURE = "supplier feed unreadable";

    @Transactional
    public void importPrices() throws FeedException {
        throw new FeedException(FAILURE);
    }

    @Transactional(rollbackFor = FeedException.class)
    public void importPricesRollingBack() throws FeedException {
        throw new FeedException(FAILURE);
    }

    /** A checked exception: the default rollback rule does not match it. */
    public static class FeedException extends Exception {

        public FeedException(String message) {
            super(message);
        }
    }
}
