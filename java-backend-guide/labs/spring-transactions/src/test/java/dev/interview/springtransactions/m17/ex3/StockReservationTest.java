package dev.interview.springtransactions.m17.ex3;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.support.PostgresTestBase;
import jakarta.persistence.EntityManager;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.function.LongConsumer;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
class StockReservationTest extends PostgresTestBase {

    private static final long ITEM_ID = 1;
    private static final int STOCK = 5;
    private static final int CALLERS = 20;
    private static final String REPETITION = "{displayName} ({currentRepetition}/{totalRepetitions})";
    private static final String CREATE_STOCK_ITEM = "create table if not exists stock_item"
            + " (id bigint primary key, available int not null, version bigint not null default 0)";
    private static final String TRUNCATE_STOCK_ITEM = "truncate stock_item";
    private static final String SEED_STOCK_ITEM =
            "insert into stock_item (id, available) values (%d, %d)".formatted(ITEM_ID, STOCK);
    private static final String READ_AVAILABLE = "select available from stock_item where id = " + ITEM_ID;
    private static final String BUMP_VERSION = "update stock_item set version = version + 1 where id = ?";

    private enum Outcome {
        RESERVED,
        OUT_OF_STOCK,
        CONFLICT
    }

    @Autowired
    private StockReservations reservations;

    @Autowired
    private PessimisticReservation pessimisticReservation;

    @Autowired
    @Qualifier("conflictingReservation")
    private ConflictingReservation conflictingReservation;

    @BeforeAll
    static void createStockItemTable() throws SQLException {
        execute(CREATE_STOCK_ITEM);
    }

    @BeforeEach
    void seed() throws SQLException {
        execute(TRUNCATE_STOCK_ITEM);
        execute(SEED_STOCK_ITEM);
    }

    @RepeatedTest(value = 5, name = REPETITION)
    @DisplayName("Ex17.3 · (1) optimistic with retries: 20 concurrent reservations of 5 units never oversell")
    void optimisticReservations_neverOversell_whenTwentyCallersRace() throws Exception {
        Map<Outcome, Long> outcomes = race(itemId -> reservations.reserve(itemId, 1));

        long reserved = outcomes.getOrDefault(Outcome.RESERVED, 0L);
        assertThat(available()).isNotNegative().isEqualTo(STOCK - reserved);
        assertThat(reserved).isBetween(1L, (long) STOCK);
    }

    @Test
    @DisplayName(
            "Ex17.3 · (2) a conflict on every attempt: 1 + MAX_RETRIES attempts, then ReservationConflictException")
    void reservation_failsWithDomainException_afterMaxRetries() throws SQLException {
        StockReservations facade = new StockReservations(conflictingReservation);

        assertThatThrownBy(() -> facade.reserve(ITEM_ID, 1)).isInstanceOf(ReservationConflictException.class);

        assertThat(conflictingReservation.attempts()).isEqualTo(1 + StockReservations.MAX_RETRIES);
        assertThat(available()).isEqualTo(STOCK);
    }

    @RepeatedTest(value = 5, name = REPETITION)
    @DisplayName("Ex17.3 · (3) pessimistic: the same race reserves exactly 5, the other 15 are out of stock")
    void pessimisticReservations_neverOversell_whenTwentyCallersRace() throws Exception {
        Map<Outcome, Long> outcomes = race(itemId -> pessimisticReservation.reserve(itemId, 1));

        assertThat(available()).isZero();
        assertThat(outcomes)
                .containsExactlyInAnyOrderEntriesOf(
                        Map.of(Outcome.RESERVED, (long) STOCK, Outcome.OUT_OF_STOCK, (long) (CALLERS - STOCK)));
    }

    // Every caller waits at one latch, so the reservations overlap as much as the pool allows.
    private static Map<Outcome, Long> race(LongConsumer reserve) throws InterruptedException, ExecutionException {
        CountDownLatch start = new CountDownLatch(1);
        List<Future<Outcome>> futures = new ArrayList<>();
        try (ExecutorService callers = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int caller = 0; caller < CALLERS; caller++) {
                futures.add(callers.submit(() -> {
                    start.await();
                    return attempt(reserve);
                }));
            }
            start.countDown();
            List<Outcome> outcomes = new ArrayList<>();
            for (Future<Outcome> future : futures) {
                outcomes.add(future.get());
            }
            return outcomes.stream().collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
        }
    }

    // Any other exception propagates and fails the test: it is not a permitted outcome.
    private static Outcome attempt(LongConsumer reserve) {
        try {
            reserve.accept(ITEM_ID);
            return Outcome.RESERVED;
        } catch (OutOfStockException outOfStock) {
            return Outcome.OUT_OF_STOCK;
        } catch (ReservationConflictException conflict) {
            return Outcome.CONFLICT;
        }
    }

    private static long available() throws SQLException {
        try (Connection connection = openConnection()) {
            return countRows(connection, READ_AVAILABLE);
        }
    }

    private static void execute(String sql) throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }

    @TestConfiguration
    static class ConflictConfig {

        // Not a default candidate, so StockReservations still receives the real OptimisticReservation.
        @Bean(defaultCandidate = false)
        ConflictingReservation conflictingReservation(EntityManager entityManager) {
            return new ConflictingReservation(entityManager);
        }
    }

    /** Commits a version bump from another connection inside every attempt, so every commit check fails. */
    static class ConflictingReservation extends OptimisticReservation {

        private final AtomicInteger attempts = new AtomicInteger();

        ConflictingReservation(EntityManager entityManager) {
            super(entityManager);
        }

        @Override
        @Transactional
        public void reserve(long itemId, int units) {
            attempts.incrementAndGet();
            super.reserve(itemId, units);
            bumpVersion(itemId);
        }

        int attempts() {
            return attempts.get();
        }

        private static void bumpVersion(long itemId) {
            try (Connection connection = openConnection();
                    PreparedStatement statement = connection.prepareStatement(BUMP_VERSION)) {
                statement.setLong(1, itemId);
                statement.executeUpdate();
            } catch (SQLException error) {
                throw new IllegalStateException(error);
            }
        }
    }
}
