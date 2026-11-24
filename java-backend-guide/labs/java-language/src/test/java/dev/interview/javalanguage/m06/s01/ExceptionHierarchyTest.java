package dev.interview.javalanguage.m06.s01;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.stream.Stream;
import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class ExceptionHierarchyTest {

    // A direct subclass of Throwable: legal, and checked, because it is under neither RuntimeException nor Error.
    static final class OddThrowable extends Throwable {}

    record Customer(String name) {}

    record Order(Customer customer) {}

    static Stream<Arguments> kinds() {
        return Stream.of(
                Arguments.of(Throwable.class, ExceptionKind.CHECKED),
                Arguments.of(Exception.class, ExceptionKind.CHECKED),
                Arguments.of(IOException.class, ExceptionKind.CHECKED),
                Arguments.of(FileNotFoundException.class, ExceptionKind.CHECKED),
                Arguments.of(InterruptedException.class, ExceptionKind.CHECKED),
                Arguments.of(ClassNotFoundException.class, ExceptionKind.CHECKED),
                Arguments.of(OddThrowable.class, ExceptionKind.CHECKED),
                Arguments.of(RuntimeException.class, ExceptionKind.UNCHECKED),
                Arguments.of(UncheckedIOException.class, ExceptionKind.UNCHECKED),
                Arguments.of(IllegalArgumentException.class, ExceptionKind.UNCHECKED),
                Arguments.of(IllegalStateException.class, ExceptionKind.UNCHECKED),
                Arguments.of(NullPointerException.class, ExceptionKind.UNCHECKED),
                Arguments.of(Error.class, ExceptionKind.UNCHECKED),
                Arguments.of(OutOfMemoryError.class, ExceptionKind.UNCHECKED));
    }

    @ParameterizedTest(name = "{0} is {1}")
    @MethodSource("kinds")
    @DisplayName("M06 §1 · checked or unchecked follows from the superclass chain alone")
    void kind_followsFromSuperclassChain(Class<? extends Throwable> type, ExceptionKind expected) {
        assertThat(ExceptionKind.of(type)).isEqualTo(expected);
    }

    static Stream<Arguments> jvmRaised() {
        Object[] strings = new String[1];
        int[] nothing = null;
        Object boxed = 42;
        int zero = 0;
        int size = -1;
        int[] two = new int[2];
        int index = 2;
        return Stream.of(
                Arguments.of(
                        "integer division by zero",
                        (ThrowingCallable) () -> {
                            int ignored = 1 / zero;
                        },
                        ArithmeticException.class),
                Arguments.of(
                        "index past the end",
                        (ThrowingCallable) () -> {
                            int ignored = two[index];
                        },
                        ArrayIndexOutOfBoundsException.class),
                Arguments.of(
                        "negative array size",
                        (ThrowingCallable) () -> {
                            int[] ignored = new int[size];
                        },
                        NegativeArraySizeException.class),
                Arguments.of(
                        "impermissible cast",
                        (ThrowingCallable) () -> {
                            String ignored = (String) boxed;
                        },
                        ClassCastException.class),
                Arguments.of(
                        "wrong type stored in an array",
                        (ThrowingCallable) () -> strings[0] = 1,
                        ArrayStoreException.class),
                Arguments.of(
                        "null array reference",
                        (ThrowingCallable) () -> {
                            int ignored = nothing[0];
                        },
                        NullPointerException.class));
    }

    @ParameterizedTest(name = "{0} → {2}")
    @MethodSource("jvmRaised")
    @DisplayName("M06 §1 · the JVM raises the JLS §15.6 run-time exceptions itself, all of them unchecked")
    void jvm_raisesUncheckedExceptions_forViolatedExpressionSemantics(
            String description, ThrowingCallable expression, Class<? extends Throwable> expected) {
        Throwable thrown = catchThrowable(expression);

        assertThat(thrown).isExactlyInstanceOf(expected);
        assertThat(ExceptionKind.of(thrown.getClass())).isEqualTo(ExceptionKind.UNCHECKED);
    }

    @Test
    @DisplayName("M06 §1 · an Error can be caught like any other Throwable")
    void error_canBeCaught() {
        Throwable caught = null;
        try {
            recurseForever(0);
        } catch (StackOverflowError e) {
            caught = e;
        }

        assertThat(caught).isInstanceOf(VirtualMachineError.class);
    }

    @Test
    @DisplayName("M06 §1 · the JVM does not check: a checked exception can escape a method that declares nothing")
    void jvm_doesNotEnforceCheckedExceptions() {
        IOException original = new IOException("disk");

        Throwable thrown = catchThrowable(() -> UncheckedThrow.sneakyThrow(original));

        assertThat(thrown).isSameAs(original);
        assertThat(ExceptionKind.of(thrown.getClass())).isEqualTo(ExceptionKind.CHECKED);
    }

    @Test
    @DisplayName("M06 §1 · a helpful NullPointerException message names the null expression")
    void helpfulNpe_namesTheNullExpression() {
        Order order = new Order(null);

        Throwable thrown = catchThrowable(() -> order.customer().name());

        assertThat(thrown).isInstanceOf(NullPointerException.class);
        assertThat(thrown.getMessage())
                .startsWith("Cannot invoke \"")
                .contains("Customer.name()\" because the return value of \"")
                .endsWith("Order.customer()\" is null");
    }

    @Test
    @DisplayName("M06 §1 · throw null throws a NullPointerException instead")
    void throwNull_throwsNullPointerException() {
        RuntimeException nothing = null;

        Throwable thrown = catchThrowable(() -> {
            throw nothing;
        });

        assertThat(thrown).isExactlyInstanceOf(NullPointerException.class);
    }

    private static int recurseForever(int depth) {
        return recurseForever(depth + 1) + 1;
    }
}
