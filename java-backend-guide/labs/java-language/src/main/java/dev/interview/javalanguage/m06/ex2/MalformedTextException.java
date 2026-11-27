package dev.interview.javalanguage.m06.ex2;

import java.io.IOException;
import java.io.Serial;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;

// Checked, like the JDK's own CharacterCodingException: bad bytes are an input failure the caller must handle.
public class MalformedTextException extends IOException {

    @Serial
    private static final long serialVersionUID = 1L;

    // The charset's name, not the Charset: Charset is not Serializable and an exception is.
    private final String charsetName;
    private final int offset;

    public MalformedTextException(Charset charset, int offset, CharacterCodingException cause) {
        super("invalid " + charset.name() + " at byte offset " + offset, cause);
        this.charsetName = charset.name();
        this.offset = offset;
    }

    public String charsetName() {
        return charsetName;
    }

    // The index, in the input array, of the first byte of the sequence that could not be decoded.
    public int offset() {
        return offset;
    }
}
