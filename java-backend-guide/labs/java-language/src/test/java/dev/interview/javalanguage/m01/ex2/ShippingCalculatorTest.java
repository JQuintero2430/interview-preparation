package dev.interview.javalanguage.m01.ex2;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

class ShippingCalculatorTest {

    private static final String SOURCE_NAME = "Shipping";
    private static final String ABSTRACT_NOT_IMPLEMENTED_CODE = "compiler.err.abstract.cant.be.instantiated";
    private static final String B_WITHOUT_BODY =
            "enum Shipping { A { long costCents(int g) { return 1; } }, B; abstract long costCents(int g); }";
    private static final String B_WITH_BODY = "enum Shipping { A { long costCents(int g) { return 1; } },"
            + " B { long costCents(int g) { return 2; } }; abstract long costCents(int g); }";
    private static final Path CALCULATOR_SOURCE =
            Path.of("src/main/java/dev/interview/javalanguage/m01/ex2/ShippingCalculator.java");
    private static final String UNKNOWN_METHOD = "DRONE";
    private static final int NEGATIVE_WEIGHT = -1;

    @ParameterizedTest
    @CsvSource({
        "STANDARD, 0, 499",
        "STANDARD, 1, 599",
        "STANDARD, 1000, 599",
        "STANDARD, 1001, 699",
        "EXPRESS, 0, 999",
        "EXPRESS, 2500, 1749",
        "PICKUP, 0, 0",
        "PICKUP, 30000, 0"
    })
    @DisplayName("Ex01.2 · (1) costCents charges the base plus the rate per started kilogram")
    void costCents_chargesPerStartedKilogram_whenWeightGiven(ShippingMethod method, int grams, long expected) {
        long result = method.costCents(grams);

        assertThat(result).isEqualTo(expected);
    }

    @ParameterizedTest
    @CsvSource({"STANDARD, 1001, 699", "EXPRESS, 2500, 1749", "PICKUP, 30000, 0"})
    @DisplayName("Ex01.2 · (1) broken calculator returns the same tariff for a valid name")
    void brokenCostCents_matchesTariff_whenNameIsValid(String name, int grams, long expected) {
        long result = dev.interview.javalanguage.m01.ex2.broken.ShippingCalculator.costCents(name, grams);

        assertThat(result).isEqualTo(expected);
    }

    @ParameterizedTest
    @CsvSource({"STANDARD, 1001, 699", "EXPRESS, 2500, 1749", "PICKUP, 30000, 0"})
    @DisplayName("Ex01.2 · (1) quote returns the tariff of the named method")
    void quote_returnsTariff_whenMethodNameKnown(String name, int grams, long expected) {
        Optional<Long> result = new ShippingCalculator().quote(name, grams);

        assertThat(result).contains(expected);
    }

    @ParameterizedTest
    @ValueSource(strings = {UNKNOWN_METHOD, " "})
    @NullAndEmptySource
    @DisplayName("Ex01.2 · (2) quote is empty for an unknown, blank or null name")
    void quote_isEmpty_whenMethodNameUnknown(String name) {
        Optional<Long> result = new ShippingCalculator().quote(name, 1000);

        assertThat(result).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {UNKNOWN_METHOD, " "})
    @NullAndEmptySource
    @DisplayName("Ex01.2 · (2) parse is empty without an exception for an unknown, blank or null name")
    void parse_isEmptyWithoutException_whenNameUnknown(String name) {
        assertThatCode(() -> ShippingMethod.parse(name)).doesNotThrowAnyException();
        assertThat(ShippingMethod.parse(name)).isEmpty();
    }

    @ParameterizedTest
    @CsvSource({"STANDARD, STANDARD", "' express ', EXPRESS", "pickup, PICKUP"})
    @DisplayName("Ex01.2 · (2) parse strips and ignores case")
    void parse_returnsConstant_whenNameHasWhitespaceOrOtherCase(String name, ShippingMethod expected) {
        Optional<ShippingMethod> result = ShippingMethod.parse(name);

        assertThat(result).contains(expected);
    }

    @Test
    @DisplayName("Ex01.2 · (2) broken calculator throws IllegalArgumentException for an unknown name")
    void brokenCostCents_throwsIllegalArgument_whenNameUnknown() {
        assertThatThrownBy(() ->
                        dev.interview.javalanguage.m01.ex2.broken.ShippingCalculator.costCents(UNKNOWN_METHOD, 1000))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @ParameterizedTest
    @EnumSource(ShippingMethod.class)
    @DisplayName("Ex01.2 · (1) costCents rejects a negative weight on every constant")
    void costCents_throwsIllegalArgument_whenWeightNegative(ShippingMethod method) {
        assertThatThrownBy(() -> method.costCents(NEGATIVE_WEIGHT)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Ex01.2 · (1) quote rejects a negative weight for a known method")
    void quote_throwsIllegalArgument_whenWeightNegative() {
        ShippingCalculator calculator = new ShippingCalculator();

        assertThatThrownBy(() -> calculator.quote("STANDARD", NEGATIVE_WEIGHT))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Ex01.2 · (3) a constant without the abstract method body does not compile")
    void enumConstant_doesNotCompile_whenAbstractMethodNotImplemented() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, B_WITHOUT_BODY));

        assertThat(result.errorCodes()).containsExactly(ABSTRACT_NOT_IMPLEMENTED_CODE);
    }

    @Test
    @DisplayName("Ex01.2 · (3) the same enum compiles once every constant has a body")
    void enumConstant_compiles_whenAbstractMethodImplementedForEveryConstant() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, B_WITH_BODY));

        assertThat(result.success()).isTrue();
    }

    @ParameterizedTest
    @ValueSource(
            strings = {
                "switch",
                "case ",
                "if (",
                "ShippingMethod.STANDARD",
                "ShippingMethod.EXPRESS",
                "ShippingMethod.PICKUP"
            })
    @DisplayName("Ex01.2 · (4) calculator source only delegates and names no method or branch")
    void calculatorSource_containsNoBranching_whenScanned(String forbidden) throws IOException {
        String source = Files.readString(CALCULATOR_SOURCE);

        assertThat(source).doesNotContain(forbidden);
    }
}
