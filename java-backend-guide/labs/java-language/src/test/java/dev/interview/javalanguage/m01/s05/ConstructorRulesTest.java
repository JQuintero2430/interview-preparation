package dev.interview.javalanguage.m01.s05;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins the javac 25 constructor rules module 01 §5 states: default constructor, prologue limits, release gate.
class ConstructorRulesTest {

    private static final String NO_APPLICABLE_CONSTRUCTOR = "compiler.err.cant.apply.symbol";
    private static final String REFERENCE_BEFORE_SUPER = "compiler.err.cant.ref.before.ctor.called";
    private static final String FEATURE_NOT_IN_RELEASE = "compiler.err.feature.not.supported.in.source";

    private static final String PROLOGUE = """
            class B {
                B() { hook(); }
                void hook() {}
            }
            class W extends B {
                final int n;
                W(int n) {
                    if (n < 0) throw new IllegalArgumentException();
                    this.n = n;
                    super();
                }
            }
            """;

    @Test
    @DisplayName("M01 §5 · no default constructor when one with parameters exists")
    void declaringAnyConstructor_removesTheDefaultOne() {
        var result = InMemoryCompiler.compile(Map.of("P", """
                class P { P(int x) {} }
                class C extends P {}
                class U { P p = new P(); }
                """));

        assertThat(result.errorCodes()).containsExactly(NO_APPLICABLE_CONSTRUCTOR, NO_APPLICABLE_CONSTRUCTOR);
    }

    @Test
    @DisplayName("M01 §5 · prologue cannot call an instance method")
    void prologue_cannotUseThisImplicitly() {
        var result = InMemoryCompiler.compile(Map.of("T", """
                class B2 { String d() { return ""; } }
                class T extends B2 {
                    final String s;
                    T() { s = d(); super(); }
                }
                """));

        assertThat(result.errorCodes()).containsExactly(REFERENCE_BEFORE_SUPER);
    }

    @Test
    @DisplayName("M01 §5 · statements before super() need Java 25")
    void prologue_isRejectedOnRelease24_andCompilesCleanOnRelease25() {
        assertThat(InMemoryCompiler.compile(Map.of("W", PROLOGUE), "--release", "24")
                        .errorCodes())
                .containsExactly(FEATURE_NOT_IN_RELEASE);

        var on25 = InMemoryCompiler.compile(Map.of("W", PROLOGUE), "--release", "25", "-Xlint:all");
        assertThat(on25.success()).isTrue();
        assertThat(on25.diagnostics()).isEmpty();
    }
}
