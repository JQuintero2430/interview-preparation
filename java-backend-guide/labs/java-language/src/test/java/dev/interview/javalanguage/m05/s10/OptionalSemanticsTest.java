package dev.interview.javalanguage.m05.s10;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.NotSerializableException;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.OptionalInt;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class OptionalSemanticsTest {

    @Test
    @DisplayName("M05 §10 · orElse evaluates its argument when a value is present and orElseGet does not")
    void orElse_evaluatesEagerly_orElseGet_lazily() {
        List<String> calls = new ArrayList<>();
        Optional<String> present = Optional.of("cached");

        String viaOrElse = present.orElse(load(calls, "orElse"));
        String viaOrElseGet = present.orElseGet(() -> load(calls, "orElseGet"));

        assertThat(viaOrElse).isEqualTo(viaOrElseGet).isEqualTo("cached");
        assertThat(calls).containsExactly("orElse");
    }

    @Test
    @DisplayName("M05 §10 · map with a null-returning function gives an empty Optional")
    void map_nullResult_becomesEmpty() {
        Optional<String> referrer = Optional.of(new Customer("c1", "Ada", null)).map(Customer::referrerId);

        assertThat(referrer).isEmpty();
        // Stream.map, by contrast, keeps a null result as an element.
        assertThat(Stream.of("a").map(s -> (String) null).toList()).containsExactly((String) null);
    }

    @Test
    @DisplayName("M05 §10 · flatMap avoids Optional<Optional<T>>")
    void flatMap_flattensOptionalBearingFunction() {
        Optional<Customer> customer = Optional.of(new Customer("c1", "Ada", "c0"));

        Optional<Optional<String>> nested = customer.map(Customer::referrer);
        Optional<String> flat = customer.flatMap(Customer::referrer);

        assertThat(nested).contains(Optional.of("c0"));
        assertThat(flat).contains("c0");
    }

    @Test
    @DisplayName("M05 §10 · or supplies an alternative only when empty")
    void or_invokesSupplierOnlyWhenEmpty() {
        List<String> calls = new ArrayList<>();

        Optional<String> kept = Optional.of("primary").or(() -> Optional.of(load(calls, "fallback-1")));
        Optional<String> replaced = Optional.<String>empty().or(() -> Optional.of(load(calls, "fallback-2")));

        assertThat(kept).contains("primary");
        assertThat(replaced).contains("fallback-2");
        assertThat(calls).containsExactly("fallback-2");
    }

    @Test
    @DisplayName("M05 §10 · Optional.of(null) throws NullPointerException")
    void of_null_throwsNullPointerException_whileOfNullableIsEmpty() {
        assertThatThrownBy(() -> Optional.of(null)).isInstanceOf(NullPointerException.class);
        assertThat(Optional.ofNullable(null)).isEmpty();
    }

    @Test
    @DisplayName("M05 §10 · get and orElseThrow on an empty Optional throw NoSuchElementException")
    void get_and_orElseThrow_onEmpty_throwNoSuchElementException() {
        Optional<String> empty = Optional.empty();

        assertThatThrownBy(empty::get)
                .isInstanceOf(NoSuchElementException.class)
                .hasMessage("No value present");
        assertThatThrownBy(empty::orElseThrow)
                .isInstanceOf(NoSuchElementException.class)
                .hasMessage("No value present");
    }

    @Test
    @DisplayName("M05 §10 · a variable of type Optional can still be null")
    void optionalReference_canBeNull() {
        Optional<String> notAnOptional = null;

        assertThatThrownBy(() -> notAnOptional.map(String::length)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M05 §10 · stream terminals return Optional, and primitive streams return OptionalInt")
    void streamTerminals_returnOptionalTypes() {
        Optional<String> first = List.of("b", "a").stream().sorted().findFirst();
        OptionalInt noMax = IntStream.empty().max();

        assertThat(first).contains("a");
        assertThat(noMax).isEmpty();
        assertThat(IntStream.of(3, 9, 4).max()).hasValue(9);
    }

    @Test
    @DisplayName("M05 §10 · Optional is not Serializable")
    void optional_isNotSerializable() {
        assertThat(Serializable.class.isAssignableFrom(Optional.class)).isFalse();
    }

    @Test
    @DisplayName("M05 §10 · a Serializable class with an Optional field fails to serialize")
    void serializableHolderWithOptionalField_throwsNotSerializableException() {
        record Holder(Optional<String> nickname) implements Serializable {}

        assertThatThrownBy(() -> serialize(new Holder(Optional.of("ada"))))
                .isInstanceOf(NotSerializableException.class)
                .hasMessage("java.util.Optional");
    }

    private static String load(List<String> calls, String label) {
        calls.add(label);
        return label;
    }

    private static void serialize(Object o) throws IOException {
        try (ObjectOutputStream out = new ObjectOutputStream(new ByteArrayOutputStream())) {
            out.writeObject(o);
        }
    }
}
