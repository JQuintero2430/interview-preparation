package dev.interview.javalanguage.m01.s10;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §10: a compile-time constant is copied into the caller's bytecode, so the claim is checked by
// replacing only the defining class and observing which value the untouched caller still returns.
class ConstantInliningTest {

    private static final String A_NAME = "A";
    private static final String B_NAME = "B";
    private static final String FIELD = "VALUE";
    private static final String READ = "read";
    private static final int OLD_VALUE = 1;
    private static final int NEW_VALUE = 2;

    private static final String B_SOURCE = "public class B { public static int read() { return A.VALUE; } }";
    private static final String A_LITERAL_V1 = "public class A { public static final int VALUE = 1; }";
    private static final String A_LITERAL_V2 = "public class A { public static final int VALUE = 2; }";
    private static final String A_CALL_V1 =
            "public class A { static int make() { return 1; } public static final int VALUE = make(); }";
    private static final String A_CALL_V2 =
            "public class A { static int make() { return 2; } public static final int VALUE = make(); }";

    @Test
    @DisplayName("M01 §10 · constant inlined: changing it without recompiling the caller keeps the old value")
    void read_returnsOldValue_whenTheConstantChangedAndTheCallerWasNotRecompiled() throws Exception {
        var stale = overlayRecompiledA(A_LITERAL_V1, A_LITERAL_V2);

        Object fromCaller = stale.load(B_NAME).getMethod(READ).invoke(null);
        Object fromDefiningClass = stale.load(A_NAME).getField(FIELD).get(null);

        assertThat(fromCaller).isEqualTo(OLD_VALUE);
        assertThat(fromDefiningClass).isEqualTo(NEW_VALUE);
    }

    @Test
    @DisplayName("M01 §10 · static final field initialised from a method call is not a constant, so the caller reads"
            + " the new value")
    void read_returnsNewValue_whenTheFieldIsInitialisedFromAMethodCall() throws Exception {
        var stale = overlayRecompiledA(A_CALL_V1, A_CALL_V2);

        Object fromCaller = stale.load(B_NAME).getMethod(READ).invoke(null);
        Object fromDefiningClass = stale.load(A_NAME).getField(FIELD).get(null);

        assertThat(fromCaller).isEqualTo(NEW_VALUE);
        assertThat(fromDefiningClass).isEqualTo(NEW_VALUE);
    }

    private static InMemoryCompiler.Result overlayRecompiledA(String aV1, String aV2) {
        var first = InMemoryCompiler.compile(Map.of(A_NAME, aV1, B_NAME, B_SOURCE));
        var recompiledA = InMemoryCompiler.compile(Map.of(A_NAME, aV2));
        assertThat(first.success()).isTrue();
        assertThat(recompiledA.success()).isTrue();
        Map<String, byte[]> overlaid = new HashMap<>(first.classes());
        overlaid.putAll(recompiledA.classes());
        return new InMemoryCompiler.Result(true, List.of(), overlaid);
    }
}
