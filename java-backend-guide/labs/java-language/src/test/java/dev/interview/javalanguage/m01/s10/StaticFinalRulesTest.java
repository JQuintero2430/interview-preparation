package dev.interview.javalanguage.m01.s10;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §10: the final and static rules are compiler and JVM behavior, so each claim is checked against
// javac and the runtime.
class StaticFinalRulesTest {

    private static final String STATIC_REFERENCES_INSTANCE_CODE = "compiler.err.non-static.cant.be.ref";
    private static final String BLANK_FINAL_UNASSIGNED_CODE = "compiler.err.var.might.not.have.been.initialized";
    private static final String FINAL_ASSIGNED_TWICE_CODE = "compiler.err.var.might.already.be.assigned";
    private static final String LAMBDA_CAPTURES_MUTATED_LOCAL_CODE = "compiler.err.cant.ref.non.effectively.final.var";

    private static final String SOURCE_NAME = "T";
    private static final String STATIC_READS_INSTANCE_FIELD = "class T { int x; static int f() { return x; } }";
    private static final String BLANK_FINAL_UNASSIGNED = "class T { final int x; T() {} }";
    private static final String FINAL_ASSIGNED_TWICE = "class T { final int x; T() { x = 1; x = 2; } }";
    private static final String LAMBDA_CAPTURES_MUTATED_LOCAL =
            "class T { Runnable f() { int n = 0; n = 1; return () -> System.out.println(n); } }";

    private static final String ENTRY = "entry";

    static class Counter {
        private static int count;

        int next() {
            count++;
            return count;
        }
    }

    @Test
    @DisplayName("M01 §10 · static method cannot reference an instance field")
    void staticMethod_doesNotCompile_whenItReadsAnInstanceField() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, STATIC_READS_INSTANCE_FIELD));

        assertThat(result.errorCodes()).containsExactly(STATIC_REFERENCES_INSTANCE_CODE);
    }

    @Test
    @DisplayName("M01 §10 · blank final field left unassigned does not compile")
    void blankFinalField_doesNotCompile_whenTheConstructorNeverAssignsIt() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, BLANK_FINAL_UNASSIGNED));

        assertThat(result.errorCodes()).containsExactly(BLANK_FINAL_UNASSIGNED_CODE);
    }

    @Test
    @DisplayName("M01 §10 · final field assigned twice does not compile")
    void finalField_doesNotCompile_whenTheConstructorAssignsItTwice() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, FINAL_ASSIGNED_TWICE));

        assertThat(result.errorCodes()).containsExactly(FINAL_ASSIGNED_TWICE_CODE);
    }

    @Test
    @DisplayName("M01 §10 · lambda cannot capture a local that is not effectively final")
    void lambda_doesNotCompile_whenItCapturesALocalThatWasReassigned() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, LAMBDA_CAPTURES_MUTATED_LOCAL));

        assertThat(result.errorCodes()).containsExactly(LAMBDA_CAPTURES_MUTATED_LOCAL_CODE);
    }

    @Test
    @DisplayName("M01 §10 · final reference still allows mutating the object")
    void finalReference_allowsMutation_whenTheReferencedObjectIsMutable() {
        final List<String> entries = new ArrayList<>();

        entries.add(ENTRY);

        assertThat(entries).containsExactly(ENTRY);
    }

    @Test
    @DisplayName("M01 §10 · static mutable state is shared across instances and leaks between callers")
    void next_continuesFromTheFirstCallersCount_whenAnotherInstanceIsUsed() {
        var first = new Counter();
        var second = new Counter();

        int firstCount = first.next();
        int secondCount = second.next();

        assertThat(secondCount).isEqualTo(firstCount + 1);
    }
}
