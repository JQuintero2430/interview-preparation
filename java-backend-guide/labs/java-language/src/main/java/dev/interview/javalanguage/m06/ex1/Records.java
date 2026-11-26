package dev.interview.javalanguage.m06.ex1;

final class Records {

    private Records() {}

    // A blank record is a bug in the caller's data, not an I/O failure.
    static String validated(String record) {
        if (record.isBlank()) {
            throw new IllegalArgumentException("blank export record");
        }
        return record;
    }
}
