package dev.interview.javalanguage.m01.s03;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MidpointTest {

    private static final int MAX = Integer.MAX_VALUE;

    @Test
    @DisplayName("M01 §3 · midpoint of a small range")
    void of_returnsTheLowerMiddle_forASmallRange() {
        assertThat(Midpoint.of(0, 10)).isEqualTo(5);
        assertThat(Midpoint.of(3, 4)).isEqualTo(3);
    }

    @Test
    @DisplayName("M01 §3 · midpoint of a single-point range is that point")
    void of_returnsThePoint_forASinglePointRange() {
        assertThat(Midpoint.of(0, 0)).isZero();
        assertThat(Midpoint.of(MAX, MAX)).isEqualTo(MAX);
    }

    @Test
    @DisplayName("M01 §3 · (low + high) / 2 overflows near Integer.MAX_VALUE, >>> 1 does not")
    void of_staysCorrect_whereTheNaiveSumWrapsNegative() {
        assertThat(Midpoint.naive(MAX - 1, MAX)).isNegative();
        assertThat(Midpoint.of(MAX - 1, MAX)).isEqualTo(MAX - 1);
    }

    @Test
    @DisplayName("M01 §3 · midpoint rejects a negative low or an inverted range")
    void of_rejectsRangesWhereTheUnsignedShiftWouldBeWrong() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> Midpoint.of(-1, 4))
                .withMessage(Midpoint.INVALID_RANGE + "-1, 4");
        assertThatIllegalArgumentException()
                .isThrownBy(() -> Midpoint.of(5, 4))
                .withMessage(Midpoint.INVALID_RANGE + "5, 4");
    }
}
