package dev.interview.javalanguage.m06.s06;

import java.util.List;
import java.util.regex.Pattern;

public final class CsvFields {

    private CsvFields() {}

    // split takes a regex, so the delimiter is quoted; a negative limit keeps trailing empty fields.
    public static List<String> split(String line, String delimiter) {
        return List.of(line.split(Pattern.quote(delimiter), -1));
    }
}
