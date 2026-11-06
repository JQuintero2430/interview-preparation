package dev.interview.springtransactions.m17.ex4;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.springtransactions.m17.support.PostgresTestBase;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
class IdempotentOrdersTest extends PostgresTestBase {

    private static final String CLIENT = "client-a";
    private static final String KEY = "5d1e-order-1";
    private static final int CALLERS = 8;
    private static final String REPETITION = "{displayName} ({currentRepetition}/{totalRepetitions})";
    private static final String CREATE_REQUESTS = "create table if not exists order_request"
            + " (client_id text not null, idempotency_key text not null, order_id bigint not null,"
            + " primary key (client_id, idempotency_key))";
    private static final String CREATE_SEQUENCE = "create sequence if not exists order_id_seq";
    private static final String TRUNCATE = "truncate order_request, order_line, orders";
    private static final String COUNT_ORDERS = "select count(*) from orders";
    private static final String COUNT_REQUESTS = "select count(*) from order_request";
    private static final String COUNT_ORDER = "select count(*) from orders where id = ?";

    @Autowired
    private IdempotentOrders orders;

    @Autowired
    private CommitCheckingChannel channel;

    @Autowired
    private FailingCaller failingCaller;

    // Test-local DDL, like s13 and ex3: the shared schema.sql holds only the tables every M17 test uses.
    @BeforeAll
    static void createSchema() throws SQLException {
        execute(CREATE_REQUESTS);
        execute(CREATE_SEQUENCE);
    }

    @BeforeEach
    void reset() throws SQLException {
        execute(TRUNCATE);
        channel.clear();
    }

    @Test
    @DisplayName("Ex17.4 · (1) the same key twice: one order, the same receipt, one confirmation")
    void place_returnsSameReceipt_whenKeyRepeated() throws SQLException {
        OrderReceipt first = orders.place(order(1));
        OrderReceipt replay = orders.place(order(1));

        assertThat(replay).isEqualTo(first);
        assertThat(count(COUNT_ORDERS)).isEqualTo(1);
        assertThat(channel.committedCounts()).containsExactly(1L);
    }

    @RepeatedTest(value = 5, name = REPETITION)
    @DisplayName("Ex17.4 · (2) 8 concurrent duplicates: one order, one request row, every caller the same receipt")
    void place_createsOneOrder_whenDuplicatesRace() throws Exception {
        CountDownLatch start = new CountDownLatch(1);
        List<Future<OrderReceipt>> futures = new ArrayList<>();
        try (ExecutorService callers = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int caller = 0; caller < CALLERS; caller++) {
                futures.add(callers.submit(() -> {
                    start.await();
                    return orders.place(order(1));
                }));
            }
            start.countDown();
            List<OrderReceipt> receipts = new ArrayList<>();
            for (Future<OrderReceipt> future : futures) {
                receipts.add(future.get());
            }
            assertThat(receipts).hasSize(CALLERS).containsOnly(receipts.getFirst());
        }
        assertThat(count(COUNT_ORDERS)).isEqualTo(1);
        assertThat(count(COUNT_REQUESTS)).isEqualTo(1);
        assertThat(channel.committedCounts()).containsExactly(1L);
    }

    @Test
    @DisplayName("Ex17.4 · (3) the confirmation runs after commit and never on rollback; the key stays reusable")
    void confirmation_followsCommit_andSkipsRollback() throws SQLException {
        assertThatThrownBy(() -> orders.place(order(0))).isInstanceOf(DataIntegrityViolationException.class);
        // the event is already published here, then the caller's transaction rolls back
        assertThatThrownBy(() -> failingCaller.placeThenFail(order(1))).isInstanceOf(IllegalStateException.class);

        assertThat(count(COUNT_ORDERS)).isZero();
        assertThat(count(COUNT_REQUESTS)).isZero();
        assertThat(channel.committedCounts()).isEmpty();

        orders.place(order(1));

        // 1 = another connection already saw the order row when the confirmation was sent
        assertThat(channel.committedCounts()).containsExactly(1L);
    }

    private static PlaceOrder order(int quantity) {
        return new PlaceOrder(CLIENT, KEY, "alice", "sku-1", quantity);
    }

    private static long count(String countQuery) throws SQLException {
        try (Connection connection = openConnection()) {
            return countRows(connection, countQuery);
        }
    }

    private static void execute(String sql) throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }

    @TestConfiguration
    static class ChannelConfig {

        @Bean
        @Primary
        CommitCheckingChannel commitCheckingChannel() {
            return new CommitCheckingChannel();
        }

        @Bean
        FailingCaller failingCaller(IdempotentOrders orders) {
            return new FailingCaller(orders);
        }
    }

    /** Joins place() into its own transaction and fails after the event is published, so everything rolls back. */
    static class FailingCaller {

        private final IdempotentOrders orders;

        FailingCaller(IdempotentOrders orders) {
            this.orders = orders;
        }

        @Transactional
        public void placeThenFail(PlaceOrder order) {
            orders.place(order);
            throw new IllegalStateException("payment declined after the order was placed");
        }
    }

    /** Records, per confirmation, how many rows of that order a separate connection sees: 1 only after commit. */
    static class CommitCheckingChannel implements ConfirmationChannel {

        private final List<Long> committedCounts = new CopyOnWriteArrayList<>();

        @Override
        public void send(long orderId) {
            try (Connection connection = openConnection();
                    PreparedStatement statement = connection.prepareStatement(COUNT_ORDER)) {
                statement.setLong(1, orderId);
                try (ResultSet rows = statement.executeQuery()) {
                    rows.next();
                    committedCounts.add(rows.getLong(1));
                }
            } catch (SQLException error) {
                throw new IllegalStateException(error);
            }
        }

        List<Long> committedCounts() {
            return List.copyOf(committedCounts);
        }

        void clear() {
            committedCounts.clear();
        }
    }
}
