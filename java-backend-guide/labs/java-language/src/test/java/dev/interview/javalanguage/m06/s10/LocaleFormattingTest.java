package dev.interview.javalanguage.m06.s10;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.util.Locale;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Formatted strings below are what JDK 25's CLDR 47 data produces; they are observations, not a specification.
class LocaleFormattingTest {

    private static final char NBSP = ' ';
    private static final char NARROW_NBSP = ' ';
    private static final Locale TURKISH = Locale.forLanguageTag("tr");

    private Locale savedDefault;
    private Locale savedFormat;
    private Locale savedDisplay;

    @BeforeEach
    void saveDefaults() {
        savedDefault = Locale.getDefault();
        savedFormat = Locale.getDefault(Locale.Category.FORMAT);
        savedDisplay = Locale.getDefault(Locale.Category.DISPLAY);
    }

    @AfterEach
    void restoreDefaults() {
        Locale.setDefault(savedDefault);
        Locale.setDefault(Locale.Category.FORMAT, savedFormat);
        Locale.setDefault(Locale.Category.DISPLAY, savedDisplay);
    }

    @Test
    @DisplayName("M06 §10 · toLowerCase with the Turkish locale maps I to dotless ı")
    void turkishCaseMapping() {
        assertThat("TITLE".toLowerCase(TURKISH)).isEqualTo("tıtle");
        assertThat("title".toUpperCase(TURKISH)).isEqualTo("TİTLE");
        assertThat("TITLE".toLowerCase(Locale.ROOT)).isEqualTo("title");

        Locale.setDefault(TURKISH);
        assertThat("TITLE".toLowerCase()).isNotEqualTo("title");
        assertThat("TITLE".equalsIgnoreCase("title")).isTrue();
        assertThatThrownBy(() -> Mode.valueOf("live".toUpperCase(TURKISH)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("L\u0130VE");
    }

    enum Mode {
        LIVE
    }

    @Test
    @DisplayName("M06 §10 · Locale.of and language tags name language, script and region")
    void localeConstruction() {
        assertThat(Locale.of("pt", "BR").toLanguageTag()).isEqualTo("pt-BR");
        assertThat(Locale.forLanguageTag("zh-Hant-TW").getScript()).isEqualTo("Hant");
        assertThat(Locale.forLanguageTag("zh-Hant-TW").getCountry()).isEqualTo("TW");
        assertThat(Locale.of("fr", "CA")).isEqualTo(Locale.CANADA_FRENCH);
        assertThat(Locale.ROOT.toLanguageTag()).isEqualTo("und");
    }

    @Test
    @DisplayName("M06 §10 · String.format uses the default FORMAT locale unless a locale is passed")
    void formatCategoryDefault() {
        Locale.setDefault(Locale.Category.FORMAT, Locale.GERMANY);

        assertThat(String.format("%.2f", 1234.5)).isEqualTo("1234,50");
        assertThat(String.format("%,.2f", 1234.5)).isEqualTo("1.234,50");
        assertThat(String.format(Locale.ROOT, "%.2f", 1234.5)).isEqualTo("1234.50");
        assertThat(Double.toString(1234.5)).isEqualTo("1234.5");
    }

    @Test
    @DisplayName("M06 §10 · the same amount formats differently for Locale.US and Locale.GERMANY")
    void currencyPerLocale() {
        assertThat(NumberFormat.getCurrencyInstance(Locale.US).format(1234.5)).isEqualTo("$1,234.50");
        assertThat(NumberFormat.getCurrencyInstance(Locale.GERMANY).format(1234.5))
                .isEqualTo("1.234,50" + NBSP + "€");
        assertThat(NumberFormat.getCurrencyInstance(Locale.FRANCE).format(1234.5))
                .isEqualTo("1" + NARROW_NBSP + "234,50" + NBSP + "€");
    }

    @Test
    @DisplayName("M06 §10 · compact numbers and localized dates follow the locale")
    void compactNumbersAndDates() {
        assertThat(NumberFormat.getCompactNumberInstance(Locale.US, NumberFormat.Style.SHORT)
                        .format(1_200_000))
                .isEqualTo("1M");
        assertThat(NumberFormat.getCompactNumberInstance(Locale.GERMANY, NumberFormat.Style.SHORT)
                        .format(1_200_000))
                .isEqualTo("1" + NBSP + "Mio.");

        LocalDate date = LocalDate.of(2026, 11, 25);
        DateTimeFormatter longDate = DateTimeFormatter.ofLocalizedDate(FormatStyle.LONG);
        assertThat(longDate.withLocale(Locale.US).format(date)).isEqualTo("November 25, 2026");
        assertThat(longDate.withLocale(Locale.FRANCE).format(date)).isEqualTo("25 novembre 2026");
        DateTimeFormatter shortDate = DateTimeFormatter.ofLocalizedDate(FormatStyle.SHORT);
        assertThat(shortDate.withLocale(Locale.US).format(date)).isEqualTo("11/25/26");
        assertThat(shortDate.withLocale(Locale.UK).format(date)).isEqualTo("25/11/2026");
    }

    @Test
    @DisplayName("M06 §10 · parsing \"1.234\" gives 1234 in German and 1.234 in US English")
    void parsingDependsOnLocale() throws Exception {
        assertThat(NumberFormat.getInstance(Locale.GERMANY).parse("1.234").longValue())
                .isEqualTo(1234L);
        assertThat(NumberFormat.getInstance(Locale.US).parse("1.234").doubleValue())
                .isEqualTo(1.234);
    }
}
