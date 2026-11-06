package dev.interview.javalanguage.m01.s13;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.spi.ToolProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

// Pins module 01 §13 compiler rules against the javac running the tests.
class WrapperCompileRulesTest {

    private static final String INCOMPATIBLE_TYPES_CODE = "compiler.err.prob.found.req";
    private static final String SOURCE_NAME = "T";

    private static final String BYTE_TO_DOUBLE_OBJECT = "class T { Object f(Byte b) { return (Double) b; } }";
    private static final String BYTE_TO_PRIMITIVE_DOUBLE = "class T { double f(Byte b) { return (double) b; } }";

    private static final String BOXING_ROUND_TRIP = "class T { static int f(int x) { Integer b = x; return b; } }";
    private static final String VALUE_OF_REFERENCE = "java/lang/Integer.valueOf:(I)Ljava/lang/Integer;";
    private static final String INT_VALUE_REFERENCE = "java/lang/Integer.intValue:()I";

    @Test
    @DisplayName("M01 §13 · (Double) of a Byte does not compile")
    void castToDoubleObject_doesNotCompile_whenOperandIsAByteObject() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, BYTE_TO_DOUBLE_OBJECT));

        assertThat(result.errorCodes()).containsExactly(INCOMPATIBLE_TYPES_CODE);
    }

    @Test
    @DisplayName("M01 §13 · (double) of a Byte compiles")
    void castToPrimitiveDouble_compiles_whenOperandIsAByteObject() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, BYTE_TO_PRIMITIVE_DOUBLE));

        assertThat(result.success()).isTrue();
    }

    @Test
    @DisplayName("M01 §13 · javac boxes through valueOf and unboxes through intValue")
    void boxingAndUnboxing_goThroughValueOfAndIntValue_whenAnIntRoundTripsThroughInteger(@TempDir Path dir)
            throws Exception {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, BOXING_ROUND_TRIP));
        Path classFile = dir.resolve(SOURCE_NAME + ".class");
        Files.write(classFile, result.classes().get(SOURCE_NAME));

        String bytecode = disassemble(classFile);

        assertThat(bytecode).contains(VALUE_OF_REFERENCE).contains(INT_VALUE_REFERENCE);
    }

    private static String disassemble(Path classFile) {
        ToolProvider javap = ToolProvider.findFirst("javap").orElseThrow();
        StringWriter out = new StringWriter();

        int exit = javap.run(new PrintWriter(out), new PrintWriter(out), "-c", "-p", classFile.toString());

        assertThat(exit).isZero();
        return out.toString();
    }
}
