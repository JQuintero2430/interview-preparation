package dev.interview.javalanguage.m04.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m01.support.OutputCapture;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The printed lines and diagnostic keys are the claims the guide makes, so the expected values stay literal.
class Q04OutputsTest {

    private static final String SOURCE_NAME = "Probe";
    private static final String CANNOT_RESOLVE = "compiler.err.cant.resolve.location.args";

    @Test
    @DisplayName("Q04.02 · reversed, getFirst, addFirst and putFirst print the documented views and relocations")
    void q04_02_printsSequencedResults() {
        List<String> lines = OutputCapture.linesOf(() -> Q04_02.main(new String[0]));

        assertThat(lines)
                .containsExactly(
                        "[c, b, a]", "a", "[a, b, c, d]", "[d, c, b, a]", "[c, a, b]", "b", "2", "{b=20, a=1}", "a=1");
    }

    @Test
    @DisplayName("Q04.02 · reversed() and getFirst() do not compile on a variable typed Set")
    void q04_02_setHasNoSequencedMethods() {
        InMemoryCompiler.Result result = compileBody("java.util.Set<String> tags = new java.util.LinkedHashSet<>();\n"
                + "Object last = tags.reversed().getFirst();\n");

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly(CANNOT_RESOLVE);
    }

    @Test
    @DisplayName("Q04.07 · remove(1) removes index 1, remove(Integer.valueOf(1)) removes the value, indexOf(7) is -1")
    void q04_07_printsRemovalResults() {
        List<String> lines = OutputCapture.linesOf(() -> Q04_07.main(new String[0]));

        assertThat(lines).containsExactly("[1, 3]", "[3]", "-1", "[3]");
    }

    @Test
    @DisplayName("Q04.07 · the buggy removeBlocked removes by index, the fixed one by value, and a Collection by value")
    void q04_07_bugAndFix() {
        assertThat(Q04_07.removeBlockedBuggy(List.of(5, 1, 9), 1)).containsExactly(5, 9);
        assertThat(Q04_07.removeBlockedFixed(List.of(5, 1, 9), 1)).containsExactly(5, 9);
        assertThat(Q04_07.removeBlockedBuggy(List.of(5, 1, 9), 0)).containsExactly(1, 9);
        assertThat(Q04_07.removeBlockedFixed(List.of(5, 1, 9), 0)).containsExactly(5, 1, 9);
        assertThat(Q04_07.removeThroughCollection(List.of(5, 1, 9), 1)).containsExactly(5, 9);
        assertThat(Q04_07.removeThroughCollection(List.of(5, 1, 9), 0)).containsExactly(5, 1, 9);
    }

    @Test
    @DisplayName("Q04.07 · the buggy removeBlocked throws when the id is not a valid index")
    void q04_07_bugThrowsForLargeIds() {
        assertThatThrownBy(() -> Q04_07.removeBlockedBuggy(List.of(5, 1, 9), 9))
                .isInstanceOf(IndexOutOfBoundsException.class);
    }

    private static InMemoryCompiler.Result compileBody(String body) {
        String source = "class " + SOURCE_NAME + " {\n void run() {\n" + body + " }\n}\n";
        return InMemoryCompiler.compile(Map.of(SOURCE_NAME, source));
    }
}
