package dev.interview.javalanguage.m06.s09;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.io.InvalidClassException;
import java.io.ObjectStreamClass;
import java.util.Map;
import javax.tools.Diagnostic;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SerialVersionTest {

    private static final String NAME = "demo.Ticket";
    private static final String FILE = "demo/Ticket";

    private static final String V1_DECLARED = """
            package demo;
            public class Ticket implements java.io.Serializable {
                private static final long serialVersionUID = 1L;
                public String id = "T-1";
            }
            """;

    private static final String V2_OTHER_UID = """
            package demo;
            public class Ticket implements java.io.Serializable {
                private static final long serialVersionUID = 2L;
                public String id;
            }
            """;

    private static final String V2_SAME_UID_NEW_FIELD = """
            package demo;
            public class Ticket implements java.io.Serializable {
                private static final long serialVersionUID = 1L;
                public String id;
                public String note;
                public String describe() { return id + " " + note; }
            }
            """;

    private static final String NO_UID = """
            package demo;
            public class Ticket implements java.io.Serializable {
                public String id = "T-1";
            }
            """;

    private static final String NO_UID_PLUS_METHOD = """
            package demo;
            public class Ticket implements java.io.Serializable {
                public String id = "T-1";
                public String describe() { return id; }
            }
            """;

    private static Class<?> compile(String source) throws ClassNotFoundException {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of(FILE, source));
        assertThat(result.success()).isTrue();
        return result.load(NAME);
    }

    private static byte[] ticketBytes(String source) throws Exception {
        return SerialBytes.write(compile(source).getConstructor().newInstance());
    }

    @Test
    @DisplayName("M06 §9 · a changed serialVersionUID fails with InvalidClassException")
    void changedUidFails() throws Exception {
        byte[] fromV1 = ticketBytes(V1_DECLARED);
        ClassLoader v2 = compile(V2_OTHER_UID).getClassLoader();

        assertThatThrownBy(() -> SerialBytes.readWith(fromV1, v2))
                .isInstanceOf(InvalidClassException.class)
                .hasMessageContaining("local class incompatible");
    }

    @Test
    @DisplayName("M06 §9 · with the same declared serialVersionUID, an added field reads as its default")
    void sameUidAddedFieldIsDefault() throws Exception {
        byte[] fromV1 = ticketBytes(V1_DECLARED);
        Class<?> v2 = compile(V2_SAME_UID_NEW_FIELD);

        Object copy = SerialBytes.readWith(fromV1, v2.getClassLoader());

        assertThat(copy.getClass()).isSameAs(v2);
        assertThat(v2.getField("id").get(copy)).isEqualTo("T-1");
        assertThat(v2.getField("note").get(copy)).isNull();
    }

    @Test
    @DisplayName(
            "M06 §9 · without serialVersionUID, adding a public method changes the computed value and breaks reads")
    void computedUidChangesWithAMethod() throws Exception {
        Class<?> before = compile(NO_UID);
        Class<?> after = compile(NO_UID_PLUS_METHOD);
        byte[] fromBefore = SerialBytes.write(before.getConstructor().newInstance());

        assertThat(ObjectStreamClass.lookup(before).getSerialVersionUID())
                .isNotEqualTo(ObjectStreamClass.lookup(after).getSerialVersionUID());
        assertThatThrownBy(() -> SerialBytes.readWith(fromBefore, after.getClassLoader()))
                .isInstanceOf(InvalidClassException.class)
                .hasMessageContaining("local class incompatible");
    }

    @Test
    @DisplayName("M06 §9 · -Xlint:serial warns when a serializable class declares no serialVersionUID")
    void lintSerialWarns() {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of(FILE, NO_UID), "-Xlint:serial");

        assertThat(result.success()).isTrue();
        assertThat(result.diagnostics())
                .filteredOn(d -> d.getKind() == Diagnostic.Kind.WARNING)
                .extracting(Diagnostic::getCode)
                .contains("compiler.warn.missing.SVUID");
    }
}
