package dev.interview.javalanguage.m06.s04;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** M06 §4 Production scenario: surface a failing static initializer at start-up, or move the work to the call. */
class StartupInitializationCheckTest {

    private static final String PROPERTY = "m06.startup.check.port";

    private static final String EAGER_CONFIG = """
            public class PaymentConfig {
                public static final int PORT = Integer.parseInt(System.getProperty("m06.startup.check.port", "eighty"));
                public static int port() { return PORT; }
            }
            """;
    private static final String PER_CALL_CONFIG = """
            public class PaymentSettings {
                public static int port() {
                    return Integer.parseInt(System.getProperty("m06.startup.check.port", "eighty"));
                }
            }
            """;

    @Test
    @DisplayName("M06 §4 · a start-up check with Class.forName(name, true, loader) throws the initializer's real error")
    void startupCheck_forNameWithInitialize_throwsExceptionInInitializerErrorWithRealCause() throws Exception {
        Class<?> config =
                InMemoryCompiler.compile(Map.of("PaymentConfig", EAGER_CONFIG)).load("PaymentConfig");

        Throwable atStartup = catchThrowable(() -> Class.forName("PaymentConfig", true, config.getClassLoader()));
        Throwable onFirstRequest = catchThrowable(() -> config.getMethod("port").invoke(null));

        assertThat(atStartup)
                .isInstanceOf(ExceptionInInitializerError.class)
                .cause()
                .isInstanceOf(NumberFormatException.class)
                .hasMessageContaining("eighty");
        assertThat(onFirstRequest)
                .isInstanceOf(NoClassDefFoundError.class)
                .hasMessage("Could not initialize class PaymentConfig")
                .cause()
                .isInstanceOf(ExceptionInInitializerError.class)
                .hasMessageContaining("java.lang.NumberFormatException");
    }

    @Test
    @DisplayName("M06 §4 · configuration read per call fails that call only, and the class works once it is fixed")
    void perCallConfiguration_failsPerCall_andRecoversWithoutRestart() throws Exception {
        Class<?> settings = InMemoryCompiler.compile(Map.of("PaymentSettings", PER_CALL_CONFIG))
                .load("PaymentSettings");
        String previous = System.getProperty(PROPERTY);
        try {
            System.clearProperty(PROPERTY);
            Throwable broken = catchThrowable(() -> settings.getMethod("port").invoke(null));

            System.setProperty(PROPERTY, "8443");
            Object fixed = settings.getMethod("port").invoke(null);

            assertThat(broken.getCause()).isInstanceOf(NumberFormatException.class);
            assertThat(fixed).isEqualTo(8443);
        } finally {
            if (previous == null) {
                System.clearProperty(PROPERTY);
            } else {
                System.setProperty(PROPERTY, previous);
            }
        }
    }
}
