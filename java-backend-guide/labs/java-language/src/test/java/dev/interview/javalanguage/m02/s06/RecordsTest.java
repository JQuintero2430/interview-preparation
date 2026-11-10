package dev.interview.javalanguage.m02.s06;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.RecordComponent;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Module 02 §6: what a record generates and what a compact constructor can fix, pinned as executable facts. */
class RecordsTest {

    private static final String ID = "e-1";
    private static final String RAW_ADDRESS = "  Ana@Example.COM ";
    private static final String NORMALIZED_ADDRESS = "ana@example.com";
    private static final String NO_AT_SIGN = "ana.example.com";
    private static final String USER = "ana";
    private static final String PASSWORD = "s3cret-pw";
    private static final String MASK = "***";

    private record Reading(double value) {}

    private record LeakyCredentials(String user, String password) {}

    @Test
    @DisplayName("M02 §6 · a record declares private final fields, accessors and a canonical constructor")
    void email_hasRecordShape_whenInspectedByReflection() throws NoSuchMethodException {
        Class<?> type = Email.class;
        RecordComponent[] components = type.getRecordComponents();

        assertThat(type.isRecord()).isTrue();
        assertThat(Modifier.isFinal(type.getModifiers())).isTrue();
        assertThat(type.getSuperclass()).isEqualTo(Record.class);
        assertThat(type.getDeclaredFields())
                .filteredOn(field -> !Modifier.isStatic(field.getModifiers()))
                .allSatisfy(field -> assertThat(field.getModifiers() & (Modifier.PRIVATE | Modifier.FINAL))
                        .isEqualTo(Modifier.PRIVATE | Modifier.FINAL));
        assertThat(components).allSatisfy(component -> {
            Method accessor = type.getMethod(component.getName());
            assertThat(Modifier.isPublic(accessor.getModifiers())).isTrue();
            assertThat(accessor.getReturnType()).isEqualTo(component.getType());
        });
        Class<?>[] componentTypes =
                Arrays.stream(components).map(RecordComponent::getType).toArray(Class<?>[]::new);
        assertThat(Modifier.isPublic(type.getConstructor(componentTypes).getModifiers()))
                .isTrue();
    }

    @Test
    @DisplayName("M02 §6 · compact constructor normalizes before the fields are assigned")
    void email_normalizesValue_whenCompactConstructorRuns() {
        Email email = new Email(RAW_ADDRESS);

        assertThat(email.value()).isEqualTo(NORMALIZED_ADDRESS);
        assertThat(email).isEqualTo(new Email(NORMALIZED_ADDRESS));
        assertThatThrownBy(() -> new Email(NO_AT_SIGN)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Email(null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M02 §6 · records with equal arrays are not equal")
    void equals_isFalse_whenRawEventsHoldDistinctEqualArrays() {
        RawEvent first = new RawEvent(ID, new byte[] {1, 2});
        RawEvent second = new RawEvent(ID, new byte[] {1, 2});

        assertThat(first).isNotEqualTo(second);
        assertThat(new HashSet<>(List.of(first, second))).hasSize(2);
    }

    @Test
    @DisplayName("M02 §6 · defensive copy in the compact constructor and the accessor keeps a record immutable")
    void payload_staysUnchanged_whenCallerOrAccessorResultIsMutated() {
        byte[] callerArray = {1, 2};
        Event event = new Event(ID, callerArray);

        callerArray[0] = 9;
        event.payload()[1] = 9;

        assertThat(event.payload()).containsExactly(1, 2);
        Event twin = new Event(ID, new byte[] {1, 2});
        assertThat(event).isEqualTo(twin).hasSameHashCodeAs(twin);
        assertThat(new HashSet<>(List.of(event, twin))).hasSize(1);
    }

    @Test
    @DisplayName("M02 §6 · Event rejects a null id or payload")
    void event_throwsNullPointerException_whenIdOrPayloadIsNull() {
        byte[] payload = {1};

        assertThatThrownBy(() -> new Event(null, payload)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new Event(ID, null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M02 §6 · generated equals compares double components with Double.compare")
    void equals_followsDoubleCompare_whenComponentIsNanOrSignedZero() {
        assertThat(new Reading(Double.NaN)).isEqualTo(new Reading(Double.NaN));
        assertThat(new Reading(0.0)).isNotEqualTo(new Reading(-0.0));
    }

    @Test
    @DisplayName("M02 §6 · generated toString prints every component, an override hides the secret")
    void toString_hidesPassword_whenOverridden() {
        assertThat(new LeakyCredentials(USER, PASSWORD).toString()).contains(PASSWORD);
        assertThat(new Credentials(USER, PASSWORD).toString())
                .doesNotContain(PASSWORD)
                .contains(MASK);
    }
}
