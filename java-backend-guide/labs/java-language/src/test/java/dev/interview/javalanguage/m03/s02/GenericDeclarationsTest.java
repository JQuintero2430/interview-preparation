package dev.interview.javalanguage.m03.s02;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The top stack frame is asserted because §2 claims the unchecked getter fails in its caller, not in itself.
class GenericDeclarationsTest {

    private static final String SKU = "sku";
    private static final int SKU_LENGTH = 3;
    private static final String FALLBACK = "none";
    private static final int NUMBER = 7;
    private static final int NUMBER_FALLBACK = 0;
    private static final String PORT_KEY = "port";
    private static final String PORT_TEXT = "8080";

    @Test
    @DisplayName("M03 §2 · a generic class fixes T per instance")
    void map_returnsBoxOfTheMappedType_whenBoxHoldsAString() {
        Box<String> name = new Box<>(SKU);

        Box<Integer> length = name.map(String::length);

        assertThat(name.value()).isEqualTo(SKU);
        assertThat(length.value()).isEqualTo(SKU_LENGTH);
    }

    @Test
    @DisplayName("M03 §2 · a generic method chooses T at each call")
    void firstOr_returnsFirstElementOrFallback_whenCalledWithDifferentElementTypes() {
        assertThat(Elements.firstOr(List.of(), FALLBACK)).isEqualTo(FALLBACK);
        assertThat(Elements.firstOr(List.of(NUMBER), NUMBER_FALLBACK)).isEqualTo(NUMBER);
        assertThat(Elements.firstOr(List.of("a", "b"), FALLBACK)).isEqualTo("a");
    }

    @Test
    @DisplayName("M03 §2 · a <T> T getter throws ClassCastException at the caller's assignment")
    void get_throwsClassCastExceptionInTheCaller_whenTheStoredValueHasAnotherType() {
        Settings settings = new Settings();
        settings.put(PORT_KEY, PORT_TEXT);

        Object untyped = settings.get(PORT_KEY);
        ClassCastException thrown = catchThrowableOfType(ClassCastException.class, () -> readPort(settings));

        assertThat(untyped).isEqualTo(PORT_TEXT);
        assertThat(thrown).isNotNull();
        assertThat(thrown.getStackTrace()[0].getClassName()).isEqualTo(GenericDeclarationsTest.class.getName());
    }

    private static Integer readPort(Settings settings) {
        return settings.get(PORT_KEY);
    }
}
