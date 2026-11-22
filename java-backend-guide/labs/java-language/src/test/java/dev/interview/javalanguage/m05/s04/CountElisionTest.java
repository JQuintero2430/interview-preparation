package dev.interview.javalanguage.m05.s04;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CountElisionTest {

    private static final List<String> ORDER_IDS = List.of("o-1", "o-2", "o-3", "o-4");

    @Test
    @DisplayName("M05 §4 · count on a sized List source skips peek")
    void count_onSizedSource_skipsPeek() {
        List<String> auditLog = new ArrayList<>();

        long count = new OrderAudit(auditLog).countWithPeekAudit(ORDER_IDS);

        assertThat(count).isEqualTo(4);
        assertThat(auditLog).isEmpty();
    }

    @Test
    @DisplayName("M05 §4 · count on a sized List source also skips map")
    void count_onSizedSource_skipsMap() {
        List<String> auditLog = new ArrayList<>();

        long count = new OrderAudit(auditLog).countWithMapAudit(ORDER_IDS);

        assertThat(count).isEqualTo(4);
        assertThat(auditLog).isEmpty();
    }

    @Test
    @DisplayName("M05 §4 · after a filter the size is unknown, so count runs peek")
    void count_afterFilter_runsPeek() {
        List<String> auditLog = new ArrayList<>();

        long count = new OrderAudit(auditLog).countPaidWithPeekAudit(List.of("o-1:paid", "o-2:open", "o-3:paid"));

        assertThat(count).isEqualTo(2);
        assertThat(auditLog).containsExactly("processed o-1:paid", "processed o-2:open", "processed o-3:paid");
    }

    @Test
    @DisplayName("M05 §4 · forEach always runs its action, so the audit is complete")
    void forEachAudit_writesEveryLine() {
        List<String> auditLog = new ArrayList<>();

        long count = new OrderAudit(auditLog).auditThenCount(ORDER_IDS);

        assertThat(count).isEqualTo(4);
        assertThat(auditLog).containsExactly("processed o-1", "processed o-2", "processed o-3", "processed o-4");
    }
}
