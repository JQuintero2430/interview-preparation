package dev.interview.javalanguage.m03.s07;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Module 03 §7: a Class<T> token moves the type check to the point where the value leaves the container.
class ClassTokenTest {

    private static final String PORT = "port";
    private static final String PORT_TEXT = "8080";

    @Test
    @DisplayName("M03 §7 · Class.cast returns the value when the token matches")
    void get_returnsValue_whenTokenMatchesStoredValue() {
        TypedSettings settings = settingsWithPortText();

        assertThat(settings.get(PORT, String.class)).isEqualTo(PORT_TEXT);
    }

    @Test
    @DisplayName("M03 §7 · Class.cast throws ClassCastException for a wrong instance")
    void get_throwsClassCastExceptionInsideGet_whenTokenDoesNotMatchStoredValue() {
        TypedSettings settings = settingsWithPortText();

        assertThatThrownBy(() -> settings.get(PORT, Integer.class))
                .isInstanceOf(ClassCastException.class)
                .hasMessageContaining(Integer.class.getName());
    }

    private static TypedSettings settingsWithPortText() {
        TypedSettings settings = new TypedSettings();
        settings.put(PORT, PORT_TEXT);
        return settings;
    }
}
