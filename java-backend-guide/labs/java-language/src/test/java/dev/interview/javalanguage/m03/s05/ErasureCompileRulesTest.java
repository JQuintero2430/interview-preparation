package dev.interview.javalanguage.m03.s05;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Module 03 §5: the compile-time rules that exist because type arguments are erased.
class ErasureCompileRulesTest {

    private static final String SOURCE_NAME = "Raw";
    private static final String NOT_SAFE_INSTANCEOF = "compiler.err.instanceof.reifiable.not.safe";
    private static final String NAME_CLASH = "compiler.err.name.clash.same.erasure";
    private static final String CLASS_REQUIRED = "compiler.err.type.found.req";
    private static final String TYPE_VARIABLE_DEREFERENCED = "compiler.err.type.var.cant.be.deref";
    private static final String STATIC_REFERENCE = "compiler.err.non-static.cant.be.ref";

    private static final String INSTANCEOF_LIST_OF_STRING =
            "boolean test(Object o) { return o instanceof List<String>; }";
    private static final String INSTANCEOF_LIST_OF_UNBOUNDED =
            "boolean test(Object o) { return o instanceof List<?>; }";
    private static final String INSTANCEOF_ARRAY_LIST_FROM_LIST = """
            boolean test(List<String> l) { return l instanceof ArrayList<String>; }
            int size(List<String> l) { return l instanceof ArrayList<String> a ? a.size() : 0; }
            """;
    private static final String INSTANCEOF_ARRAY_LIST_ONLY =
            "boolean test(List<String> l) { return l instanceof ArrayList<String>; }";
    private static final String NOT_SUPPORTED_IN_SOURCE = "compiler.err.feature.not.supported.in.source";
    private static final String RELEASE = "--release";
    private static final String JAVA_15 = "15";
    private static final String RECORDS = "record Order() {} record Invoice() {}\n";
    private static final String OVERLOADS_SAME_ERASURE =
            RECORDS + "void process(List<Order> o) {} void process(List<Invoice> i) {}";
    private static final String OVERLOADS_DIFFERENT_ERASURE =
            RECORDS + "void process(List<Order> o) {} void process(Set<Invoice> i) {}";
    private static final String NEW_TYPE_VARIABLE = "static class Box<T> { T make() { return new T(); } }";
    private static final String TYPE_VARIABLE_CLASS_LITERAL =
            "static class Box<T> { Object kind() { return T.class; } }";
    private static final String CLASS_TOKEN_INSTEAD =
            "static class Box<T> { final Class<T> kind; Box(Class<T> kind) { this.kind = kind; } }";
    private static final String STATIC_FIELD_OF_TYPE_VARIABLE = "static class Box<T> { static T shared; }";
    private static final String INSTANCE_FIELD_OF_TYPE_VARIABLE = "static class Box<T> { T own; }";

    @Test
    @DisplayName("M03 §5 · instanceof List<String> does not compile, instanceof List<?> does")
    void compile_rejectsInstanceofListOfString_whenTheCheckIsNotSafe() {
        assertThat(compile(INSTANCEOF_LIST_OF_STRING).errorCodes()).contains(NOT_SAFE_INSTANCEOF);
        assertThat(compile(INSTANCEOF_LIST_OF_UNBOUNDED).success()).isTrue();
        assertThat(compile(INSTANCEOF_ARRAY_LIST_FROM_LIST).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §5 · instanceof ArrayList<String> from List<String> is rejected with --release 15")
    void compile_rejectsCheckedNonReifiableInstanceof_whenReleaseIs15() {
        InMemoryCompiler.Result result =
                InMemoryCompiler.compile(Map.of(SOURCE_NAME, source(INSTANCEOF_ARRAY_LIST_ONLY)), RELEASE, JAVA_15);

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).anySatisfy(code -> assertThat(code).startsWith(NOT_SUPPORTED_IN_SOURCE));
    }

    @Test
    @DisplayName("M03 §5 · process(List<Order>) and process(List<Invoice>) clash after erasure")
    void compile_rejectsOverloads_whenTheyHaveTheSameErasure() {
        assertThat(compile(OVERLOADS_SAME_ERASURE).errorCodes()).contains(NAME_CLASH);
        assertThat(compile(OVERLOADS_DIFFERENT_ERASURE).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §5 · a type variable has no class literal and no constructor")
    void compile_rejectsNewAndClassLiteral_whenAppliedToATypeVariable() {
        assertThat(compile(NEW_TYPE_VARIABLE).errorCodes()).contains(CLASS_REQUIRED);
        assertThat(compile(TYPE_VARIABLE_CLASS_LITERAL).errorCodes()).contains(TYPE_VARIABLE_DEREFERENCED);
        assertThat(compile(CLASS_TOKEN_INSTEAD).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §5 · a static field cannot use the class's type variable")
    void compile_rejectsStaticField_whenItsTypeIsTheClassTypeVariable() {
        assertThat(compile(STATIC_FIELD_OF_TYPE_VARIABLE).errorCodes()).contains(STATIC_REFERENCE);
        assertThat(compile(INSTANCE_FIELD_OF_TYPE_VARIABLE).success()).isTrue();
    }

    private static InMemoryCompiler.Result compile(String members) {
        return InMemoryCompiler.compile(Map.of(SOURCE_NAME, source(members)));
    }

    private static String source(String members) {
        return "import java.util.*;\nclass Raw {\n" + members + "\n}\n";
    }
}
