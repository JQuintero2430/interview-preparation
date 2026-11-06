package dev.interview.springtransactions.m17.outputs;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

/** Q17.19: two doctors leave the same shift at once, under REPEATABLE_READ and under SERIALIZABLE. */
public class Q17_19 {

    private static final int MINIMUM_ON_CALL = 2;
    private static final String COUNT_ON_CALL = "select count(*) from on_call where shift_id = ? and on_call = true";
    private static final String GO_OFF_CALL = "update on_call set on_call = false where shift_id = ? and doctor = ?";

    private final JdbcClient jdbc;
    private final Runnable afterCheck;

    public Q17_19(JdbcClient jdbc, Runnable afterCheck) {
        this.jdbc = jdbc;
        this.afterCheck = afterCheck;
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public boolean goOffCallRepeatableRead(long shiftId, String doctor) {
        return goOffCall(shiftId, doctor);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public boolean goOffCallSerializable(long shiftId, String doctor) {
        return goOffCall(shiftId, doctor);
    }

    private boolean goOffCall(long shiftId, String doctor) {
        long onCall = jdbc.sql(COUNT_ON_CALL).params(shiftId).query(Long.class).single();
        if (onCall < MINIMUM_ON_CALL) {
            return false;
        }
        afterCheck.run(); // the lab parks both callers here, so both have checked before either writes
        return jdbc.sql(GO_OFF_CALL).params(shiftId, doctor).update() == 1;
    }
}
