package dev.interview.javalanguage.m01.s08;

// Module 01 §8: one call of each kind, disassembled by BytecodeDispatchTest.
public final class DispatchSample {

    private final Runnable audit;

    public DispatchSample(Runnable audit) {
        this.audit = audit;
    }

    public long total(Payment payment) {
        audit.run();
        return FeeTable.feeCents(payment) + payment.feeCents() + surcharge();
    }

    private long surcharge() {
        return 0;
    }
}
