package dev.interview.javalanguage.m01.s08;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.file.Path;
import java.util.spi.ToolProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §8: which invoke instruction javac emits for each kind of call (read with the javap tool).
class BytecodeDispatchTest {

    @Test
    @DisplayName("M01 §8 · javap shows invokevirtual vs invokestatic")
    void javap_showsOneInvokeInstructionPerKindOfCall() throws Exception {
        String bytecode = disassemble(DispatchSample.class);

        assertThat(bytecode)
                .containsPattern("invokespecial .*// Method java/lang/Object\\.\"<init>\"")
                .containsPattern("invokeinterface .*// InterfaceMethod java/lang/Runnable\\.run:")
                .containsPattern("invokestatic .*// Method dev/interview/javalanguage/m01/s08/FeeTable\\.feeCents:")
                .containsPattern("invokevirtual .*// Method dev/interview/javalanguage/m01/s08/Payment\\.feeCents:")
                .containsPattern("invokevirtual .*// Method surcharge:");
    }

    private static String disassemble(Class<?> type) throws Exception {
        ToolProvider javap = ToolProvider.findFirst("javap").orElseThrow();
        Path classes =
                Path.of(type.getProtectionDomain().getCodeSource().getLocation().toURI());
        StringWriter out = new StringWriter();

        int exit = javap.run(
                new PrintWriter(out), new PrintWriter(out), "-c", "-p", "-cp", classes.toString(), type.getName());

        assertThat(exit).isZero();
        return out.toString();
    }
}
