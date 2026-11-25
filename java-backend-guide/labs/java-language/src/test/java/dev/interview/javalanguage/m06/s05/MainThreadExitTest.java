package dev.interview.javalanguage.m06.s05;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m06.support.ChildJvm;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Each case is a whole program run, so it runs in a child JVM (stdout and stderr merged).
class MainThreadExitTest {

    @Test
    @DisplayName("M06 §5 · an exception that escapes main is printed and the launcher exits with status 1")
    void exceptionEscapingMain_exitsWithOne() throws Exception {
        ChildJvm.Result result = ChildJvm.run(MainThrows.class);

        assertThat(result.exitCode()).isEqualTo(1);
        assertThat(result.lines())
                .contains("starting")
                .contains("Exception in thread \"main\" java.lang.IllegalStateException: config missing");
    }

    @Test
    @DisplayName("M06 §5 · a default handler sees main's exception but the exit status stays 1")
    void defaultHandler_doesNotChangeExitStatus() throws Exception {
        ChildJvm.Result result = ChildJvm.run(MainThrowsWithDefaultHandler.class);

        assertThat(result.exitCode()).isEqualTo(1);
        assertThat(result.lines())
                .contains("handled in main: config missing")
                .noneMatch(line -> line.startsWith("Exception in thread"));
    }

    @Test
    @DisplayName("M06 §5 · an uncaught exception in another thread does not stop the JVM or change its exit status")
    void otherThreadDying_leavesExitStatusZero() throws Exception {
        ChildJvm.Result result = ChildJvm.run(WorkerThreadDies.class);

        assertThat(result.exitCode()).isZero();
        assertThat(result.lines())
                .contains("Exception in thread \"worker\" java.lang.IllegalStateException: boom")
                .contains("main done");
    }
}
