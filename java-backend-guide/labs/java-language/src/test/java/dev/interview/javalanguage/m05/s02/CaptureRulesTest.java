package dev.interview.javalanguage.m05.s02;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Diagnostic keys, not message text. javac uses one key for lambdas and inner classes; only its argument differs.
class CaptureRulesTest {

    private static final String SOURCE_NAME = "Capture";
    private static final String NOT_EFFECTIVELY_FINAL = "compiler.err.cant.ref.non.effectively.final.var";

    private static final String REASSIGNED_BEFORE = """
            import java.util.function.IntSupplier;
            class Capture { IntSupplier run() { int n = 1; n = 2; return () -> n; } }
            """;
    private static final String INCREMENTED_AFTER = """
            import java.util.function.IntSupplier;
            class Capture { IntSupplier run() { int n = 1; IntSupplier s = () -> n; n++; return s; } }
            """;
    private static final String INCREMENTED_INSIDE = """
            class Capture { Runnable run() { int n = 0; return () -> n++; } }
            """;
    private static final String CLASSIC_FOR_INDEX = """
            import java.util.function.Supplier;
            class Capture {
                void run(String[] words) {
                    for (int i = 0; i < words.length; i++) { Supplier<String> s = () -> words[i]; }
                }
            }
            """;
    private static final String ANONYMOUS_CLASS_REASSIGNED = """
            class Capture {
                Runnable run() {
                    int n = 1;
                    n = 2;
                    return new Runnable() { public void run() { System.out.println(n); } };
                }
            }
            """;
    private static final String LEGAL_CAPTURES = """
            import java.util.ArrayList;
            import java.util.List;
            import java.util.function.Supplier;
            class Capture {
                void run(String[] words) {
                    for (String word : words) { Supplier<String> s = () -> word; }
                    List<String> seen = new ArrayList<>();
                    Runnable add = () -> seen.add("x");
                    int later;
                    later = 3;
                    Supplier<Integer> s = () -> later;
                }
            }
            """;

    @Test
    @DisplayName("M05 §2 · a lambda cannot capture a local that is reassigned")
    void compile_fails_whenCapturedLocalIsReassignedBefore() {
        assertThat(errorCodes(REASSIGNED_BEFORE)).containsExactly(NOT_EFFECTIVELY_FINAL);
    }

    @Test
    @DisplayName("M05 §2 · a write after the lambda also breaks effective finality")
    void compile_fails_whenCapturedLocalIsIncrementedAfter() {
        assertThat(errorCodes(INCREMENTED_AFTER)).containsExactly(NOT_EFFECTIVELY_FINAL);
    }

    @Test
    @DisplayName("M05 §2 · a lambda cannot write a captured local")
    void compile_fails_whenLambdaIncrementsCapturedLocal() {
        assertThat(errorCodes(INCREMENTED_INSIDE)).containsExactly(NOT_EFFECTIVELY_FINAL);
    }

    @Test
    @DisplayName("M05 §2 · a classic for index is not effectively final")
    void compile_fails_whenLambdaCapturesClassicForIndex() {
        assertThat(errorCodes(CLASSIC_FOR_INDEX)).containsExactly(NOT_EFFECTIVELY_FINAL);
    }

    @Test
    @DisplayName("M05 §2 · an anonymous class follows the same capture rule")
    void compile_fails_whenAnonymousClassCapturesReassignedLocal() {
        assertThat(errorCodes(ANONYMOUS_CLASS_REASSIGNED)).containsExactly(NOT_EFFECTIVELY_FINAL);
    }

    @Test
    @DisplayName("M05 §2 · enhanced-for variables, mutated objects and assign-once locals can be captured")
    void compile_succeeds_forEffectivelyFinalVariables() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, LEGAL_CAPTURES));

        assertThat(result.success()).isTrue();
    }

    private static List<String> errorCodes(String source) {
        return InMemoryCompiler.compile(Map.of(SOURCE_NAME, source)).errorCodes();
    }
}
