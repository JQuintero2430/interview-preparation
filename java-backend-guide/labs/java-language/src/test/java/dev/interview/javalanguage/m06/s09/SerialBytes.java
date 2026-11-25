package dev.interview.javalanguage.m06.s09;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.ObjectStreamClass;

// Test helper: serialize to bytes and read back, optionally resolving classes through another loader.
final class SerialBytes {

    private SerialBytes() {}

    static byte[] write(Object value) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(value);
        }
        return bytes.toByteArray();
    }

    static Object read(byte[] bytes) throws IOException, ClassNotFoundException {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
            return in.readObject();
        }
    }

    // Plays the receiving JVM: the class named in the stream is resolved from the given loader.
    static Object readWith(byte[] bytes, ClassLoader loader) throws IOException, ClassNotFoundException {
        try (ObjectInputStream in = new LoaderInputStream(new ByteArrayInputStream(bytes), loader)) {
            return in.readObject();
        }
    }

    private static final class LoaderInputStream extends ObjectInputStream {

        private final ClassLoader loader;

        LoaderInputStream(InputStream in, ClassLoader loader) throws IOException {
            super(in);
            this.loader = loader;
        }

        @Override
        protected Class<?> resolveClass(ObjectStreamClass desc) throws IOException, ClassNotFoundException {
            return Class.forName(desc.getName(), false, loader);
        }
    }
}
