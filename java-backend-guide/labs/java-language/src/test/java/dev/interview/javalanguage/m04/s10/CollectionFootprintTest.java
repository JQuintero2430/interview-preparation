package dev.interview.javalanguage.m04.s10;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CollectionFootprintTest {

    @Test
    @DisplayName("M04 §10 · boxing 127 twice into a List<Integer> stores one cached Integer object")
    void boxedElements_areObjects() {
        List<Integer> small = new ArrayList<>(List.of(127));
        small.add(127);

        // Guaranteed by the Integer.valueOf Javadoc: -128..127 are always cached, so autoboxing reuses one object.
        assertThat(small.get(0)).isSameAs(small.get(1));
    }

    @Test
    @DisplayName("M04 §10 · EnumSet uses the single-long implementation for an enum of up to 64 constants")
    void enumSet_regularForSmallEnums() {
        // Observation of the JDK 25 factory (EnumSet.noneOf: universe.length <= 64), not a public contract.
        assertThat(EnumSet.allOf(Status.class).getClass().getSimpleName()).isEqualTo("RegularEnumSet");
    }
}
