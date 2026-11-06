package dev.interview.springtransactions.m17.s08;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.zaxxer.hikari.HikariDataSource;
import dev.interview.springtransactions.m17.s08.PriceImport.PriceChange;
import dev.interview.springtransactions.m17.support.PostgresTestBase;
import dev.interview.springtransactions.m17.support.RecordingTransactionManager;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

class PriceImportTest extends PostgresTestBase {

    private static final int POOL_SIZE = 2;
    private static final int CHUNK_OF_TWO = 2;
    private static final int CHUNK_OF_THREE = 3;
    private static final int CHUNK_OF_TEN = 10;
    private static final String CREATE_PRODUCT = "create table if not exists product (id bigint primary key,"
            + " name text not null unique, price numeric(10, 2) not null check (price >= 0))";
    private static final String TRUNCATE_PRODUCT = "truncate product";
    private static final String SEED_PRODUCT =
            "insert into product values (1, 'a', 10), (2, 'b', 10), (3, 'c', 10), (4, 'd', 10)";
    private static final String COUNT_AT_TEN = "select count(*) from product where price = 10";
    private static final String COUNT_AT_TWENTY = "select count(*) from product where price = 20";
    private static final String COUNT_UNKNOWN = "select count(*) from product where name = 'zz'";
    private static final BigDecimal TWENTY = new BigDecimal("20");
    private static final BigDecimal NEGATIVE = new BigDecimal("-1");

    private HikariDataSource dataSource;
    private PriceImport priceImport;

    @BeforeAll
    static void createProductTable() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(CREATE_PRODUCT);
        }
    }

    @BeforeEach
    void seedAndWire() throws SQLException {
        try (Connection connection = openConnection();
                Statement statement = connection.createStatement()) {
            statement.execute(TRUNCATE_PRODUCT);
            statement.execute(SEED_PRODUCT);
        }
        dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(POSTGRES.getJdbcUrl());
        dataSource.setUsername(POSTGRES.getUsername());
        dataSource.setPassword(POSTGRES.getPassword());
        dataSource.setMaximumPoolSize(POOL_SIZE);
        TransactionTemplate tx = new TransactionTemplate(new DataSourceTransactionManager(dataSource));
        priceImport = new PriceImport(tx, JdbcClient.create(dataSource));
    }

    @AfterEach
    void closePool() {
        dataSource.close();
    }

    @Test
    @DisplayName("M17 §8 · importInChunks commits every chunk when every change is valid")
    void importInChunks_commitsEveryChunk_whenAllChangesValid() throws SQLException {
        List<PriceChange> changes = List.of(change("a"), change("b"), change("c"), change("d"));

        int committed = priceImport.importInChunks(changes, CHUNK_OF_TWO);

        assertThat(committed).isEqualTo(2);
        assertThat(count(COUNT_AT_TWENTY)).isEqualTo(4);
    }

    @Test
    @DisplayName("M17 §8 · a bad chunk rolls back alone; chunks before and after commit")
    void importInChunks_rollsBackOnlyBadChunk_whenOneChangeViolatesCheck() throws SQLException {
        List<PriceChange> changes = List.of(
                change("a"), new PriceChange("b", NEGATIVE), change("c"), change("d"), change("zz"), change("zz"));

        int committed = priceImport.importInChunks(changes, CHUNK_OF_TWO);

        assertThat(committed).isEqualTo(2);
        assertThat(count(COUNT_AT_TEN)).isEqualTo(2);
        assertThat(count(COUNT_AT_TWENTY)).isEqualTo(2);
    }

    @Test
    @DisplayName("M17 §8 · an empty list commits nothing and opens no transaction")
    void importInChunks_opensNoTransaction_whenListEmpty() {
        RecordingTransactionManager recorder = new RecordingTransactionManager();
        PriceImport recorded = new PriceImport(new TransactionTemplate(recorder), JdbcClient.create(dataSource));

        int committed = recorded.importInChunks(List.of(), CHUNK_OF_TWO);

        assertThat(committed).isZero();
        assertThat(recorder.events()).isEmpty();
    }

    @Test
    @DisplayName("M17 §8 · a single change is one chunk")
    void importInChunks_returnsOne_whenSingleChange() throws SQLException {
        int committed = priceImport.importInChunks(List.of(change("a")), CHUNK_OF_TWO);

        assertThat(committed).isEqualTo(1);
        assertThat(count(COUNT_AT_TWENTY)).isEqualTo(1);
    }

    @Test
    @DisplayName("M17 §8 · a chunk size larger than the list gives one chunk")
    void importInChunks_returnsOne_whenChunkSizeExceedsList() throws SQLException {
        int committed = priceImport.importInChunks(List.of(change("a"), change("b")), CHUNK_OF_TEN);

        assertThat(committed).isEqualTo(1);
        assertThat(count(COUNT_AT_TWENTY)).isEqualTo(2);
    }

    @Test
    @DisplayName("M17 §8 · a list that is not a multiple of the chunk size leaves a shorter last chunk")
    void importInChunks_countsShorterLastChunk_whenSizeNotMultiple() throws SQLException {
        List<PriceChange> changes = List.of(change("a"), change("b"), change("c"), change("d"));

        int committed = priceImport.importInChunks(changes, CHUNK_OF_THREE);

        assertThat(committed).isEqualTo(2);
        assertThat(count(COUNT_AT_TWENTY)).isEqualTo(4);
    }

    @Test
    @DisplayName("M17 §8 · a name with no row is not an error")
    void importInChunks_commitsChunk_whenNameMatchesNoRow() throws SQLException {
        int committed = priceImport.importInChunks(List.of(change("zz")), CHUNK_OF_TWO);

        assertThat(committed).isEqualTo(1);
        assertThat(count(COUNT_UNKNOWN)).isZero();
        assertThat(count(COUNT_AT_TEN)).isEqualTo(4);
    }

    @Test
    @DisplayName("M17 §8 · chunk size below 1 is rejected before any transaction starts")
    void importInChunks_throwsBeforeAnyTransaction_whenChunkSizeBelowOne() {
        RecordingTransactionManager recorder = new RecordingTransactionManager();
        PriceImport recorded = new PriceImport(new TransactionTemplate(recorder), JdbcClient.create(dataSource));
        List<PriceChange> changes = List.of(change("a"));

        assertThatThrownBy(() -> recorded.importInChunks(changes, 0)).isInstanceOf(IllegalArgumentException.class);
        assertThat(recorder.events()).isEmpty();
    }

    private static PriceChange change(String name) {
        return new PriceChange(name, TWENTY);
    }

    private static long count(String query) throws SQLException {
        try (Connection connection = openConnection()) {
            return countRows(connection, query);
        }
    }
}
