package dev.interview.javalanguage.m04.s04;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class RateTableTest {

    private static final RateTable RATES = new RateTable(Map.of(
            new BigDecimal("0"), new BigDecimal("0.05"),
            new BigDecimal("1000"), new BigDecimal("0.03"),
            new BigDecimal("10000"), new BigDecimal("0.01")));

    @Test
    @DisplayName("M04 §4 · an amount between two lower bounds gets the rate of the band below it")
    void rateFor_usesBandBelow() {
        assertThat(RATES.rateFor(new BigDecimal("999.99"))).isEqualByComparingTo("0.05");
        assertThat(RATES.rateFor(new BigDecimal("5000"))).isEqualByComparingTo("0.03");
        assertThat(RATES.rateFor(new BigDecimal("250000"))).isEqualByComparingTo("0.01");
    }

    @Test
    @DisplayName("M04 §4 · an amount equal to a lower bound, at any scale, belongs to that band")
    void rateFor_matchesBoundAtAnyScale() {
        assertThat(RATES.rateFor(new BigDecimal("1000"))).isEqualByComparingTo("0.03");
        assertThat(RATES.rateFor(new BigDecimal("1000.00"))).isEqualByComparingTo("0.03");
    }

    @Test
    @DisplayName("M04 §4 · an amount below the lowest band is rejected")
    void rateFor_rejectsAmountBelowLowestBand() {
        assertThatThrownBy(() -> RATES.rateFor(new BigDecimal("-1"))).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("M04 §4 · a rate table needs at least one band")
    void constructor_rejectsEmptyTable() {
        assertThatThrownBy(() -> new RateTable(Map.of())).isInstanceOf(IllegalArgumentException.class);
    }
}
