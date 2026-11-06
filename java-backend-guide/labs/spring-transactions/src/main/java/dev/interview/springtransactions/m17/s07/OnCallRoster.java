package dev.interview.springtransactions.m17.s07;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

public class OnCallRoster {

    private static final int MINIMUM_ON_CALL = 2;
    private static final String COUNT_ON_CALL = "select count(*) from on_call where shift_id = ? and on_call = true";
    private static final String GO_OFF_CALL = "update on_call set on_call = false where shift_id = ? and doctor = ?";

    private final JdbcClient jdbc;

    public OnCallRoster(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    // SERIALIZABLE, not REPEATABLE_READ: two doctors leaving at once would each see two on call in their
    // snapshot and both leave (write skew); SSI aborts one of them with 40001 instead, and the caller retries.
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public boolean goOffCall(long shiftId, String doctor) {
        long onCall = jdbc.sql(COUNT_ON_CALL).params(shiftId).query(Long.class).single();
        if (onCall < MINIMUM_ON_CALL) {
            return false;
        }
        return jdbc.sql(GO_OFF_CALL).params(shiftId, doctor).update() == 1;
    }
}
