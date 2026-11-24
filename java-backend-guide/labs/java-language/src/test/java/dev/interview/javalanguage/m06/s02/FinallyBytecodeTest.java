package dev.interview.javalanguage.m06.s02;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.lang.classfile.ClassFile;
import java.lang.classfile.ClassModel;
import java.lang.classfile.CodeModel;
import java.lang.classfile.Instruction;
import java.lang.classfile.MethodModel;
import java.lang.classfile.Opcode;
import java.lang.classfile.instruction.ConstantInstruction;
import java.lang.classfile.instruction.ExceptionCatch;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Reads the class file javac produced for FinallyFlow with the Class-File API (java.lang.classfile).
class FinallyBytecodeTest {

    @Test
    @DisplayName("M06 §2 · javac copies the finally block into each exit path and uses no jsr or ret")
    void finallyBlock_isCopiedPerExitPath_withoutSubroutines() throws IOException {
        CodeModel code = codeOf("returnThenFinally");

        List<Object> constants = code.elementStream()
                .filter(ConstantInstruction.class::isInstance)
                .map(e -> ((ConstantInstruction) e).constantValue())
                .map(Object.class::cast)
                .toList();
        List<ExceptionCatch> catchAll = code.elementStream()
                .filter(ExceptionCatch.class::isInstance)
                .map(ExceptionCatch.class::cast)
                .filter(handler -> handler.catchType().isEmpty())
                .toList();
        List<Opcode> opcodes = code.elementStream()
                .filter(Instruction.class::isInstance)
                .map(e -> ((Instruction) e).opcode())
                .toList();

        assertThat(constants).filteredOn("finally"::equals).hasSize(2);
        assertThat(catchAll).isNotEmpty();
        assertThat(opcodes).doesNotContain(Opcode.JSR, Opcode.JSR_W, Opcode.RET);
    }

    private static CodeModel codeOf(String methodName) throws IOException {
        try (InputStream in = FinallyFlow.class.getResourceAsStream("FinallyFlow.class")) {
            ClassModel model = ClassFile.of().parse(in.readAllBytes());
            return model.methods().stream()
                    .filter(m -> m.methodName().equalsString(methodName))
                    .findFirst()
                    .flatMap(MethodModel::code)
                    .orElseThrow();
        }
    }
}
