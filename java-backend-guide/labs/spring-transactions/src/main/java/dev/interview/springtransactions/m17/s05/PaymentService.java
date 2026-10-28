package dev.interview.springtransactions.m17.s05;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

public class PaymentService {

    @Transactional
    public void chargeDefault() throws PaymentException {
        throw new PaymentException("card declined");
    }

    @Transactional(rollbackFor = PaymentException.class)
    public void chargeWithRollbackFor() throws PaymentException {
        throw new PaymentException("card declined");
    }

    @Transactional
    public void chargeAndCancel() {
        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
    }
}
