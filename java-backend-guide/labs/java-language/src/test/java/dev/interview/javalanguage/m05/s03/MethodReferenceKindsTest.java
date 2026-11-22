package dev.interview.javalanguage.m05.s03;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MethodReferenceKindsTest {

    private static final List<String> NAMES = List.of("bob", "Alice", "carol");

    @Test
    @DisplayName("M05 §3 · each kind of method reference produces the same results as its lambda")
    void eachKind_matchesItsLambda() {
        assertThat(MethodRefs.PARSE_REF.apply("42")).isEqualTo(MethodRefs.PARSE_LAMBDA.apply("42"));
        assertThat(MethodRefs.prefixRef("id-").apply("7"))
                .isEqualTo(MethodRefs.prefixLambda("id-").apply("7"))
                .isEqualTo("id-7");
        assertThat(MethodRefs.LENGTH_REF.applyAsInt("stream")).isEqualTo(MethodRefs.LENGTH_LAMBDA.applyAsInt("stream"));
        assertThat(sorted(MethodRefs.IGNORE_CASE_REF))
                .isEqualTo(sorted(MethodRefs.IGNORE_CASE_LAMBDA))
                .containsExactly("Alice", "bob", "carol");
        assertThat(MethodRefs.NEW_LIST_REF.get()).isInstanceOf(ArrayList.class).isEmpty();
        assertThat(MethodRefs.NEW_LIST_LAMBDA.get())
                .isInstanceOf(ArrayList.class)
                .isEmpty();
        assertThat(MethodRefs.NEW_ARRAY_REF.apply(3)).hasSize(3).isEqualTo(MethodRefs.NEW_ARRAY_LAMBDA.apply(3));
    }

    @Test
    @DisplayName("M05 §3 · an unbound reference takes its receiver as the first argument")
    void unboundReference_takesReceiverAsFirstArgument() {
        var inbox = new Mailbox();
        inbox.accept("hello");

        assertThat(Mailbox.anyInbox().apply(inbox)).containsExactly("hello");
        assertThat(inbox.ownInbox().get()).containsExactly("hello");
    }

    private static List<String> sorted(Comparator<String> order) {
        List<String> copy = new ArrayList<>(NAMES);
        copy.sort(order);
        return copy;
    }
}
