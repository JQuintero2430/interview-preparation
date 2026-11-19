package dev.interview.javalanguage.m03.s04;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// One key covers every rejection here, so each test pairs a rejected source with the nearest accepted one.
class WildcardCompileRulesTest {

    private static final String SOURCE_NAME = "Raw";
    private static final String INCOMPATIBLE_TYPES = "compiler.err.prob.found.req";

    private static final String LIST_OF_INTEGER_AS_LIST_OF_NUMBER =
            "void run(List<Integer> ints) { List<Number> nums = ints; }";
    private static final String LIST_OF_INTEGER_AS_EXTENDS_NUMBER =
            "void run(List<Integer> ints) { List<? extends Number> nums = ints; }";
    private static final String INTEGER_ARRAY_AS_NUMBER_ARRAY = "void run(Integer[] ints) { Number[] nums = ints; }";
    private static final String EXTENDS_ADD_INTEGER = "void run(List<? extends Number> nums) { nums.add(1); }";
    private static final String EXTENDS_ADD_NUMBER =
            "void run(List<? extends Number> nums) { Number n = 1; nums.add(n); }";
    private static final String EXTENDS_ADD_NULL_AND_READ =
            "void run(List<? extends Number> nums) { nums.add(null); Number n = nums.get(0); }";
    private static final String SUPER_ADD_AND_READ_OBJECT =
            "void run(List<? super Integer> sink) { sink.add(1); Object o = sink.get(0); }";
    private static final String SUPER_READ_INTEGER =
            "void run(List<? super Integer> sink) { Integer i = sink.get(0); }";
    private static final String SUPER_ADD_NUMBER =
            "void run(List<? super Integer> sink) { Number n = 1; sink.add(n); }";
    private static final String LIST_OF_DOUBLE_AS_SUPER_INTEGER =
            "void run(List<Double> ds) { List<? super Integer> sink = ds; }";
    private static final String SWAP_DIRECT = "void swap(List<?> list) { list.set(0, list.get(1)); }";
    private static final String SWAP_WITH_HELPER = """
            void swap(List<?> list) { swapHelper(list); }
            private <E> void swapHelper(List<E> list) { list.set(0, list.get(1)); }
            """;
    private static final String LIST_OF_STRING_AS_UNBOUNDED =
            "void run(List<String> s) { List<?> any = s; Object o = any.get(0); }";
    private static final String LIST_OF_STRING_AS_LIST_OF_OBJECT =
            "void run(List<String> s) { List<Object> objs = s; }";
    private static final String UNBOUNDED_ADD = "void run(List<?> any) { any.add(\"x\"); }";
    private static final String LIST_OF_OBJECT_ADD = "void run(List<Object> objs) { objs.add(\"x\"); objs.add(1); }";

    @Test
    @DisplayName("M03 §4 · List<Integer> is not assignable to List<Number>")
    void compile_rejectsListOfNumber_whenAssignedAListOfInteger() {
        assertThat(compile(LIST_OF_INTEGER_AS_LIST_OF_NUMBER).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(LIST_OF_INTEGER_AS_EXTENDS_NUMBER).success()).isTrue();
        assertThat(compile(INTEGER_ARRAY_AS_NUMBER_ARRAY).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §4 · add on List<? extends Number> does not compile")
    void compile_rejectsAdd_whenListTypeIsAnExtendsWildcard() {
        assertThat(compile(EXTENDS_ADD_INTEGER).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(EXTENDS_ADD_NUMBER).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(EXTENDS_ADD_NULL_AND_READ).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §4 · a List<? super Integer> takes Integers and gives back Objects")
    void compile_acceptsIntegerWritesAndObjectReads_whenListTypeIsASuperWildcard() {
        assertThat(compile(SUPER_ADD_AND_READ_OBJECT).success()).isTrue();
        assertThat(compile(SUPER_READ_INTEGER).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(SUPER_ADD_NUMBER).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(LIST_OF_DOUBLE_AS_SUPER_INTEGER).errorCodes()).contains(INCOMPATIBLE_TYPES);
    }

    @Test
    @DisplayName("M03 §4 · a capture helper makes swap(List<?>) compile")
    void compile_succeedsOnlyWithACaptureHelper_whenSwappingInAnUnboundedList() {
        assertThat(compile(SWAP_DIRECT).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(SWAP_WITH_HELPER).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §4 · List<?> accepts any list and List<Object> does not")
    void compile_acceptsAnyListOnlyAsUnboundedWildcard_whenAssignedAListOfString() {
        assertThat(compile(LIST_OF_STRING_AS_UNBOUNDED).success()).isTrue();
        assertThat(compile(LIST_OF_STRING_AS_LIST_OF_OBJECT).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(UNBOUNDED_ADD).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(LIST_OF_OBJECT_ADD).success()).isTrue();
    }

    private static String source(String members) {
        return "import java.util.*;\nclass Raw {\n" + members + "\n}\n";
    }

    private static InMemoryCompiler.Result compile(String members) {
        return InMemoryCompiler.compile(Map.of(SOURCE_NAME, source(members)));
    }
}
