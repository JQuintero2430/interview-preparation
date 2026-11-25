package dev.interview.javalanguage.m06.s09;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.ObjectInputFilter;
import java.io.ObjectInputStream;
import java.util.List;
import java.util.stream.Collectors;

// Reads Java-serialized bytes from a legacy protocol, accepting only the listed classes and a bounded graph.
public final class AllowListReader {

    private final ObjectInputFilter filter;

    public AllowListReader(List<Class<?>> allowed, int maxDepth, long maxBytes) {
        String classes = allowed.stream().map(Class::getName).collect(Collectors.joining(";"));
        // Limits first, then the allowed classes, then "!*": anything not listed is rejected.
        this.filter = ObjectInputFilter.Config.createFilter(
                "maxdepth=" + maxDepth + ";maxbytes=" + maxBytes + ";" + classes + ";!*");
    }

    public <T> T read(byte[] bytes, Class<T> expected) throws IOException, ClassNotFoundException {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
            // A per-stream filter: set before the first readObject, checked for every class in the stream.
            in.setObjectInputFilter(filter);
            return expected.cast(in.readObject());
        }
    }
}
