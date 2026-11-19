package dev.interview.javalanguage.m03.s03;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m03.s02.Elements;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.chrono.ChronoLocalDate;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Reflection shows both halves of §3: the declared bounds stay in the class file, the erased signature is what runs.
class BoundReflectionTest {

    private static final String CLAMP = "clamp";
    private static final String MAX = "max";
    private static final String FIRST_OR = "firstOr";
    private static final int TWO_BOUNDS = 2;

    @Test
    @DisplayName("M03 §3 · a type variable's bounds are visible by reflection")
    void getBounds_returnsNumberThenComparable_whenTypeVariableHasTwoBounds() throws NoSuchMethodException {
        Type[] bounds = clamp().getTypeParameters()[0].getBounds();

        assertThat(bounds).hasSize(TWO_BOUNDS);
        assertThat(bounds[0]).isEqualTo(Number.class);
        assertThat(bounds[1]).isInstanceOf(ParameterizedType.class);
        assertThat(((ParameterizedType) bounds[1]).getRawType()).isEqualTo(Comparable.class);
    }

    @Test
    @DisplayName("M03 §3 · a bounded type variable erases to its leftmost bound")
    void getReturnType_returnsLeftmostBound_whenReturnTypeIsATypeVariable() throws NoSuchMethodException {
        Method max = Bounds.class.getMethod(MAX, List.class);
        Method firstOr = Elements.class.getMethod(FIRST_OR, List.class, Object.class);

        assertThat(clamp().getReturnType()).isEqualTo(Number.class);
        assertThat(clamp().getParameterTypes()).containsOnly(Number.class);
        assertThat(max.getReturnType()).isEqualTo(Comparable.class);
        assertThat(firstOr.getReturnType()).isEqualTo(Object.class);
    }

    @Test
    @DisplayName("M03 §3 · LocalDate is Comparable<ChronoLocalDate> and Timestamp inherits Comparable<Date>")
    void getGenericInterfaces_showsComparableOnTheSupertype_whenSubtypeInheritsIt() {
        assertThat(comparableArgument(LocalDate.class)).isEmpty();
        assertThat(comparableArgument(ChronoLocalDate.class)).contains(ChronoLocalDate.class);
        assertThat(comparableArgument(Timestamp.class)).isEmpty();
        assertThat(comparableArgument(Date.class)).contains(Date.class);
    }

    @Test
    @DisplayName("M03 §3 · Enum declares the recursive bound E extends Enum<E>")
    void getBounds_returnsEnumOfItself_whenTypeVariableIsEnumsE() {
        TypeVariable<Class<Enum>> e = Enum.class.getTypeParameters()[0];

        Type bound = e.getBounds()[0];

        assertThat(bound).isInstanceOf(ParameterizedType.class);
        assertThat(((ParameterizedType) bound).getRawType()).isEqualTo(Enum.class);
        assertThat(((ParameterizedType) bound).getActualTypeArguments()).containsExactly(e);
    }

    private static Method clamp() throws NoSuchMethodException {
        return Bounds.class.getMethod(CLAMP, Number.class, Number.class, Number.class);
    }

    private static Optional<Type> comparableArgument(Class<?> type) {
        return Arrays.stream(type.getGenericInterfaces())
                .filter(ParameterizedType.class::isInstance)
                .map(ParameterizedType.class::cast)
                .filter(candidate -> candidate.getRawType() == Comparable.class)
                .map(candidate -> candidate.getActualTypeArguments()[0])
                .findFirst();
    }
}
