package dev.interview.javalanguage.m05.s02;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m05.support.ClassFileView;
import java.lang.classfile.MethodModel;
import java.lang.classfile.instruction.InvokeDynamicInstruction;
import java.lang.constant.ClassDesc;
import java.lang.constant.ConstantDescs;
import java.lang.constant.DirectMethodHandleDesc;
import java.lang.reflect.AccessFlag;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The lambda$ prefix is a javac naming convention, not a specification: only the prefix is asserted, and the
// static-or-instance test finds each body through its call site, not by name.
class CompiledFormTest {

    private static final String METAFACTORY = "java.lang.invoke.LambdaMetafactory.metafactory";
    private static final String ALT_METAFACTORY = "java.lang.invoke.LambdaMetafactory.altMetafactory";

    private static final String ONE_LAMBDA = """
            import java.util.function.Supplier;
            class Shapes { Supplier<String> ready() { return () -> "ready"; } }
            """;
    private static final String ONE_ANONYMOUS_CLASS = """
            class Shapes {
                Runnable task() { return new Runnable() { public void run() {} }; }
            }
            """;
    private static final String THREE_CAPTURES = """
            import java.util.function.IntSupplier;
            class Shapes {
                int base = 10;
                IntSupplier none() { return () -> 1; }
                IntSupplier local(int n) { return () -> n; }
                IntSupplier field() { return () -> base; }
            }
            """;
    private static final String SERIALIZABLE_LAMBDA = """
            import java.io.Serializable;
            class Shapes { Runnable task() { return (Runnable & Serializable) () -> {}; } }
            """;

    @Test
    @DisplayName("M05 §2 · a lambda compiles to invokedynamic bootstrapped by LambdaMetafactory")
    void lambda_compilesTo_invokedynamicAndPrivateSyntheticMethod() {
        var result = InMemoryCompiler.compile(Map.of("Shapes", ONE_LAMBDA));
        var view = ClassFileView.of(result.classes().get("Shapes"));

        assertThat(result.classes()).containsOnlyKeys("Shapes");
        assertThat(view.bootstrapMethods()).containsExactly(METAFACTORY);
        assertThat(view.firstMethodStartingWith("lambda$"))
                .hasValueSatisfying(body -> assertThat(ClassFileView.flagsOf(body))
                        .contains(AccessFlag.PRIVATE, AccessFlag.STATIC, AccessFlag.SYNTHETIC));
    }

    @Test
    @DisplayName("M05 §2 · an anonymous class compiles to its own class file")
    void anonymousClass_compilesTo_itsOwnClassFile() {
        var result = InMemoryCompiler.compile(Map.of("Shapes", ONE_ANONYMOUS_CLASS));
        var view = ClassFileView.of(result.classes().get("Shapes"));

        assertThat(result.classes()).containsOnlyKeys("Shapes", "Shapes$1");
        assertThat(view.invokeDynamics()).isEmpty();
        assertThat(view.methodNames()).noneMatch(name -> name.startsWith("lambda$"));
    }

    @Test
    @DisplayName("M05 §2 · the invokedynamic call site receives the captured values as its arguments")
    void callSite_parameters_areTheCapturedValues() {
        var result = InMemoryCompiler.compile(Map.of("Shapes", THREE_CAPTURES));
        var view = ClassFileView.of(result.classes().get("Shapes"));

        assertThat(view.invokeDynamics())
                .extracting(InvokeDynamicInstruction::typeSymbol)
                .extracting(type -> type.parameterList())
                .containsExactlyInAnyOrder(List.of(), List.of(ConstantDescs.CD_int), List.of(ClassDesc.of("Shapes")));
    }

    @Test
    @DisplayName(
            "M05 §2 · a lambda that reads a field compiles to an instance method, one that does not to a static one")
    void lambdaBody_isInstanceMethod_onlyWhenItUsesThis() {
        var result = InMemoryCompiler.compile(Map.of("Shapes", THREE_CAPTURES));
        var view = ClassFileView.of(result.classes().get("Shapes"));

        assertThat(lambdaBodyCalledFrom(view, "field"))
                .hasValueSatisfying(
                        body -> assertThat(ClassFileView.flagsOf(body)).doesNotContain(AccessFlag.STATIC));
        assertThat(lambdaBodyCalledFrom(view, "local"))
                .hasValueSatisfying(
                        body -> assertThat(ClassFileView.flagsOf(body)).contains(AccessFlag.STATIC));
        assertThat(lambdaBodyCalledFrom(view, "none"))
                .hasValueSatisfying(
                        body -> assertThat(ClassFileView.flagsOf(body)).contains(AccessFlag.STATIC));
    }

    // Finds the body through the call site's implementation handle (bootstrap argument 1 of metafactory),
    // so the test does not depend on javac's lambda$<method>$<n> naming.
    private static Optional<MethodModel> lambdaBodyCalledFrom(ClassFileView view, String enclosingMethod) {
        return view.model().methods().stream()
                .filter(method -> method.methodName().equalsString(enclosingMethod))
                .flatMap(method -> method.code().stream())
                .flatMap(code -> code.elementStream())
                .filter(InvokeDynamicInstruction.class::isInstance)
                .map(InvokeDynamicInstruction.class::cast)
                .map(site -> (DirectMethodHandleDesc) site.bootstrapArgs().get(1))
                .flatMap(handle -> view.model().methods().stream()
                        .filter(method -> method.methodName().equalsString(handle.methodName())
                                && method.methodType().equalsString(handle.lookupDescriptor())))
                .findFirst();
    }

    @Test
    @DisplayName("M05 §2 · a serializable lambda uses altMetafactory, and $deserializeLambda$ rebuilds it the same way")
    void serializableLambda_usesAltMetafactory_andDeserializeHook() {
        var result = InMemoryCompiler.compile(Map.of("Shapes", SERIALIZABLE_LAMBDA));
        var view = ClassFileView.of(result.classes().get("Shapes"));

        assertThat(view.bootstrapMethodsIn("task")).containsExactly(ALT_METAFACTORY);
        assertThat(view.methodNames()).contains("$deserializeLambda$");
        assertThat(view.bootstrapMethodsIn("$deserializeLambda$")).containsExactly(ALT_METAFACTORY);
    }
}
