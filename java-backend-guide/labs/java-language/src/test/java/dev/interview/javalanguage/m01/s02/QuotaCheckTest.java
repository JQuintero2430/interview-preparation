package dev.interview.javalanguage.m01.s02;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class QuotaCheckTest {

    private static final int LIMIT = 100;
    private static final int SMALL_USAGE = 10;
    private static final int HALF_USAGE = 40;
    private static final int EXACT_FIT = 60;
    private static final int ONE_TOO_MANY = 61;
    private static final int NEGATIVE_REQUEST = -5;
    private static final int EMPTY_REQUEST = 0;

    @Test
    @DisplayName("M01 §2 · the naive quota check wraps and lets a huge request through")
    void fitsNaive_returnsTrue_whenSumOverflows() {
        assertThat(QuotaCheck.fitsNaive(SMALL_USAGE, Integer.MAX_VALUE, LIMIT)).isTrue();
    }

    @Test
    @DisplayName("M01 §2 · the long-widened quota check rejects the same request")
    void fits_returnsFalse_whenSumWouldOverflowInt() {
        assertThat(QuotaCheck.fits(SMALL_USAGE, Integer.MAX_VALUE, LIMIT)).isFalse();
    }

    @Test
    @DisplayName("M01 §2 · a request that exactly reaches the limit fits")
    void fits_returnsTrue_whenSumEqualsLimit() {
        assertThat(QuotaCheck.fits(HALF_USAGE, EXACT_FIT, LIMIT)).isTrue();
    }

    @Test
    @DisplayName("M01 §2 · a request one past the limit does not fit")
    void fits_returnsFalse_whenSumExceedsLimitByOne() {
        assertThat(QuotaCheck.fits(HALF_USAGE, ONE_TOO_MANY, LIMIT)).isFalse();
    }

    @Test
    @DisplayName("M01 §2 · an empty request fits when the quota is used up")
    void fits_returnsTrue_whenRequestIsZeroAtTheLimit() {
        assertThat(QuotaCheck.fits(LIMIT, EMPTY_REQUEST, LIMIT)).isTrue();
    }

    @Test
    @DisplayName("M01 §2 · a negative request is rejected")
    void fits_throws_whenRequestIsNegative() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> QuotaCheck.fits(HALF_USAGE, NEGATIVE_REQUEST, LIMIT))
                .withMessage(QuotaCheck.NEGATIVE_REQUEST + NEGATIVE_REQUEST);
    }
}
