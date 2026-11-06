package dev.interview.javalanguage.m01.s09;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §9: the template method is only worth showing if the fixed skeleton stays in the base class, so
// both formats are checked through the same export call and the counter proves the base class owns the flow.
class ReportExporterTest {

    private static final String TITLE = "Sales";
    private static final String ROW_A = "a";
    private static final String ROW_B = "b";
    private static final String QUOTED_ROW = "say \"hi\"";
    private static final String BLANK_TWO_SPACES = "  ";
    private static final String BLANK_WITH_TAB = " \t";

    private static final String CSV_EMPTY = "# Sales";
    private static final String CSV_ONE = "# Sales\n\"a\"";
    private static final String CSV_MANY = "# Sales\n\"a\"\n\"b\"\n\"a\"";
    private static final String CSV_QUOTED = "# Sales\n\"say \"\"hi\"\"\"";
    private static final String TEXT_EMPTY = "Sales";
    private static final String TEXT_ONE = "Sales\n- a";
    private static final String TEXT_MANY = "Sales\n- a\n- b\n- a";
    private static final String TEXT_QUOTED = "Sales\n- say \"hi\"";

    @Test
    @DisplayName("M01 §9 · export with no rows returns only the title line")
    void export_returnsOnlyTheTitleLine_whenThereAreNoRows() {
        assertThat(new CsvReportExporter(TITLE).export(List.of())).isEqualTo(CSV_EMPTY);
        assertThat(new TextReportExporter(TITLE).export(List.of())).isEqualTo(TEXT_EMPTY);
    }

    @Test
    @DisplayName("M01 §9 · export with one row returns the title line and that row")
    void export_returnsTitleAndRow_whenThereIsOneRow() {
        assertThat(new CsvReportExporter(TITLE).export(List.of(ROW_A))).isEqualTo(CSV_ONE);
        assertThat(new TextReportExporter(TITLE).export(List.of(ROW_A))).isEqualTo(TEXT_ONE);
    }

    @Test
    @DisplayName("M01 §9 · export with many rows keeps the row order")
    void export_keepsRowOrder_whenThereAreManyRows() {
        assertThat(new CsvReportExporter(TITLE).export(List.of(ROW_A, ROW_B, ROW_A)))
                .isEqualTo(CSV_MANY);
        assertThat(new TextReportExporter(TITLE).export(List.of(ROW_A, ROW_B, ROW_A)))
                .isEqualTo(TEXT_MANY);
    }

    @Test
    @DisplayName("M01 §9 · CSV row doubles an inner quote")
    void csvExport_doublesInnerQuotes_whenARowContainsAQuote() {
        assertThat(new CsvReportExporter(TITLE).export(List.of(QUOTED_ROW))).isEqualTo(CSV_QUOTED);
    }

    @Test
    @DisplayName("M01 §9 · text row keeps an inner quote unchanged")
    void textExport_keepsQuotes_whenARowContainsAQuote() {
        assertThat(new TextReportExporter(TITLE).export(List.of(QUOTED_ROW))).isEqualTo(TEXT_QUOTED);
    }

    @Test
    @DisplayName("M01 §9 · exportCount is 0 before any export")
    void exportCount_isZero_beforeAnyExport() {
        assertThat(new CsvReportExporter(TITLE).exportCount()).isZero();
    }

    @Test
    @DisplayName("M01 §9 · exportCount is 1 after one export")
    void exportCount_isOne_afterOneExport() {
        var exporter = new TextReportExporter(TITLE);

        exporter.export(List.of(ROW_A));

        assertThat(exporter.exportCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("M01 §9 · exportCount is 2 after two exports, including an empty one")
    void exportCount_isTwo_afterTwoExports() {
        var exporter = new CsvReportExporter(TITLE);

        exporter.export(List.of(ROW_A));
        exporter.export(List.of());

        assertThat(exporter.exportCount()).isEqualTo(2);
    }

    @Test
    @DisplayName("M01 §9 · title returns the constructor title")
    void title_returnsTheConstructorTitle_whenConstructedWithOne() {
        assertThat(new TextReportExporter(TITLE).title()).isEqualTo(TITLE);
    }

    @Test
    @DisplayName("M01 §9 · null title is rejected")
    void constructor_throwsIllegalArgument_whenTheTitleIsNull() {
        assertThatThrownBy(() -> new CsvReportExporter(null)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new TextReportExporter(null)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("M01 §9 · blank title is rejected")
    void constructor_throwsIllegalArgument_whenTheTitleIsBlank() {
        assertThatThrownBy(() -> new CsvReportExporter("")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new CsvReportExporter(BLANK_TWO_SPACES)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new TextReportExporter(BLANK_WITH_TAB)).isInstanceOf(IllegalArgumentException.class);
    }
}
