package dev.interview.javalanguage.m06.s10;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.ResourceBundle;

// Looks up a message for the caller's locale and fills its placeholders with that locale's formats.
public final class LocalizedMessages {

    // No fallback to the JVM default locale: a missing translation falls back to the base bundle only.
    private static final ResourceBundle.Control NO_DEFAULT_LOCALE =
            ResourceBundle.Control.getNoFallbackControl(ResourceBundle.Control.FORMAT_DEFAULT);

    private final String baseName;

    public LocalizedMessages(String baseName) {
        this.baseName = baseName;
    }

    public String format(Locale locale, String key, Object... arguments) {
        ResourceBundle bundle = ResourceBundle.getBundle(baseName, locale, NO_DEFAULT_LOCALE);
        // The MessageFormat gets the same locale, so numbers and dates in the message match the text.
        return new MessageFormat(bundle.getString(key), locale).format(arguments);
    }
}
