package dev.interview.springtransactions.m17.ex2;

import java.lang.System.Logger.Level;
import org.springframework.dao.DataAccessException;

/** Not transactional on purpose: the order transaction ends, and its connection is back, before the audit. */
public class CheckoutService {

    public static final String ORDER_PLACED = "order placed";
    public static final String ORDER_FAILED = "order failed";

    private static final System.Logger LOG = System.getLogger(CheckoutService.class.getName());

    private final OrderPlacement placement;
    private final AuditTrail auditTrail;

    public CheckoutService(OrderPlacement placement, AuditTrail auditTrail) {
        this.placement = placement;
        this.auditTrail = auditTrail;
    }

    public void checkout(long orderId, String customer, String sku, int quantity) {
        try {
            placement.place(orderId, customer, sku, quantity);
        } catch (RuntimeException failure) {
            audit(orderId, ORDER_FAILED);
            throw failure;
        }
        audit(orderId, ORDER_PLACED);
    }

    // The order is already decided, so a failed audit is reported, never turned into a failed checkout.
    private void audit(long orderId, String action) {
        try {
            auditTrail.record(orderId, action);
        } catch (DataAccessException unavailable) {
            LOG.log(Level.WARNING, "audit not written for order " + orderId + ": " + action, unavailable);
        }
    }
}
