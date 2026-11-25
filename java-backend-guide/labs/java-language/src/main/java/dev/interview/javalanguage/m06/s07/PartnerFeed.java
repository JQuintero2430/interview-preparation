package dev.interview.javalanguage.m06.s07;

import java.io.IOException;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.util.List;
import java.util.stream.Stream;

// Reads a partner's text file at the boundary: the charset is part of the contract, never the default.
public final class PartnerFeed {

    private static final String BYTE_ORDER_MARK = "﻿";

    private PartnerFeed() {}

    public static List<String> readLines(Path file, Charset declared) throws IOException {
        List<String> lines;
        try {
            // Files.readAllLines reports malformed input; new String(bytes, cs) would hide it as U+FFFD.
            lines = Files.readAllLines(file, declared);
        } catch (CharacterCodingException e) {
            throw new FeedEncodingException(file, declared, e);
        }
        List<String> normalized = lines.stream()
                .map(line -> Normalizer.normalize(line, Normalizer.Form.NFC))
                .toList();
        return withoutByteOrderMark(normalized);
    }

    // Java's UTF-8 decoder keeps a leading BOM as the character U+FEFF, so the reader drops it.
    private static List<String> withoutByteOrderMark(List<String> lines) {
        if (lines.isEmpty() || !lines.getFirst().startsWith(BYTE_ORDER_MARK)) {
            return lines;
        }
        String first = lines.getFirst().substring(BYTE_ORDER_MARK.length());
        return Stream.concat(Stream.of(first), lines.stream().skip(1)).toList();
    }
}
