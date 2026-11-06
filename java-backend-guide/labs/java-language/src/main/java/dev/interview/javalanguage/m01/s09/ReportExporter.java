package dev.interview.javalanguage.m01.s09;

import java.util.ArrayList;
import java.util.List;

// Module 01 §9: export is final so no subclass can change the order or skip the count; only the two steps vary.
public abstract class ReportExporter {

    private static final String LINE_SEPARATOR = "\n";
    private static final String BLANK_TITLE_MESSAGE = "title must not be blank";

    private final String title;
    private int exportCount;

    protected ReportExporter(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(BLANK_TITLE_MESSAGE);
        }
        this.title = title;
    }

    public final String export(List<String> rows) {
        exportCount++;
        List<String> lines = new ArrayList<>();
        lines.add(titleLine(title));
        for (String row : rows) {
            lines.add(rowLine(row));
        }
        return String.join(LINE_SEPARATOR, lines);
    }

    public String title() {
        return title;
    }

    public int exportCount() {
        return exportCount;
    }

    protected abstract String titleLine(String title);

    protected abstract String rowLine(String row);
}
