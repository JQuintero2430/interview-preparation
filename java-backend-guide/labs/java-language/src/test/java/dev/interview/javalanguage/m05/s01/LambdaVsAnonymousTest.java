package dev.interview.javalanguage.m05.s01;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class LambdaVsAnonymousTest {

    @Test
    @DisplayName(
            "M05 §1 · this inside a lambda is the enclosing instance, inside an anonymous class it is the anonymous object")
    void this_refersToEnclosingInstanceInLambda_andToAnonymousObjectInAnonymousClass() {
        Greeter greeter = new Greeter("Ada");

        assertThat(greeter.lambdaThis().get()).isEqualTo("Greeter for Ada");
        assertThat(greeter.anonymousThis().get()).isEqualTo("anonymous supplier");
    }

    @Test
    @DisplayName("M05 §1 · an anonymous class can keep state between calls, a lambda has no fields of its own")
    void anonymousClass_keepsCounterField_betweenCalls() {
        Supplier<Integer> counter = Greeter.countingSupplier();

        List<Integer> values = Stream.generate(counter).limit(3).toList();

        assertThat(values).containsExactly(1, 2, 3);
    }
}
