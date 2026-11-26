package dev.interview.javalanguage.m06.outputs;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Locale;
import java.util.PropertyResourceBundle;
import java.util.ResourceBundle;
import java.util.Set;
import java.util.TreeSet;

// Q06.26: a release check for property bundles: which base keys a locale's users would see untranslated.
public final class Q06_26 {

    private static final ResourceBundle.Control PROPERTIES =
            ResourceBundle.Control.getControl(ResourceBundle.Control.FORMAT_PROPERTIES);

    private Q06_26() {}

    // Base keys that no bundle in the locale's own chain (for fr_CA: fr_CA, then fr) defines.
    public static Set<String> untranslatedKeys(String baseName, Locale locale) {
        Set<String> missing = keysOf(baseName, Locale.ROOT);
        for (Locale candidate : PROPERTIES.getCandidateLocales(baseName, locale)) {
            if (!candidate.equals(Locale.ROOT)) {
                missing.removeAll(keysOf(baseName, candidate));
            }
        }
        return missing;
    }

    // One file read on its own has no parent bundle, so keySet() holds only that file's keys.
    private static Set<String> keysOf(String baseName, Locale locale) {
        String resource = PROPERTIES.toResourceName(PROPERTIES.toBundleName(baseName, locale), "properties");
        try (InputStream in = Q06_26.class.getClassLoader().getResourceAsStream(resource)) {
            return in == null ? new TreeSet<>() : new TreeSet<>(new PropertyResourceBundle(in).keySet());
        } catch (IOException e) {
            throw new UncheckedIOException(resource, e);
        }
    }
}
