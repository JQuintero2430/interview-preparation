package dev.interview.javalanguage.m04.s01;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Diagnostic keys, not message text: javac messages are localized and reworded between releases.
class CollectionCompileRulesTest {

    private static final String SOURCE_NAME = "Shapes";
    private static final String INCOMPATIBLE_TYPES = "compiler.err.prob.found.req";
    private static final String CANNOT_FIND_METHOD = "compiler.err.cant.resolve.location.args";

    private static final String MAP_AS_COLLECTION = """
            import java.util.*;
            class Shapes {
                Collection<?> run() { return new HashMap<String, Integer>(); }
            }
            """;
    private static final String GET_FIRST_ON_SET = """
            import java.util.*;
            class Shapes {
                String run(Set<String> tags) { return tags.getFirst(); }
            }
            """;
    private static final String GET_FIRST_ON_LINKED_HASH_SET = """
            import java.util.*;
            class Shapes {
                String run(LinkedHashSet<String> tags) { return tags.getFirst(); }
            }
            """;

    @Test
    @DisplayName("M04 §1 · a HashMap is not assignable to Collection")
    void compile_fails_whenMapIsUsedAsCollection() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, MAP_AS_COLLECTION));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(INCOMPATIBLE_TYPES);
    }

    @Test
    @DisplayName("M04 §1 · getFirst does not compile on a Set")
    void compile_fails_whenGetFirstIsCalledOnSet() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, GET_FIRST_ON_SET));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(CANNOT_FIND_METHOD);
    }

    @Test
    @DisplayName("M04 §1 · getFirst compiles on a LinkedHashSet")
    void compile_succeeds_whenGetFirstIsCalledOnLinkedHashSet() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, GET_FIRST_ON_LINKED_HASH_SET));

        assertThat(result.success()).isTrue();
    }
}
