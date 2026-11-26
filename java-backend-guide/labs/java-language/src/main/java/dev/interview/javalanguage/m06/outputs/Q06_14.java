package dev.interview.javalanguage.m06.outputs;

import java.io.IOException;
import java.io.Serial;
import java.util.List;

// Module 06 Q06.14: a service that catches, logs and returns null, and the version that lets the boundary decide.
public final class Q06_14 {

    private Q06_14() {}

    public interface Inventory {
        int fetch(String sku) throws IOException, InterruptedException;
    }

    public static final class StockService {
        private final Inventory inventory;
        private final List<String> log;

        public StockService(Inventory inventory, List<String> log) {
            this.inventory = inventory;
            this.log = log;
        }

        public Integer availableStock(String sku) {
            try {
                return inventory.fetch(sku);
            } catch (Exception e) {
                log.add("could not fetch stock for " + sku + ": " + e.getMessage());
                return null;
            }
        }
    }

    public static final class StockUnavailableException extends RuntimeException {
        @Serial
        private static final long serialVersionUID = 1L;

        public StockUnavailableException(String sku, Throwable cause) {
            super("stock unavailable for " + sku, cause);
        }
    }

    public static final class FixedStockService {
        private final Inventory inventory;

        public FixedStockService(Inventory inventory) {
            this.inventory = inventory;
        }

        public int availableStock(String sku) throws InterruptedException {
            try {
                return inventory.fetch(sku);
            } catch (IOException e) {
                throw new StockUnavailableException(sku, e);
            }
        }
    }
}
