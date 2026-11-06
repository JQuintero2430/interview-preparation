package dev.interview.springtransactions.m17.s08;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.support.TransactionOperations;

public class PriceImport {

    private static final String UPDATE_PRICE = "update product set price = ? where name = ?";
    private static final String CHUNK_SIZE_TOO_SMALL = "chunkSize must be at least 1";

    private final TransactionOperations tx;
    private final JdbcClient jdbc;

    public PriceImport(TransactionOperations tx, JdbcClient jdbc) {
        this.tx = tx;
        this.jdbc = jdbc;
    }

    // One transaction per chunk, not one per import: a bad row costs only its chunk, and no transaction holds
    // locks or a pooled connection for the whole file. A @Transactional method cannot draw this boundary
    // inside a loop, which is why the template is used.
    public int importInChunks(List<PriceChange> changes, int chunkSize) {
        if (chunkSize < 1) {
            throw new IllegalArgumentException(CHUNK_SIZE_TOO_SMALL);
        }
        int committed = 0;
        for (int start = 0; start < changes.size(); start += chunkSize) {
            List<PriceChange> chunk = changes.subList(start, Math.min(start + chunkSize, changes.size()));
            if (commitChunk(chunk)) {
                committed++;
            }
        }
        return committed;
    }

    // A failed chunk is skipped, not rethrown: the import reports how many chunks landed, and the caller
    // decides whether to replay the rest.
    private boolean commitChunk(List<PriceChange> chunk) {
        try {
            tx.executeWithoutResult(status -> chunk.forEach(this::apply));
            return true;
        } catch (DataAccessException rolledBack) {
            return false;
        }
    }

    private void apply(PriceChange change) {
        jdbc.sql(UPDATE_PRICE).params(change.price(), change.name()).update();
    }

    public record PriceChange(String name, BigDecimal price) {}
}
