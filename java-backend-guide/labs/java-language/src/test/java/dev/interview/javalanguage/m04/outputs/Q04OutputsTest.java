package dev.interview.javalanguage.m04.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m01.support.OutputCapture;
import java.util.ConcurrentModificationException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
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

    @Test
    @DisplayName("Q04.15 · get evicts b, containsKey is not an access and evicts a, insertion order evicts a")
    void q04_15_printsEvictions() {
        List<String> lines = OutputCapture.linesOf(() -> Q04_15.main(new String[0]));

        assertThat(lines).containsExactly("{a=1, c=3}", "{b=2, c=3}", "{b=2, c=3}");
    }

    @Test
    @DisplayName("Q04.15 · removeEldestEntry sees the map already holding the new entry")
    void q04_15_eldestIsOfferedAfterTheInsert() {
        assertThat(Q04_15.sizesSeenByRemoveEldestEntry()).containsExactly(1, 2, 3);
    }

    @Test
    @DisplayName("Q04.21 · a PriorityQueue offered 5, 1, 4, 2, 3 prints its heap array and polls in order")
    void q04_21_printsHeapThenPollOrder() {
        List<String> lines = OutputCapture.linesOf(() -> Q04_21.main(new String[0]));

        assertThat(lines).containsExactly("[1, 2, 4, 5, 3]", "1 2 3 4 5", "[]");
    }

    @Test
    @DisplayName("Q04.23 · removing in a for-each loop throws, ends early silently, or throws after the last element")
    void q04_23_printsLoopOutcomes() {
        List<String> lines = OutputCapture.linesOf(() -> Q04_23.main(new String[0]));

        assertThat(lines)
                .containsExactly(
                        "visited [a, b], then ConcurrentModificationException",
                        "visited [a, b], list [a, c]",
                        "visited [a, b, c], then ConcurrentModificationException");
    }

    @Test
    @DisplayName("Q04.23 · the buggy dropBlocked keeps a blocked user without an exception, removeIf does not")
    void q04_23_bugAndFix() {
        List<String> users = List.of("ann", "bob", "cy");

        assertThat(Q04_23.dropBlockedBuggy(users, Set.of("bob"))).containsExactly("ann", "cy");
        assertThat(Q04_23.dropBlockedBuggy(users, Set.of("bob", "cy"))).containsExactly("ann", "cy");
        assertThat(Q04_23.dropBlockedFixed(users, Set.of("bob", "cy"))).containsExactly("ann");
        assertThatThrownBy(() -> Q04_23.dropBlockedBuggy(users, Set.of("ann")))
                .isInstanceOf(ConcurrentModificationException.class);
    }

    @Test
    @DisplayName(
            "Q04.27 · List.of, unmodifiableList, Arrays.asList and Stream.toList answer set, add and contains(null)")
    void q04_27_printsListBehaviors() {
        List<String> lines = OutputCapture.linesOf(() -> Q04_27.main(new String[0]));

        assertThat(lines)
                .containsExactly(
                        "List.of: set UnsupportedOperationException, add UnsupportedOperationException,"
                                + " contains(null) NullPointerException",
                        "unmodifiableList: set UnsupportedOperationException, add UnsupportedOperationException,"
                                + " contains(null) false",
                        "Arrays.asList: set a, add UnsupportedOperationException, contains(null) false",
                        "[z, b]",
                        "Stream.toList: set UnsupportedOperationException, add UnsupportedOperationException,"
                                + " contains(null) false");
    }

    @Test
    @DisplayName("Q04.27 · follow-ups: Collectors.toList accepts both mutators in JDK 25; List.of rejects a no-op set")
    void q04_27_followUps() {
        assertThat(Q04_27.probe("Collectors.toList", Stream.of("a", "b").collect(Collectors.toList())))
                .isEqualTo("Collectors.toList: set a, add true, contains(null) false");
        assertThatThrownBy(() -> List.of("a", "b").set(0, "a")).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("Q04.30 · lists and sets compare by contents across classes, arrays by identity")
    void q04_30_printsEqualityResults() {
        List<String> lines = OutputCapture.linesOf(() -> Q04_30.main(new String[0]));

        assertThat(lines).containsExactly("true true", "true true", "false false", "false true", "false true");
    }

    private static InMemoryCompiler.Result compileBody(String body) {
        String source = "class " + SOURCE_NAME + " {\n void run() {\n" + body + " }\n}\n";
        return InMemoryCompiler.compile(Map.of(SOURCE_NAME, source));
    }
}
