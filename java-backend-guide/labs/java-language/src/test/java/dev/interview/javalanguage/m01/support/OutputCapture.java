package dev.interview.javalanguage.m01.support;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

// Captures what an action prints to System.out (STYLE-GUIDE §7.4). Not thread-safe: capture tests never run in
// parallel.
public final class OutputCapture {

    private OutputCapture() {}

    public static List<String> linesOf(Runnable action) {
        PrintStream original = System.out;
        ByteArrayOutputStream captured = new ByteArrayOutputStream();
        System.setOut(new PrintStream(captured, true, StandardCharsets.UTF_8));
        try {
            action.run();
        } finally {
            System.setOut(original);
        }
        return captured.toString(StandardCharsets.UTF_8).lines().toList();
    }
}
