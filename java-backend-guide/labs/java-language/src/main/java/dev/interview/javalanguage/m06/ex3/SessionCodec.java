package dev.interview.javalanguage.m06.ex3;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InvalidClassException;
import java.io.ObjectInputFilter;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.UncheckedIOException;
import java.util.ArrayList;

// Reads and writes legacy cache entries. Every decode gets its own stream filter; nothing JVM-wide is set.
public final class SessionCodec {

    static final int MAX_DEPTH = 3;
    static final int MAX_REFS = 128;
    static final int MAX_BYTES = 16 * 1024;

    // Exactly the classes an honest Session stream contains, then "!*" so everything else is REJECTED:
    // ArrayList.readObject asks the filter about an Object[] (matched by its element type, java.lang.Object),
    // and an Instant travels as java.time.Ser, whose readResolve result is checked as java.time.Instant.
    static final String PATTERN = "maxdepth=" + MAX_DEPTH
            + ";maxrefs=" + MAX_REFS
            + ";maxbytes=" + MAX_BYTES
            + ";maxarray=" + Session.MAX_ROLES
            + ";" + Session.class.getName()
            + ";" + ArrayList.class.getName()
            + ";java.lang.Object;java.time.Ser;java.time.Instant;!*";

    private final ObjectInputFilter allowList = ObjectInputFilter.Config.createFilter(PATTERN);

    public byte[] encode(Session session) {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(session);
        } catch (IOException e) {
            throw new UncheckedIOException(e); // a ByteArrayOutputStream does not fail; Session is serializable
        }
        if (bytes.size() > MAX_BYTES) {
            throw new IllegalArgumentException(
                    "session encodes to " + bytes.size() + " bytes, over the " + MAX_BYTES + "-byte limit");
        }
        return bytes.toByteArray();
    }

    public Session decode(byte[] bytes) throws SessionDecodingException {
        // maxbytes is only checked when the filter is called, and Strings never call it: bound the input here.
        if (bytes.length > MAX_BYTES) {
            throw new RejectedSessionException(bytes.length + " bytes, over the " + MAX_BYTES + "-byte limit", null);
        }
        RecordingFilter filter = new RecordingFilter(allowList);
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
            in.setObjectInputFilter(filter); // before the first readObject; a stream accepts one filter
            return asSession(in.readObject());
        } catch (InvalidClassException e) {
            throw translate(e, filter);
        } catch (ClassNotFoundException e) {
            throw new IncompatibleSessionException(e);
        } catch (IOException e) {
            throw new CorruptSessionException(e);
        }
    }

    private static Session asSession(Object decoded) throws RejectedSessionException {
        if (decoded instanceof Session session) {
            return session;
        }
        String type = decoded == null ? "null" : decoded.getClass().getName();
        throw new RejectedSessionException("not a Session: " + type, null);
    }

    // A rejection and a serialVersionUID mismatch are both InvalidClassException: the recorder tells them apart.
    private static SessionDecodingException translate(InvalidClassException e, RecordingFilter filter) {
        return filter.firstRejection()
                .<SessionDecodingException>map(reason -> new RejectedSessionException(reason, e))
                .orElseGet(() -> new IncompatibleSessionException(e));
    }
}
