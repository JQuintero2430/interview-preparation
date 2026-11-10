package dev.interview.javalanguage.m02.smoke;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Modifier;
import java.lang.reflect.RecordComponent;
import java.util.Arrays;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class M02LabSmokeTest {

    private static final String COMPONENT_X = "x";
    private static final String COMPONENT_Y = "y";
    private static final int X_VALUE = 1;
    private static final int Y_VALUE = 2;

    private record Point(int x, int y) {}

    @Test
    @DisplayName("M02 smoke · a record is a final class whose components are reflected")
    void point_isFinalRecordWithReflectedComponents_whenInspectedByReflection() {
        Class<Point> type = Point.class;

        boolean isRecord = type.isRecord();
        boolean isFinal = Modifier.isFinal(type.getModifiers());
        String[] componentNames = Arrays.stream(type.getRecordComponents())
                .map(RecordComponent::getName)
                .toArray(String[]::new);

        assertThat(isRecord).isTrue();
        assertThat(isFinal).isTrue();
        assertThat(componentNames).containsExactly(COMPONENT_X, COMPONENT_Y);
    }

    @Test
    @DisplayName("M02 smoke · records with equal components are equal and hash alike")
    void points_areEqualAndHashAlike_whenComponentsAreEqual() {
        Point first = new Point(X_VALUE, Y_VALUE);
        Point second = new Point(X_VALUE, Y_VALUE);

        assertThat(first).isEqualTo(second);
        assertThat(first.hashCode()).isEqualTo(second.hashCode());
        assertThat(first).isNotSameAs(second);
    }
}
