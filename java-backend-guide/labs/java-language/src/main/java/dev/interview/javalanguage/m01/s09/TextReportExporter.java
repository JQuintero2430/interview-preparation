package dev.interview.javalanguage.m01.s09;

// Module 01 §9: a second subclass proves the template varies, and it skips Auditable because not every exporter needs
// it.
public final class TextReportExporter extends ReportExporter {

    private static final String ROW_PREFIX = "- ";

    public TextReportExporter(String title) {
        super(title);
    }

    @Override
    protected String titleLine(String title) {
        return title;
    }

    @Override
    protected String rowLine(String row) {
        return ROW_PREFIX + row;
    }
}
