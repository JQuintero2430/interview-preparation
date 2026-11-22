package dev.interview.javalanguage.m05.s03;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m05.support.ClassFileView;
import java.lang.constant.DirectMethodHandleDesc;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MethodReferenceCompiledFormTest {

    private static final String LENGTH_REFERENCE = """
            import java.util.function.ToIntFunction;
            class Refs { ToIntFunction<String> length = String::length; }
            """;

    @Test
    @DisplayName("M05 §3 · String::length compiles to invokedynamic whose implementation is String.length itself")
    void methodReference_pointsCallSiteAtReferencedMethod() {
        var view = ClassFileView.of(InMemoryCompiler.compile(Map.of("Refs", LENGTH_REFERENCE))
                .classes()
                .get("Refs"));

        assertThat(view.bootstrapMethods()).containsExactly("java.lang.invoke.LambdaMetafactory.metafactory");
        assertThat(view.methodNames()).noneMatch(name -> name.startsWith("lambda$"));
        assertThat(view.invokeDynamics().getFirst().bootstrapArgs())
                .filteredOn(DirectMethodHandleDesc.class::isInstance)
                .map(DirectMethodHandleDesc.class::cast)
                .singleElement()
                .satisfies(target -> {
                    assertThat(target.owner().displayName()).isEqualTo("String");
                    assertThat(target.methodName()).isEqualTo("length");
                });
    }
}
