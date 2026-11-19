package dev.interview.javalanguage.m02.ex1;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The amounts are the cases the exercise names, so they stay literal in each test.
class MoneyTest {

    private static final Currency EUR = Currency.getInstance("EUR");
    private static final Currency USD = Currency.getInstance("USD");

    private static Money eur(String amount) {
        return new Money(new BigDecimal(amount), EUR);
    }

    @Test
    @DisplayName("Ex02.1 · (1) Money is a record")
    void money_isRecord() {
        assertThat(Money.class.isRecord()).isTrue();
    }

    @Test
    @DisplayName("Ex02.1 · (1) amounts that differ only in scale are equal and hash alike")
    void equalsAndHashCode_agree_whenAmountsDifferOnlyInScale() {
        Money oneDecimal = eur("1.0");
        Money twoDecimals = eur("1.00");

        assertThat(oneDecimal).isEqualTo(twoDecimals);
        assertThat(oneDecimal.hashCode()).isEqualTo(twoDecimals.hashCode());
    }

    @Test
    @DisplayName("Ex02.1 · (2) a null amount is rejected by name")
    void constructor_throwsNullPointerException_whenAmountIsNull() {
        assertThatThrownBy(() -> new Money(null, EUR))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("amount");
    }

    @Test
    @DisplayName("Ex02.1 · (2) a null currency is rejected by name")
    void constructor_throwsNullPointerException_whenCurrencyIsNull() {
        assertThatThrownBy(() -> new Money(BigDecimal.ONE, null))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("currency");
    }

    @Test
    @DisplayName("Ex02.1 · (2) a third decimal place is rejected")
    void constructor_throwsIllegalArgumentException_whenAmountNeedsThreeDecimals() {
        assertThatThrownBy(() -> eur("1.005"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("amount 1.005 has more than 2 decimal places");
    }

    @Test
    @DisplayName("Ex02.1 · (2) trailing zeros are not extra precision")
    void constructor_acceptsAmount_whenExtraDecimalsAreZeros() {
        assertThat(eur("1.000")).isEqualTo(eur("1.00"));
    }

    @Test
    @DisplayName("Ex02.1 · (3) compareTo orders by amount within one currency")
    void compareTo_ordersByAmount_whenCurrenciesMatch() {
        assertThat(eur("1.50")).isLessThan(eur("2.00"));
        assertThat(eur("2.00")).isGreaterThan(eur("1.50"));
        assertThat(eur("1.0").compareTo(eur("1.00"))).isZero();
    }

    @Test
    @DisplayName("Ex02.1 · (3) compareTo across currencies throws and names both")
    void compareTo_throwsIllegalArgumentException_whenCurrenciesDiffer() {
        Money euros = eur("1.00");
        Money dollars = new Money(new BigDecimal("1.00"), USD);

        assertThatThrownBy(() -> euros.compareTo(dollars))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("cannot compare EUR with USD");
    }

    @Test
    @DisplayName("Ex02.1 · (4) a HashSet and a TreeSet of the same amounts have the same size")
    void hashSetAndTreeSet_haveSameSize_whenBuiltFromSameAmounts() {
        List<Money> amounts = List.of(eur("1.0"), eur("1.00"), eur("2.5"), eur("2.50"));

        Set<Money> hashed = new HashSet<>(amounts);
        Set<Money> sorted = new TreeSet<>(amounts);

        assertThat(hashed).hasSize(2);
        assertThat(sorted).hasSize(2);
    }
}
