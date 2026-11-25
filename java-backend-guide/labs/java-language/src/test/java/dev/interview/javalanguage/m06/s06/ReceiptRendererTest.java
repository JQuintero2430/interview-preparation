package dev.interview.javalanguage.m06.s06;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ReceiptRendererTest {

    private static final List<LineItem> ITEMS = List.of(new LineItem("tea", 2), new LineItem("scone", 1));

    @Test
    @DisplayName("M06 §6 · the receipt is built with one StringBuilder after a text-block header")
    void render_buildsReceipt() {
        assertThat(ReceiptRenderer.render(ITEMS)).isEqualTo("RECEIPT\n-------\ntea x2\nscone x1\nitems: 3\n");
    }

    @Test
    @DisplayName("M06 §6 · joining puts the separator between elements only")
    void names_joinsWithSeparator() {
        assertThat(ReceiptRenderer.names(ITEMS)).isEqualTo("tea, scone");
        assertThat(ReceiptRenderer.names(List.of())).isEmpty();
    }

    @Test
    @DisplayName("M06 §6 · CsvFields keeps trailing empty fields and treats the delimiter literally")
    void csvFields_keepsTrailingEmptyFields() {
        assertThat(CsvFields.split("42|alice||", "|")).containsExactly("42", "alice", "", "");
        assertThat(CsvFields.split("25.0.5", ".")).containsExactly("25", "0", "5");
    }
}
