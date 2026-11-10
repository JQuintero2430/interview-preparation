package dev.interview.javalanguage.m01.ex1;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Currency;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class OrderTotalTest {

    private static final Currency USD = Currency.getInstance("USD");
    private static final Currency EUR = Currency.getInstance("EUR");
    private static final String SKU = "A";
    private static final BigDecimal NO_DISCOUNT = BigDecimal.ZERO;
    private static final BigDecimal TEN_PERCENT = new BigDecimal("0.10");

    @ParameterizedTest
    @CsvSource({"335, 3, 0.15, 8.54", "25, 1, 0.10, 0.22", "35, 1, 0.10, 0.32", "1999, 2, 0, 39.98"})
    @DisplayName("Ex01.1 · (1) lineTotal rounds half-even to scale 2")
    void lineTotal_roundsHalfEven_whenDiscountApplied(long cents, int quantity, String rate, String expected) {
        OrderTotal order = new OrderTotal(USD, new BigDecimal(rate));

        BigDecimal result = order.lineTotal(new OrderLine(SKU, quantity, cents, USD));

        assertThat(result).isEqualTo(new BigDecimal(expected));
        assertThat(result.scale()).isEqualTo(2);
    }

    @Test
    @DisplayName("Ex01.1 · (1) total of two half-cent lines is exactly 0.54")
    void total_isExact_whenLinesRoundIndependently() {
        OrderTotal order = new OrderTotal(USD, TEN_PERCENT);
        List<OrderLine> lines = List.of(new OrderLine(SKU, 1, 25, USD), new OrderLine(SKU, 1, 35, USD));

        BigDecimal result = order.total(lines);

        assertThat(result).isEqualTo(new BigDecimal("0.54"));
    }

    @Test
    @DisplayName("Ex01.1 · (1) total of no lines is 0.00")
    void total_isZeroAtScaleTwo_whenNoLines() {
        OrderTotal order = new OrderTotal(USD, NO_DISCOUNT);

        BigDecimal result = order.total(List.of());

        assertThat(result).isEqualTo(new BigDecimal("0.00"));
    }

    @Test
    @DisplayName("Ex01.1 · (1) broken double total is not exactly 0.30")
    void brokenTotal_isNotExact_whenSummingTenAndTwentyCents() {
        List<dev.interview.javalanguage.m01.ex1.broken.OrderTotal.Line> lines = List.of(
                new dev.interview.javalanguage.m01.ex1.broken.OrderTotal.Line(SKU, 1, 10, "USD"),
                new dev.interview.javalanguage.m01.ex1.broken.OrderTotal.Line(SKU, 1, 20, "USD"));

        double result = dev.interview.javalanguage.m01.ex1.broken.OrderTotal.total(lines, 0.0);

        assertThat(result).isNotEqualTo(0.30);
    }

    @Test
    @DisplayName("Ex01.1 · (2) lineTotal throws ArithmeticException on long overflow")
    void lineTotal_throwsArithmeticException_whenGrossOverflowsLong() {
        OrderTotal order = new OrderTotal(USD, NO_DISCOUNT);
        OrderLine line = new OrderLine(SKU, Integer.MAX_VALUE, Long.MAX_VALUE / 1_000, USD);

        assertThatThrownBy(() -> order.lineTotal(line)).isInstanceOf(ArithmeticException.class);
    }

    @Test
    @DisplayName("Ex01.1 · (2) broken total silently wraps to a smaller value")
    void brokenTotal_wrapsSilently_whenGrossOverflows() {
        long price = Long.MAX_VALUE / 1_000;
        var line = new dev.interview.javalanguage.m01.ex1.broken.OrderTotal.Line(SKU, Integer.MAX_VALUE, price, "USD");
        BigDecimal exact = new BigDecimal(BigInteger.valueOf(Integer.MAX_VALUE).multiply(BigInteger.valueOf(price)))
                .divide(BigDecimal.valueOf(100));

        double result = dev.interview.javalanguage.m01.ex1.broken.OrderTotal.total(List.of(line), 0.0);

        assertThat(BigDecimal.valueOf(Math.abs(result))).isLessThan(exact);
    }

    @Test
    @DisplayName("Ex01.1 · (3) lineTotal rejects a line in another currency")
    void lineTotal_throwsIllegalArgument_whenCurrencyDiffers() {
        OrderTotal order = new OrderTotal(USD, NO_DISCOUNT);
        OrderLine line = new OrderLine(SKU, 1, 100, EUR);

        assertThatThrownBy(() -> order.lineTotal(line))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("USD")
                .hasMessageContaining("EUR");
    }

    @Test
    @DisplayName("Ex01.1 · (3) total rejects a line in another currency")
    void total_throwsIllegalArgument_whenAnyLineCurrencyDiffers() {
        OrderTotal order = new OrderTotal(USD, NO_DISCOUNT);
        List<OrderLine> lines = List.of(new OrderLine(SKU, 1, 100, USD), new OrderLine(SKU, 1, 100, EUR));

        assertThatThrownBy(() -> order.total(lines))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("USD")
                .hasMessageContaining("EUR");
    }

    @Test
    @DisplayName("Ex01.1 · (4) OrderLine rejects a null quantity with a clear message")
    void orderLine_throwsNullPointer_whenQuantityIsNull() {
        assertThatThrownBy(() -> new OrderLine(SKU, null, 100, USD))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("quantity must not be null");
    }

    @Test
    @DisplayName("Ex01.1 · (4) broken total fails on unboxing a null quantity")
    void brokenTotal_throwsNullPointer_whenQuantityIsNull() {
        var line = new dev.interview.javalanguage.m01.ex1.broken.OrderTotal.Line(SKU, null, 100, "USD");
        List<dev.interview.javalanguage.m01.ex1.broken.OrderTotal.Line> lines = List.of(line);

        assertThatThrownBy(() -> dev.interview.javalanguage.m01.ex1.broken.OrderTotal.total(lines, 0.0))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("intValue");
    }
}
