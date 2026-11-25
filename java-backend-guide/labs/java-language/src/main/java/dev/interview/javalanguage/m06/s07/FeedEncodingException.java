package dev.interview.javalanguage.m06.s07;

import java.io.IOException;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.file.Path;

// The file's bytes are not valid in the charset the partner agreed to send.
public final class FeedEncodingException extends IOException {

    private static final long serialVersionUID = 1L;

    public FeedEncodingException(Path file, Charset declared, CharacterCodingException cause) {
        super(file.getFileName() + " is not valid " + declared.name(), cause);
    }
}
