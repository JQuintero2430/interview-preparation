package dev.interview.javalanguage.m06.s04;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class JvmErrorsTest {

    private static final String FAILING_INITIALIZER = """
            public class PortConfig {
                public static final int PORT = Integer.parseInt(System.getProperty("m06.no.such.property", "eighty"));
                public static int port() { return PORT; }
            }
            """;
    private static final String ERROR_IN_INITIALIZER = """
            public class Broken {
                static { if (true) throw new AssertionError("broken on purpose"); }
                public static void touch() { }
            }
            """;
    private static final String CALLER_AND_DEPENDENCY = """
            public class Caller {
                public static String call() { return new Dependency().name(); }
            }
            class Dependency {
                String name() { return "dependency"; }
            }
            """;

    @Test
    @DisplayName("M06 §4 · Class.forName of a missing class throws ClassNotFoundException")
    void forName_ofMissingClass_throwsClassNotFoundException() {
        Throwable thrown = catchThrowable(() -> Class.forName("dev.interview.javalanguage.m06.s04.NoSuchClass"));

        assertThat(thrown)
                .isInstanceOf(ClassNotFoundException.class)
                .isInstanceOf(Exception.class)
                .hasMessage("dev.interview.javalanguage.m06.s04.NoSuchClass");
    }

    @Test
    @DisplayName("M06 §4 · a class present at compile time but missing at run time gives NoClassDefFoundError")
    void missingDependencyAtRunTime_throwsNoClassDefFoundError() throws Exception {
        var compiled = InMemoryCompiler.compile(Map.of("Caller", CALLER_AND_DEPENDENCY));
        Map<String, byte[]> withoutDependency = new HashMap<>(compiled.classes());
        withoutDependency.remove("Dependency");
        var deployed = new InMemoryCompiler.Result(true, List.of(), withoutDependency);
        Class<?> caller = deployed.load("Caller");

        Throwable thrown = catchThrowable(() -> caller.getMethod("call").invoke(null));

        assertThat(thrown.getCause())
                .isInstanceOf(NoClassDefFoundError.class)
                .isInstanceOf(Error.class)
                .hasMessage("Dependency")
                .cause()
                .isInstanceOf(ClassNotFoundException.class);
    }

    @Test
    @DisplayName(
            "M06 §4 · a failed static initializer gives ExceptionInInitializerError, then NoClassDefFoundError with it as the cause")
    void failedStaticInitializer_firstExceptionInInitializerError_thenNoClassDefFoundError() throws Exception {
        Class<?> config = InMemoryCompiler.compile(Map.of("PortConfig", FAILING_INITIALIZER))
                .load("PortConfig");

        Throwable first = catchThrowable(() -> config.getMethod("port").invoke(null));
        Throwable second = catchThrowable(() -> config.getMethod("port").invoke(null));

        assertThat(first)
                .isInstanceOf(ExceptionInInitializerError.class)
                .cause()
                .isInstanceOf(NumberFormatException.class)
                .hasMessageContaining("eighty");
        assertThat(second)
                .isInstanceOf(NoClassDefFoundError.class)
                .hasMessage("Could not initialize class PortConfig")
                .cause()
                .isInstanceOf(ExceptionInInitializerError.class)
                .hasMessageContaining("java.lang.NumberFormatException")
                .hasMessageContaining("[in thread");
    }

    @Test
    @DisplayName("M06 §4 · an Error thrown by a static initializer is not wrapped in ExceptionInInitializerError")
    void errorInStaticInitializer_isNotWrapped() throws Exception {
        Class<?> broken =
                InMemoryCompiler.compile(Map.of("Broken", ERROR_IN_INITIALIZER)).load("Broken");

        Throwable first = catchThrowable(() -> broken.getMethod("touch").invoke(null));
        Throwable second = catchThrowable(() -> broken.getMethod("touch").invoke(null));

        assertThat(first).isInstanceOf(AssertionError.class).hasMessage("broken on purpose");
        assertThat(second).isInstanceOf(NoClassDefFoundError.class).hasMessage("Could not initialize class Broken");
    }

    @Test
    @DisplayName("M06 §4 · infinite recursion throws StackOverflowError")
    void infiniteRecursion_throwsStackOverflowError() throws InterruptedException {
        AtomicReference<Throwable> failure = new AtomicReference<>();
        Runnable recurse = () -> {
            try {
                Recursion.depth(0);
            } catch (StackOverflowError e) {
                failure.set(e);
            }
        };
        Thread worker = new Thread(null, recurse, "m06-small-stack", 256 * 1024);

        worker.start();
        worker.join();

        assertThat(failure.get()).isInstanceOf(StackOverflowError.class).isInstanceOf(VirtualMachineError.class);
    }
}
