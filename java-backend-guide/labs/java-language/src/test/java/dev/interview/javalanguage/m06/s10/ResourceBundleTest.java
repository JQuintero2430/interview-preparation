package dev.interview.javalanguage.m06.s10;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ResourceBundleTest {

    private static final String BASE = "m06.Messages";
    private static final char NARROW_NBSP = ' ';

    private Locale savedDefault;

    @BeforeEach
    void setUp() {
        savedDefault = Locale.getDefault();
        ResourceBundle.clearCache();
    }

    @AfterEach
    void restoreDefault() {
        Locale.setDefault(savedDefault);
        ResourceBundle.clearCache();
    }

    @Test
    @DisplayName("M06 §10 · getBundle falls back from fr_CA to fr to the base bundle")
    void parentChain() {
        Locale.setDefault(Locale.US);
        ResourceBundle bundle = ResourceBundle.getBundle(BASE, Locale.CANADA_FRENCH);

        assertThat(bundle.getLocale()).isEqualTo(Locale.CANADA_FRENCH);
        assertThat(bundle.getString("farewell")).isEqualTo("Au revoir");
        assertThat(bundle.getString("appName")).isEqualTo("Invoices");
    }

    @Test
    @DisplayName("M06 §10 · a UTF-8 properties bundle reads non-ASCII text")
    void utf8Properties() {
        ResourceBundle bundle = ResourceBundle.getBundle(BASE, Locale.CANADA_FRENCH);

        assertThat(bundle.getString("greeting")).isEqualTo("Allô");
    }

    @Test
    @DisplayName(
            "M06 §10 · with no bundle for the requested locale, the default locale's bundle wins over the base bundle")
    void defaultLocaleBeforeBaseBundle() {
        Locale.setDefault(Locale.GERMANY);

        ResourceBundle italian = ResourceBundle.getBundle(BASE, Locale.ITALY);
        assertThat(italian.getLocale()).isEqualTo(Locale.GERMAN);
        assertThat(italian.getString("greeting")).isEqualTo("Hallo");

        ResourceBundle noFallback = ResourceBundle.getBundle(
                BASE, Locale.ITALY, ResourceBundle.Control.getNoFallbackControl(ResourceBundle.Control.FORMAT_DEFAULT));
        assertThat(noFallback.getLocale()).isEqualTo(Locale.ROOT);
        assertThat(noFallback.getString("greeting")).isEqualTo("Hello");
    }

    @Test
    @DisplayName("M06 §10 · a key in no bundle of the chain throws MissingResourceException")
    void missingKey() {
        ResourceBundle bundle = ResourceBundle.getBundle(BASE, Locale.FRENCH);

        assertThatThrownBy(() -> bundle.getString("invoiceTotal"))
                .isInstanceOf(MissingResourceException.class)
                .hasMessageContaining("invoiceTotal");
        assertThatThrownBy(() -> ResourceBundle.getBundle("m06.NoSuchBundle", Locale.FRENCH))
                .isInstanceOf(MissingResourceException.class);
    }

    @Test
    @DisplayName("M06 §10 · MessageFormat fills placeholders in order")
    void messageFormat() {
        assertThat(new MessageFormat("{1} before {0}", Locale.US).format(new Object[] {"a", "b"}))
                .isEqualTo("b before a");
        assertThat(new MessageFormat("It''s {0}", Locale.US).format(new Object[] {"x"}))
                .isEqualTo("It's x");
        assertThat(new MessageFormat("It's {0}", Locale.US).format(new Object[] {"x"}))
                .isEqualTo("Its {0}");

        MessageFormat files =
                new MessageFormat("{0,choice,0#no files|1#one file|1<{0,number,integer} files}", Locale.US);
        assertThat(files.format(new Object[] {0})).isEqualTo("no files");
        assertThat(files.format(new Object[] {1})).isEqualTo("one file");
        assertThat(files.format(new Object[] {1234})).isEqualTo("1,234 files");
    }

    @Test
    @DisplayName("M06 §10 · LocalizedMessages formats the message and its numbers for the caller's locale")
    void localizedMessages() {
        Locale.setDefault(Locale.GERMANY);
        LocalizedMessages messages = new LocalizedMessages(BASE);

        assertThat(messages.format(Locale.US, "orderLine", "A-7", 1234)).isEqualTo("Order A-7 contains 1,234 items");
        assertThat(messages.format(Locale.FRANCE, "orderLine", "A-7", 1234))
                .isEqualTo("La commande A-7 contient 1" + NARROW_NBSP + "234 articles");
        assertThat(messages.format(Locale.ITALY, "greeting")).isEqualTo("Hello");
    }
}
