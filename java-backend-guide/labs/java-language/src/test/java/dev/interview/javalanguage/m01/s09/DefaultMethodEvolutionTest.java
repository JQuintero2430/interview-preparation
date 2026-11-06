package dev.interview.javalanguage.m01.s09;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §9: JLS 13.5.7 keeps old binaries linkable after a default method is added, so the stale class
// must load and instantiate, and only the call that reaches the clashing method may fail.
class DefaultMethodEvolutionTest {

    private static final String TYPES_INCOMPATIBLE = "compiler.err.types.incompatible";
    private static final String CALL = "call";
    private static final String I_VALUE = "I";
    private static final String I_NAME = "I";
    private static final String J_NAME = "J";
    private static final String C_NAME = "C";

    private static final String I_SOURCE = "public interface I { default String m() { return \"I\"; } }";
    private static final String J_V1_SOURCE = "public interface J {}";
    private static final String J_V2_SOURCE = "public interface J { default String m() { return \"J\"; } }";
    private static final String C_SOURCE = "public class C implements I, J { public String call() { return m(); } }";

    @Test
    @DisplayName("M01 §9 · new clashing default fails when the implementer is recompiled")
    void recompile_fails_whenTheSecondInterfaceGainsAClashingDefault() {
        var before = InMemoryCompiler.compile(Map.of(I_NAME, I_SOURCE, J_NAME, J_V1_SOURCE, C_NAME, C_SOURCE));
        assertThat(before.success()).isTrue();

        var after = InMemoryCompiler.compile(Map.of(I_NAME, I_SOURCE, J_NAME, J_V2_SOURCE, C_NAME, C_SOURCE));

        assertThat(after.errorCodes()).containsExactly(TYPES_INCOMPATIBLE);
    }

    @Test
    @DisplayName("M01 §9 · stale class file gets IncompatibleClassChangeError at the call")
    void staleImplementer_throwsIncompatibleClassChangeError_whenTheInterfaceGainedAClashingDefault() throws Exception {
        var v1 = InMemoryCompiler.compile(Map.of(I_NAME, I_SOURCE, J_NAME, J_V1_SOURCE, C_NAME, C_SOURCE));
        var jV2 = InMemoryCompiler.compile(Map.of(J_NAME, J_V2_SOURCE));
        Map<String, byte[]> overlaid = new HashMap<>(v1.classes());
        overlaid.putAll(jV2.classes());
        var stale = new InMemoryCompiler.Result(true, List.of(), overlaid);
        Class<?> controlClass = v1.load(C_NAME);
        Method control = controlClass.getMethod(CALL);
        Object controlInstance = controlClass.getDeclaredConstructor().newInstance();
        Class<?> staleClass = stale.load(C_NAME);
        Method staleCall = staleClass.getMethod(CALL);
        Object staleInstance = staleClass.getDeclaredConstructor().newInstance();

        assertThat(control.invoke(controlInstance)).isEqualTo(I_VALUE);
        assertThatThrownBy(() -> staleCall.invoke(staleInstance))
                .isInstanceOf(InvocationTargetException.class)
                .hasCauseExactlyInstanceOf(IncompatibleClassChangeError.class);
    }
}
