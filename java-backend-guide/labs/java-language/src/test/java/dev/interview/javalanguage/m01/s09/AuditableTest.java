package dev.interview.javalanguage.m01.s09;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §9: audit lines end up in logs, so the line-break replacement is the behavior worth locking, and
// the lambda case shows the default method needs nothing from its implementer beyond the one abstract method.
class AuditableTest {

    private static final String TITLE = "Sales";
    private static final String ACTION = "export";
    private static final String PLAIN = "plain text";
    private static final String LINE_FEED_IN = "a\nb";
    private static final String LINE_FEED_OUT = "a_b";
    private static final String CRLF_IN = "a\r\nb";
    private static final String CRLF_OUT = "a__b";
    private static final String ACTION_WITH_BREAK = "ex\nport";
    private static final String TITLE_WITH_CRLF = "Sa\r\nles";
    private static final String ENTRY = "action=export subject=Sales";
    private static final String ENTRY_CLEAN_ACTION = "action=ex_port subject=Sales";
    private static final String ENTRY_CLEAN_SUBJECT = "action=export subject=Sa__les";
    private static final String LAMBDA_SUBJECT = "ledger";
    private static final String LAMBDA_ACTION = "close";
    private static final String LAMBDA_ENTRY = "action=close subject=ledger";

    @Test
    @DisplayName("M01 §9 · sanitize leaves a value without a line break unchanged")
    void sanitize_returnsTheValue_whenThereIsNoLineBreak() {
        assertThat(Auditable.sanitize(PLAIN)).isEqualTo(PLAIN);
    }

    @Test
    @DisplayName("M01 §9 · sanitize replaces a line feed")
    void sanitize_replacesTheLineFeed_whenTheValueHasOne() {
        assertThat(Auditable.sanitize(LINE_FEED_IN)).isEqualTo(LINE_FEED_OUT);
    }

    @Test
    @DisplayName("M01 §9 · sanitize replaces each character of a CRLF")
    void sanitize_replacesBothCharacters_whenTheValueHasACrLf() {
        assertThat(Auditable.sanitize(CRLF_IN)).isEqualTo(CRLF_OUT);
    }

    @Test
    @DisplayName("M01 §9 · sanitize of an empty value is empty")
    void sanitize_returnsEmpty_whenTheValueIsEmpty() {
        assertThat(Auditable.sanitize("")).isEmpty();
    }

    @Test
    @DisplayName("M01 §9 · auditEntry joins action and subject")
    void auditEntry_joinsActionAndSubject_whenNeitherHasALineBreak() {
        assertThat(new CsvReportExporter(TITLE).auditEntry(ACTION)).isEqualTo(ENTRY);
    }

    @Test
    @DisplayName("M01 §9 · auditEntry sanitizes a line break in the action")
    void auditEntry_sanitizesTheAction_whenItHasALineBreak() {
        assertThat(new CsvReportExporter(TITLE).auditEntry(ACTION_WITH_BREAK)).isEqualTo(ENTRY_CLEAN_ACTION);
    }

    @Test
    @DisplayName("M01 §9 · auditEntry sanitizes a line break in the subject")
    void auditEntry_sanitizesTheSubject_whenItHasALineBreak() {
        assertThat(new CsvReportExporter(TITLE_WITH_CRLF).auditEntry(ACTION)).isEqualTo(ENTRY_CLEAN_SUBJECT);
    }

    @Test
    @DisplayName("M01 §9 · CSV exporter audits under its title")
    void auditSubject_returnsTheTitle_whenTheExporterIsCsv() {
        assertThat(new CsvReportExporter(TITLE).auditSubject()).isEqualTo(TITLE);
    }

    @Test
    @DisplayName("M01 §9 · the default auditEntry works on any implementer")
    void auditEntry_usesTheImplementersSubject_whenImplementedByALambda() {
        Auditable auditable = () -> LAMBDA_SUBJECT;

        assertThat(auditable.auditEntry(LAMBDA_ACTION)).isEqualTo(LAMBDA_ENTRY);
    }
}
