package dev.interview.springtransactions.m17.s04;

import dev.interview.springtransactions.m17.s03.TxSnapshot;
import org.springframework.transaction.annotation.Transactional;

public class OrderWriter {

    @Transactional
    public TxSnapshot saveOrder() {
        return TxSnapshot.current();
    }
}
