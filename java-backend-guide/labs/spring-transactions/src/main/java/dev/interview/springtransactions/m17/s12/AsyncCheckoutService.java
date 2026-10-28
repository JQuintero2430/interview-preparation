package dev.interview.springtransactions.m17.s12;

import dev.interview.springtransactions.m17.s03.TxSnapshot;
import java.util.concurrent.CompletableFuture;
import org.springframework.transaction.annotation.Transactional;

public class AsyncCheckoutService {

    private final InvoiceService invoices;

    public AsyncCheckoutService(InvoiceService invoices) {
        this.invoices = invoices;
    }

    @Transactional
    public CompletableFuture<TxSnapshot> placeOrder() {
        return invoices.renderInvoice(); // does not join this transaction
    }
}
