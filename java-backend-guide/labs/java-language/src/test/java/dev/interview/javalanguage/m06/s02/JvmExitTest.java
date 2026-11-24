package dev.interview.javalanguage.m06.s02;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m06.support.ChildJvm;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Each case ends a JVM, so it runs in a child JVM started from the current java binary and classpath.
class JvmExitTest {

    @Test
    @DisplayName("M06 §2 · System.exit inside try skips finally, but shutdown hooks run")
    void systemExit_skipsFinally_runsShutdownHooks() throws Exception {
        ChildJvm.Result result = ChildJvm.run(ExitInsideTry.class);

        assertThat(result.exitCode()).isEqualTo(3);
        assertThat(result.lines()).contains("try", "shutdown hook").doesNotContain("finally");
    }

    @Test
    @DisplayName("M06 §2 · a daemon thread's finally does not run when the JVM exits")
    void daemonThread_finallyDoesNotRun_whenJvmExits() throws Exception {
        ChildJvm.Result result = ChildJvm.run(DaemonFinally.class);

        assertThat(result.exitCode()).isZero();
        assertThat(result.lines()).containsExactly("main done");
    }
}
