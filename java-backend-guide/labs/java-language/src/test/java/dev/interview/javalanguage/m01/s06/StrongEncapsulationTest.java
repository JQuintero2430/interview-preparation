package dev.interview.javalanguage.m01.s06;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.InaccessibleObjectException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins JDK 25 strong encapsulation (JEP 403): code on the class path cannot reflect into java.base internals.
class StrongEncapsulationTest {

    @Test
    @DisplayName("M01 §6 · reflection cannot open JDK internals")
    void setAccessible_onStringInternals_isRefused() {
        assertThatThrownBy(() -> String.class.getDeclaredField("value").setAccessible(true))
                .isInstanceOf(InaccessibleObjectException.class)
                .hasMessageContaining("does not \"opens java.lang\"");
    }
}
