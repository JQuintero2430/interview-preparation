package dev.interview.javalanguage.m03.s08;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.lang.reflect.WildcardType;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.stream.Collector;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Module 03 §8: the declared signature survives in the class file; the erased one is what old callers link against.
class JdkSignatureReflectionTest {

    private static final String MAX = "max";
    private static final String COLLECT = "collect";
    private static final String LOOK_ALIKE = "maxWithoutObjectBound";
    private static final String ERASED_MAX =
            "public static java.lang.Object java.util.Collections.max(java.util.Collection)";
    private static final String DECLARED_MAX =
            "public static <T extends java.lang.Object & java.lang.Comparable<? super T>> T"
                    + " java.util.Collections.max(java.util.Collection<? extends T>)";

    @Test
    @DisplayName("M03 §8 · the erasure of Collections.max returns Object")
    void getReturnType_isObject_whenFirstBoundIsObject() throws NoSuchMethodException {
        Method max = Collections.class.getMethod(MAX, Collection.class);

        assertThat(max.getReturnType()).isEqualTo(Object.class);
        assertThat(max.toString()).isEqualTo(ERASED_MAX);
        assertThat(max.toGenericString()).isEqualTo(DECLARED_MAX);
    }

    @Test
    @DisplayName("M03 §8 · Collections.max declares T extends Object & Comparable<? super T>")
    void getBounds_returnsObjectThenComparable_whenReadingCollectionsMax() throws NoSuchMethodException {
        Method max = Collections.class.getMethod(MAX, Collection.class);
        TypeVariable<Method> t = max.getTypeParameters()[0];

        Type[] bounds = t.getBounds();

        assertThat(bounds[0]).isEqualTo(Object.class);
        assertThat(((ParameterizedType) bounds[1]).getRawType()).isEqualTo(Comparable.class);
        assertThat(lowerBound(((ParameterizedType) bounds[1]).getActualTypeArguments()[0]))
                .isEqualTo(t);
    }

    @Test
    @DisplayName("M03 §8 · without Object & the same signature erases to Comparable")
    void getReturnType_isComparable_whenObjectBoundIsMissing() throws NoSuchMethodException {
        Method lookAlike = JdkSignatureReflectionTest.class.getDeclaredMethod(LOOK_ALIKE, Collection.class);

        assertThat(lookAlike.getReturnType()).isEqualTo(Comparable.class);
    }

    @Test
    @DisplayName("M03 §8 · Stream.collect declares R and A and takes Collector<? super T, A, R>")
    void getGenericParameterTypes_showsSuperWildcardAndMethodTypeVariables_whenReadingCollect()
            throws NoSuchMethodException {
        Method collect = Stream.class.getMethod(COLLECT, Collector.class);
        ParameterizedType parameter = (ParameterizedType) collect.getGenericParameterTypes()[0];
        Type[] arguments = parameter.getActualTypeArguments();

        assertThat(names(collect.getTypeParameters())).containsExactly("R", "A");
        assertThat(lowerBound(arguments[0])).isEqualTo(Stream.class.getTypeParameters()[0]);
        assertThat(arguments[1]).isEqualTo(collect.getTypeParameters()[1]);
        assertThat(arguments[2]).isEqualTo(collect.getTypeParameters()[0]);
        assertThat(collect.getGenericReturnType()).isEqualTo(collect.getTypeParameters()[0]);
    }

    @SuppressWarnings("unused") // read by reflection only: the JDK's signature minus "Object &"
    private static <T extends Comparable<? super T>> T maxWithoutObjectBound(Collection<? extends T> values) {
        return Collections.max(values);
    }

    private static Type lowerBound(Type wildcard) {
        return ((WildcardType) wildcard).getLowerBounds()[0];
    }

    private static String[] names(TypeVariable<?>[] variables) {
        return Arrays.stream(variables).map(TypeVariable::getName).toArray(String[]::new);
    }
}
