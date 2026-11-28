package dev.interview.javalanguage.m07.smoke;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class M07LabSmokeTest {

    private sealed interface Shape permits Circle, Square {}

    private record Circle(double radius) implements Shape {}

    private record Square(double side) implements Shape {}

    private static final String PRIMITIVE_PATTERN = """
            class Bytes {
                static String describe(int value) {
                    return switch (value) {
                        case byte b -> "fits a byte";
                        case int i -> "needs an int";
                    };
                }
            }
            """;

    private static String describe(Shape shape) {
        // No default: the switch is exhaustive because Shape is sealed.
        return switch (shape) {
            case Circle(double radius) -> "circle " + radius;
            case Square(double side) -> "square " + side;
        };
    }

    @Test
    @DisplayName("M07 smoke · a switch over a sealed interface with record patterns needs no default")
    void sealedSwitch_isExhaustiveWithoutDefault() {
        assertThat(describe(new Circle(1.5))).isEqualTo("circle 1.5");
        assertThat(describe(new Square(2.0))).isEqualTo("square 2.0");
    }

    @Test
    @DisplayName("M07 smoke · a primitive pattern compiles only with --enable-preview on Java 25")
    void primitivePattern_needsEnablePreview() {
        var withoutFlag = InMemoryCompiler.compile(Map.of("Bytes", PRIMITIVE_PATTERN), "--release", "25");
        var withFlag =
                InMemoryCompiler.compile(Map.of("Bytes", PRIMITIVE_PATTERN), "--release", "25", "--enable-preview");

        assertThat(withoutFlag.success()).isFalse();
        assertThat(withoutFlag.errorCodes()).contains("compiler.err.preview.feature.disabled.plural");
        assertThat(withFlag.success()).isTrue();
    }

    @Test
    @DisplayName("M07 smoke · plusMonths clamps January 31 to the last day of February")
    void plusMonths_clampsToLastDayOfMonth() {
        assertThat(LocalDate.of(2024, 1, 31).plusMonths(1)).isEqualTo(LocalDate.of(2024, 2, 29));
        assertThat(LocalDate.of(2025, 1, 31).plusMonths(1)).isEqualTo(LocalDate.of(2025, 2, 28));
    }
}
