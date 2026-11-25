package dev.interview.javalanguage.m06.s06;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import java.util.regex.Pattern;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class StringApiTest {

    @Test
    @DisplayName("M06 §6 · split drops trailing empty strings unless the limit is negative")
    void split_dropsTrailingEmptyStrings_unlessLimitNegative() {
        String line = "42,alice,,";

        assertThat(line.split(",")).containsExactly("42", "alice");
        assertThat(line.split(",", -1)).containsExactly("42", "alice", "", "");
        assertThat(",42".split(",")).containsExactly("", "42");
    }

    @Test
    @DisplayName("M06 §6 · split on \".\" needs Pattern.quote or an escape")
    void split_onDot_needsQuoting() {
        String version = "25.0.5";

        assertThat(version.split(".")).isEmpty();
        assertThat(version.split("\\.")).containsExactly("25", "0", "5");
        assertThat(version.split(Pattern.quote("."))).containsExactly("25", "0", "5");
        assertThat("a|b".split("|")).containsExactly("a", "|", "b");
    }

    @Test
    @DisplayName("M06 §6 · a text block strips incidental whitespace up to the closing delimiter")
    void textBlock_stripsIncidentalWhitespace() throws Exception {
        // The text blocks are compiled from plain strings, so a source formatter cannot change their indentation.
        String source = "public class Blocks {\n"
                + "  public static String aligned() {\n"
                + "    return \"\"\"\n"
                + "        <p>\n"
                + "          hi\n"
                + "        </p>\n"
                + "        \"\"\";\n"
                + "  }\n"
                + "  public static String shifted() {\n"
                + "    return \"\"\"\n"
                + "        <p>\n"
                + "      \"\"\";\n"
                + "  }\n"
                + "  public static String escapes() {\n"
                + "    return \"\"\"\n"
                + "        one \\\n"
                + "        line\\s\n"
                + "        \"\"\";\n"
                + "  }\n"
                + "}\n";
        Class<?> blocks = InMemoryCompiler.compile(Map.of("Blocks", source)).load("Blocks");

        assertThat(blocks.getDeclaredMethod("aligned").invoke(null)).isEqualTo("<p>\n  hi\n</p>\n");
        assertThat(blocks.getDeclaredMethod("shifted").invoke(null)).isEqualTo("  <p>\n");
        assertThat(blocks.getDeclaredMethod("escapes").invoke(null)).isEqualTo("one line \n");
    }

    @Test
    @DisplayName("M06 §6 · strip removes Unicode whitespace that trim keeps")
    void strip_removesUnicodeWhitespace_trimKeepsIt() {
        String emSpaced = " total ";
        String controlPadded = "\u0007total\t";

        assertThat(emSpaced.trim()).isEqualTo(emSpaced);
        assertThat(emSpaced.strip()).isEqualTo("total");
        assertThat(controlPadded.trim()).isEqualTo("total");
        assertThat(controlPadded.strip()).isEqualTo("\u0007total");
        assertThat("  ".isBlank()).isTrue();
    }

    @Test
    @DisplayName("M06 §6 · repeat, lines and length count what the Javadoc says")
    void repeatLinesAndLength() {
        assertThat("ab".repeat(3)).isEqualTo("ababab");
        assertThat("one\r\ntwo\nthree".lines()).containsExactly("one", "two", "three");
        assertThat("é".length()).isEqualTo(1);
        assertThat("😀".length()).isEqualTo(2);
        assertThat(new int[3].length).isEqualTo(3);
    }

    @Test
    @DisplayName("M06 §6 · equals is false for a StringBuilder with the same text, contentEquals is true")
    void equalsVsContentEquals() {
        StringBuilder builder = new StringBuilder("order");

        assertThat("order".equals(builder)).isFalse();
        assertThat("order".contentEquals(builder)).isTrue();
        assertThat("ORDER".equalsIgnoreCase("order")).isTrue();
    }
}
