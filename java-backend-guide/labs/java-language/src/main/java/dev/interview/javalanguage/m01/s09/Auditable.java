package dev.interview.javalanguage.m01.s09;

// Module 01 §9: the literals are interface constants because an interface field is always public static final.
public interface Auditable {

    String ACTION_FIELD = "action";
    String SUBJECT_FIELD = "subject";
    String FIELD_SEPARATOR = " ";
    String ASSIGNMENT = "=";
    String LINE_BREAK_PATTERN = "[\r\n]";
    String LINE_BREAK_REPLACEMENT = "_";

    String auditSubject();

    default String auditEntry(String action) {
        return field(ACTION_FIELD, action) + FIELD_SEPARATOR + field(SUBJECT_FIELD, auditSubject());
    }

    static String sanitize(String value) {
        return value.replaceAll(LINE_BREAK_PATTERN, LINE_BREAK_REPLACEMENT);
    }

    private String field(String name, String value) {
        return name + ASSIGNMENT + sanitize(value);
    }
}
