package dev.interview.javalanguage.smoke;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.HelloOutput;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class HelloOutputTest {

    private static final String FIRST_LINE = "Hello, interview labs";
    private static final String SECOND_LINE = "Java 25 build is working";

    @Test
    void main_printsTwoExactLines_whenInvoked() {
        PrintStream original = System.out;
        ByteArrayOutputStream captured = new ByteArrayOutputStream();
        System.setOut(new PrintStream(captured, true, StandardCharsets.UTF_8));
        try {
            HelloOutput.main(new String[0]);
        } finally {
            System.setOut(original);
        }

        assertThat(captured.toString(StandardCharsets.UTF_8).lines()).containsExactly(FIRST_LINE, SECOND_LINE);
    }
}
