package dev.interview.javalanguage.m06.ex3;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InvalidClassException;
import java.io.ObjectInputFilter;
import java.io.ObjectInputStream;
import java.time.Instant;
import java.util.List;

// Run in a child JVM started with -Djdk.serialFilter: prints how each way of reading treats the JVM-wide filter.
public final class GlobalFilterProbe {

    private GlobalFilterProbe() {}

    public static void main(String[] args) throws Exception {
        SessionCodec codec = new SessionCodec();
        byte[] bytes = codec.encode(new Session("user-42", List.of("support"), Instant.EPOCH));
        ObjectInputFilter global = ObjectInputFilter.Config.getSerialFilter();
        ObjectInputFilter allowList = ObjectInputFilter.Config.createFilter(SessionCodec.PATTERN);

        System.out.println("global=" + global);
        System.out.println("plain=" + read(bytes, null));
        System.out.println("codec=" + codecRead(codec, bytes));
        System.out.println("merged=" + read(bytes, ObjectInputFilter.merge(allowList, global)));
    }

    // With null, the stream keeps the JVM-wide filter it was constructed with.
    private static String read(byte[] bytes, ObjectInputFilter streamFilter) throws IOException {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
            if (streamFilter != null) {
                in.setObjectInputFilter(streamFilter);
            }
            return in.readObject().getClass().getSimpleName();
        } catch (InvalidClassException e) {
            return "REJECTED";
        } catch (ClassNotFoundException e) {
            return "missing";
        }
    }

    private static String codecRead(SessionCodec codec, byte[] bytes) {
        try {
            return codec.decode(bytes).getClass().getSimpleName();
        } catch (SessionDecodingException e) {
            return e.getClass().getSimpleName();
        }
    }
}
