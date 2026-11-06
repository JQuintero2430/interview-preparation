package dev.interview.javalanguage.m01.s05;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §5 Failure modes: a static initializer that throws breaks the class for the life of its loader.
class FailingConfigTest {

    @Test
    @DisplayName("M01 §5 · failed static init gives NoClassDefFoundError on second use")
    void firstUseThrowsExceptionInInitializerError_secondUseNoClassDefFoundError() {
        // One method on purpose: a class fails initialization only once per class loader.
        assertThatThrownBy(FailingConfig::port)
                .isInstanceOf(ExceptionInInitializerError.class)
                .cause()
                .isInstanceOf(NumberFormatException.class);

        assertThatThrownBy(FailingConfig::port)
                .isInstanceOf(NoClassDefFoundError.class)
                .hasMessageContaining("Could not initialize class " + FailingConfig.class.getName())
                .cause()
                .isInstanceOf(ExceptionInInitializerError.class);
    }
}
