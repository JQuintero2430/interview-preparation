package dev.interview.javalanguage.m03.ex1;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import javax.tools.Diagnostic;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Module 03 Ex03.1: a type-safe heterogeneous container keyed by Class<T>. One test group per criterion.
class RequestContextTest {

    private static final String TENANT = "acme";
    private static final int RETRIES = 3;
    private static final String SMUGGLED = "not a number";
    private static final String TYPE = "type";

    private static final String CALLER_NAME = "Caller";
    private static final String CALLER = """
            import dev.interview.javalanguage.m03.ex1.RequestContext;
            import java.util.Locale;
            class Caller {
                Locale read(RequestContext context) {
                    context.put(Locale.class, Locale.CANADA_FRENCH);
                    Locale locale = context.get(Locale.class);
                    return locale;
                }
            }
            """;
    private static final String SMUGGLER_NAME = "Smuggler";
    private static final String SMUGGLER = """
            import dev.interview.javalanguage.m03.ex1.RequestContext;
            class Smuggler {
                @SuppressWarnings("rawtypes")
                void smuggle(RequestContext context) {
                    Class raw = Integer.class;
                    context.put(raw, "not a number");
                }
            }
            """;
    private static final String LINT_ALL = "-Xlint:all";
    private static final String CLASSPATH_FLAG = "-cp";
    private static final String UNCHECKED_CALL = "compiler.warn.unchecked.meth.invocation.applied";

    @Test
    @DisplayName("Ex03.1 · (1) get returns the stored instance with static type T")
    void get_returnsStoredInstance_whenTypeWasPut() {
        RequestContext context = new RequestContext();
        context.put(Locale.class, Locale.CANADA_FRENCH);

        Locale locale = context.get(Locale.class);

        assertThat(locale).isSameAs(Locale.CANADA_FRENCH);
    }

    @Test
    @DisplayName("Ex03.1 · (1) a caller compiles with no cast and no warning under -Xlint:all")
    void compile_succeedsWithoutCastOrWarning_whenCallerReadsByClassToken() throws Exception {
        InMemoryCompiler.Result result = compile(CALLER_NAME, CALLER);

        assertThat(result.success()).isTrue();
        assertThat(warningCodes(result)).isEmpty();
    }

    @Test
    @DisplayName("Ex03.1 · (2) a value smuggled in through a raw Class is rejected at put")
    void put_throwsClassCastException_whenRawClassDoesNotMatchValue() {
        RequestContext context = new RequestContext();
        @SuppressWarnings("rawtypes")
        Class raw = Integer.class;

        assertThatThrownBy(() -> smuggle(context, raw))
                .isInstanceOf(ClassCastException.class)
                .hasMessageContaining(String.class.getName())
                .hasMessageContaining(Integer.class.getName());
        assertThat(context.get(Integer.class)).isNull();
    }

    @Test
    @DisplayName("Ex03.1 · (2) the raw-Class call compiles only with an unchecked warning")
    void compile_warnsUnchecked_whenCallerPassesRawClass() throws Exception {
        InMemoryCompiler.Result result = compile(SMUGGLER_NAME, SMUGGLER);

        assertThat(result.success()).isTrue();
        assertThat(warningCodes(result)).contains(UNCHECKED_CALL);
    }

    @Test
    @DisplayName("Ex03.1 · (3) a null type is rejected by put with NullPointerException")
    void put_throwsNullPointerException_whenTypeIsNull() {
        RequestContext context = new RequestContext();

        assertThatThrownBy(() -> context.put(null, TENANT))
                .isInstanceOf(NullPointerException.class)
                .hasMessage(TYPE);
    }

    @Test
    @DisplayName("Ex03.1 · (3) a null type is rejected by get with NullPointerException")
    void get_throwsNullPointerException_whenTypeIsNull() {
        RequestContext context = new RequestContext();

        assertThatThrownBy(() -> context.get(null))
                .isInstanceOf(NullPointerException.class)
                .hasMessage(TYPE);
    }

    @Test
    @DisplayName("Ex03.1 · (4) String and Integer entries are stored and retrieved independently")
    void get_returnsEachEntry_whenStringAndIntegerAreStored() {
        RequestContext context = new RequestContext();
        context.put(String.class, TENANT);
        context.put(Integer.class, RETRIES);

        String tenant = context.get(String.class);
        int retries = context.get(Integer.class);

        assertThat(tenant).isEqualTo(TENANT);
        assertThat(retries).isEqualTo(RETRIES);
    }

    @SuppressWarnings("unchecked")
    private static void smuggle(RequestContext context, @SuppressWarnings("rawtypes") Class raw) {
        context.put(raw, SMUGGLED);
    }

    private static InMemoryCompiler.Result compile(String name, String source) throws Exception {
        Path classes = Path.of(RequestContext.class
                .getProtectionDomain()
                .getCodeSource()
                .getLocation()
                .toURI());
        return InMemoryCompiler.compile(Map.of(name, source), LINT_ALL, CLASSPATH_FLAG, classes.toString());
    }

    private static List<String> warningCodes(InMemoryCompiler.Result result) {
        return result.diagnostics().stream()
                .filter(d -> d.getKind() == Diagnostic.Kind.WARNING || d.getKind() == Diagnostic.Kind.MANDATORY_WARNING)
                .map(Diagnostic::getCode)
                .toList();
    }
}
