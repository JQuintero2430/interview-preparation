package dev.interview.javalanguage.m01.s09;

// Module 01 §9: the state and algorithm come from the one superclass, the audit capability from the interface.
public final class CsvReportExporter extends ReportExporter implements Auditable {

    private static final String TITLE_PREFIX = "# ";
    private static final String QUOTE = "\"";
    private static final String ESCAPED_QUOTE = "\"\"";

    public CsvReportExporter(String title) {
        super(title);
    }

    @Override
    protected String titleLine(String title) {
        return TITLE_PREFIX + title;
    }

    @Override
    protected String rowLine(String row) {
        return QUOTE + row.replace(QUOTE, ESCAPED_QUOTE) + QUOTE;
    }

    @Override
    public String auditSubject() {
        return title();
    }
}
