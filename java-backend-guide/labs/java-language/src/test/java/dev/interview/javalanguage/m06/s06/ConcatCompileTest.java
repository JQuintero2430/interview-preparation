package dev.interview.javalanguage.m06.s06;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m05.support.ClassFileView;
import java.lang.classfile.ClassFile;
import java.lang.classfile.constantpool.StringEntry;
import java.lang.classfile.instruction.InvokeInstruction;
import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ConcatCompileTest {

    private static final String MAKE_CONCAT = "java.lang.invoke.StringConcatFactory.makeConcatWithConstants";
    private static final String RUNTIME =
            "class Labels { String label(String id, int n) { return \"order \" + id + \"#\" + n; } }";
    private static final String CONSTANT = "class Labels { String label() { return \"order \" + \"42\"; } }";

    @Test
    @DisplayName("M06 §6 · a non-constant + compiles to invokedynamic with makeConcatWithConstants")
    void nonConstantPlus_compilesToInvokedynamic() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("Labels", RUNTIME));

        assertThat(result.success()).isTrue();
        assertThat(ClassFileView.of(result.classes().get("Labels")).bootstrapMethodsIn("label"))
                .containsExactly(MAKE_CONCAT);
    }

    @Test
    @DisplayName("M06 §6 · a constant + compiles to one constant and no call site")
    void constantPlus_compilesToOneConstant() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("Labels", CONSTANT));
        byte[] bytes = result.classes().get("Labels");

        assertThat(ClassFileView.of(bytes).invokeDynamics()).isEmpty();
        assertThat(stringConstants(bytes)).contains("order 42").doesNotContain("order ", "42");
    }

    @Test
    @DisplayName("M06 §6 · compiled for Java 8, the same + becomes a StringBuilder append chain")
    void release8_compilesToStringBuilderChain() {
        InMemoryCompiler.Result result =
                InMemoryCompiler.compile(Map.of("Labels", RUNTIME), "--release", "8", "-Xlint:-options");
        byte[] bytes = result.classes().get("Labels");

        assertThat(result.success()).isTrue();
        assertThat(ClassFileView.of(bytes).invokeDynamics()).isEmpty();
        assertThat(invokedMethods(bytes))
                .contains("java/lang/StringBuilder.append", "java/lang/StringBuilder.toString");
    }

    private static List<String> stringConstants(byte[] bytes) {
        return StreamSupport.stream(ClassFile.of().parse(bytes).constantPool().spliterator(), false)
                .filter(StringEntry.class::isInstance)
                .map(entry -> ((StringEntry) entry).stringValue())
                .toList();
    }

    private static List<String> invokedMethods(byte[] bytes) {
        return ClassFile.of().parse(bytes).methods().stream()
                .flatMap(method -> method.code().stream())
                .flatMap(code -> code.elementStream())
                .filter(InvokeInstruction.class::isInstance)
                .map(InvokeInstruction.class::cast)
                .map(call -> call.owner().asInternalName() + "." + call.name().stringValue())
                .toList();
    }
}
