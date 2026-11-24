package dev.interview.javalanguage.m06.s03;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Diagnostic keys, not message text: javac messages are localized and reworded between releases.
class TwrCompileRulesTest {

    private static final String SOURCE_NAME = "Resources";

    private static final String NOT_AUTOCLOSEABLE = """
            class Resources {
                void run() {
                    try (String text = "not a resource") { }
                }
            }
            """;
    private static final String REASSIGNED_VARIABLE = """
            class Resources {
                void run() throws Exception {
                    AutoCloseable resource = () -> { };
                    resource = () -> { };
                    try (resource) { }
                }
            }
            """;
    private static final String NON_FINAL_FIELD = """
            class Resources {
                AutoCloseable resource = () -> { };
                void run() throws Exception {
                    try (resource) { }
                }
            }
            """;
    private static final String FINAL_FIELD = """
            class Resources {
                final AutoCloseable resource = () -> { };
                void run() throws Exception {
                    try (resource) { }
                }
            }
            """;
    private static final String ASSIGNED_IN_BODY = """
            class Resources {
                void run() throws Exception {
                    try (AutoCloseable resource = () -> { }) { resource = null; }
                }
            }
            """;
    private static final String IMPLICIT_CLOSE_UNHANDLED = """
            class Resources {
                void run() {
                    try (AutoCloseable resource = () -> { }) { }
                }
            }
            """;

    @Test
    @DisplayName("M06 §3 · a resource type must be a subtype of AutoCloseable")
    void compile_fails_forNonAutoCloseableResource() {
        assertErrors(NOT_AUTOCLOSEABLE, "compiler.err.prob.found.req");
    }

    @Test
    @DisplayName("M06 §3 · an existing variable used as a resource must be effectively final")
    void compile_fails_forReassignedVariableResource() {
        assertErrors(REASSIGNED_VARIABLE, "compiler.err.try.with.resources.expr.effectively.final.var");
    }

    @Test
    @DisplayName("M06 §3 · a non-final field cannot be a resource, a final field can")
    void compile_rejectsNonFinalField_acceptsFinalField() {
        assertErrors(NON_FINAL_FIELD, "compiler.err.try.with.resources.expr.effectively.final.var");
        assertThat(InMemoryCompiler.compile(Map.of(SOURCE_NAME, FINAL_FIELD)).errorCodes())
                .isEmpty();
    }

    @Test
    @DisplayName("M06 §3 · a resource declared in the header is implicitly final")
    void compile_fails_whenResourceIsAssignedInBody() {
        assertErrors(ASSIGNED_IN_BODY, "compiler.err.try.resource.may.not.be.assigned");
    }

    @Test
    @DisplayName("M06 §3 · the checked exception of the implicit close() must be caught or declared")
    void compile_fails_whenImplicitCloseExceptionIsUnhandled() {
        assertErrors(IMPLICIT_CLOSE_UNHANDLED, "compiler.err.unreported.exception.implicit.close");
    }

    private static void assertErrors(String source, String expectedKey) {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, source));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(expectedKey);
    }
}
