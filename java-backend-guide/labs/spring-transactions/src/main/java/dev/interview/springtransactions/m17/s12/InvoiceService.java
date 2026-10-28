package dev.interview.springtransactions.m17.s12;

import dev.interview.springtransactions.m17.s03.TxSnapshot;
import java.util.concurrent.CompletableFuture;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.annotation.Transactional;

public class InvoiceService {

    @Async // the async advisor runs first, so the transaction begins on the executor thread
    @Transactional
    public CompletableFuture<TxSnapshot> renderInvoice() {
        return CompletableFuture.completedFuture(TxSnapshot.current());
    }
}
