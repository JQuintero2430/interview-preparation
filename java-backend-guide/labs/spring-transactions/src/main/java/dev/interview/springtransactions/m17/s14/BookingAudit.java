package dev.interview.springtransactions.m17.s14;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Writes the audit row in its own transaction, so it commits even when the caller rolls back. */
@Service
public class BookingAudit {

    private static final String INSERT_AUDIT = "insert into booking_audit (seat) values (?)";

    private final JdbcClient jdbc;

    public BookingAudit(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(String seat) {
        jdbc.sql(INSERT_AUDIT).param(seat).update();
    }
}
