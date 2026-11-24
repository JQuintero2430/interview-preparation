package dev.interview.javalanguage.m06.s03;

final class RecordValidator {

    private RecordValidator() {}

    static String validated(String record) {
        if (record.isBlank()) {
            throw new IllegalArgumentException("blank payment record");
        }
        return record;
    }
}
