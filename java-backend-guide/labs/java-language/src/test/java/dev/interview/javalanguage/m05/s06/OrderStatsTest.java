package dev.interview.javalanguage.m05.s06;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class OrderStatsTest {

    private static final List<Order> ORDERS = List.of(
            new Order("o1", List.of(new Line("pen", 2, 150), new Line("ink", 0, 900))),
            new Order("o2", List.of()),
            new Order("o3", List.of(new Line("pad", 3, 400))));

    @Test
    @DisplayName("M05 §6 · revenue is summed in a LongStream without boxing")
    void revenueCents_sumsQuantityTimesPrice() {
        assertThat(OrderStats.revenueCents(ORDERS)).isEqualTo(2 * 150 + 3 * 400);
    }

    @Test
    @DisplayName("M05 §6 · average unit price is empty when there are no lines")
    void averageUnitPrice_isEmptyWithoutLines() {
        assertThat(OrderStats.averageUnitPriceCents(ORDERS)).hasValue((150 + 900 + 400) / 3.0);
        assertThat(OrderStats.averageUnitPriceCents(List.of(new Order("o2", List.of()))))
                .isEmpty();
    }

    @Test
    @DisplayName("M05 §6 · summaryStatistics gives count, min, max and sum in one pass")
    void quantityStatistics_inOnePass() {
        var stats = OrderStats.quantityStatistics(ORDERS);

        assertThat(stats.getCount()).isEqualTo(3);
        assertThat(stats.getMin()).isZero();
        assertThat(stats.getMax()).isEqualTo(3);
        assertThat(stats.getSum()).isEqualTo(5);
    }
}
