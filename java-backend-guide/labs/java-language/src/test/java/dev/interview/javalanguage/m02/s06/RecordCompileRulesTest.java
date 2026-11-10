package dev.interview.javalanguage.m02.s06;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Module 02 §6: the rules javac enforces on records, asserted by compiling small sources. */
class RecordCompileRulesTest {

    private static final String SOURCE_NAME = "Sample";

    private static final String INSTANCE_FIELD = "record A(int x) { private int y; }";
    private static final String INSTANCE_FIELD_CODE = "compiler.err.record.cannot.declare.instance.fields";

    private static final String EXTENDS_CLASS = "class Base {} record B(int x) extends Base {}";
    private static final String EXPECTED_CODE = "compiler.err.expected";

    private static final String COMPACT_ASSIGNS_FIELD = "record C(int x) { C { this.x = x; } }";
    private static final String CANT_ASSIGN_CODE = "compiler.err.cant.assign.val.to.var";

    private static final String PACKAGE_PRIVATE_ACCESSOR = "record D(int x) { int x() { return x; } }";
    private static final String INVALID_ACCESSOR_CODE = "compiler.err.invalid.accessor.method.in.record";

    private static final String ALLOWED_MEMBERS = """
            record F(int x) implements Comparable<F> {
                static final int ZERO = 0;
                static F of(int x) { return new F(x); }
                F() { this(ZERO); }
                public int compareTo(F other) { return Integer.compare(x, other.x); }
            }
            """;

    @Test
    @DisplayName("M02 §6 · a record cannot declare an instance field")
    void record_doesNotCompile_whenItDeclaresAnInstanceField() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, INSTANCE_FIELD));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).contains(INSTANCE_FIELD_CODE);
    }

    @Test
    @DisplayName("M02 §6 · a record cannot extend a class")
    void record_doesNotCompile_whenItExtendsAClass() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, EXTENDS_CLASS));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).contains(EXPECTED_CODE);
    }

    @Test
    @DisplayName("M02 §6 · a compact constructor cannot assign the field")
    void record_doesNotCompile_whenCompactConstructorAssignsTheField() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, COMPACT_ASSIGNS_FIELD));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).contains(CANT_ASSIGN_CODE);
    }

    @Test
    @DisplayName("M02 §6 · an explicit accessor must be public")
    void record_doesNotCompile_whenExplicitAccessorIsNotPublic() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, PACKAGE_PRIVATE_ACCESSOR));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).contains(INVALID_ACCESSOR_CODE);
    }

    @Test
    @DisplayName("M02 §6 · a record may have static members, extra constructors and interfaces")
    void record_compiles_whenItUsesStaticMembersDelegatingConstructorAndInterface() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, ALLOWED_MEMBERS));

        assertThat(result.success()).isTrue();
        assertThat(result.errorCodes()).isEmpty();
    }
}
