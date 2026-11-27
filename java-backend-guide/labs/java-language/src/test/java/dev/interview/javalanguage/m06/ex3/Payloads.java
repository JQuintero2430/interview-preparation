package dev.interview.javalanguage.m06.ex3;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.OutputStream;
import java.util.Map;
import java.util.function.UnaryOperator;

// Test helper that plays whoever writes the bytes: it serializes a valid object and swaps marker
// Strings for other objects on the way out, so a test can forge any graph without bypassing a constructor.
final class Payloads {

    private Payloads() {}

    static byte[] write(Object root) throws IOException {
        return forge(root, UnaryOperator.identity());
    }

    // Swaps each marker String for its value.
    static byte[] forge(Object root, Map<String, Object> swaps) throws IOException {
        return forge(root, obj -> obj instanceof String marker && swaps.containsKey(marker) ? swaps.get(marker) : obj);
    }

    // Swaps the first object of the given class (the session's roles list, for an ArrayList) for the value.
    static byte[] replaceFirst(Object root, Class<?> type, Object value) throws IOException {
        boolean[] done = {false};
        return forge(root, obj -> {
            if (done[0] || !type.isInstance(obj)) {
                return obj;
            }
            done[0] = true;
            return value;
        });
    }

    private static byte[] forge(Object root, UnaryOperator<Object> replacer) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ReplacingOutputStream(bytes, replacer)) {
            out.writeObject(root);
        }
        return bytes.toByteArray();
    }

    private static final class ReplacingOutputStream extends ObjectOutputStream {

        private final UnaryOperator<Object> replacer;

        ReplacingOutputStream(OutputStream out, UnaryOperator<Object> replacer) throws IOException {
            super(out);
            this.replacer = replacer;
            enableReplaceObject(true);
        }

        // Called for every object before it is written, Strings included.
        @Override
        protected Object replaceObject(Object obj) {
            return replacer.apply(obj);
        }
    }
}
