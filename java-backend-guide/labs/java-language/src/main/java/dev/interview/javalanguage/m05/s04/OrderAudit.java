package dev.interview.javalanguage.m05.s04;

import java.util.List;

// Counts processed orders and writes one audit line per order: three broken versions and a fixed one.
public final class OrderAudit {

    private final List<String> auditLog;

    public OrderAudit(List<String> auditLog) {
        this.auditLog = auditLog;
    }

    // Broken: the audit is a side effect in peek, and count() may skip the pipeline of a sized source.
    public long countWithPeekAudit(List<String> orderIds) {
        return orderIds.stream().peek(this::audit).count();
    }

    // Still broken: map does not change the number of elements either, so count() may skip it too.
    public long countWithMapAudit(List<String> orderIds) {
        return orderIds.stream().map(this::auditAndReturn).count();
    }

    // Runs the audit, but only because filter makes the size unknown: correct by accident.
    public long countPaidWithPeekAudit(List<String> orderIds) {
        return orderIds.stream()
                .peek(this::audit)
                .filter(id -> id.endsWith(":paid"))
                .count();
    }

    // Fixed: the side effect is the job of forEach, which runs its action for every element.
    public long auditThenCount(List<String> orderIds) {
        orderIds.forEach(this::audit);
        return orderIds.size();
    }

    private void audit(String orderId) {
        auditLog.add("processed " + orderId);
    }

    private String auditAndReturn(String orderId) {
        audit(orderId);
        return orderId;
    }
}
