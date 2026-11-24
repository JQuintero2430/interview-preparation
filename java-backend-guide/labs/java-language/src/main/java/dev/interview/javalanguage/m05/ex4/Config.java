package dev.interview.javalanguage.m05.ex4;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Properties;
import java.util.function.Supplier;

/** Module 05 Ex05.4: lookups over the files that loaded, earliest file name first. */
public final class Config {

    private final List<Properties> sources;

    private Config(List<Properties> sources) {
        this.sources = sources;
    }

    // Keeps the successful loads in their order; the failures are the caller's to report (load returned them).
    public static Config of(List<LoadResult> results) {
        List<Properties> loaded = results.stream()
                .<Properties>mapMulti((result, sink) -> {
                    if (result instanceof LoadResult.Loaded success) {
                        sink.accept(success.properties()); // zero or one element per result (§6)
                    }
                })
                .toList();
        return new Config(loaded);
    }

    // Absent is a normal answer here, so the return type says so.
    public Optional<String> find(String key) {
        return sources.stream()
                .map(properties -> properties.getProperty(key))
                .filter(Objects::nonNull)
                .findFirst();
    }

    // The fallback may be costly (a remote call, a computed path): orElseGet runs it only when the key is absent.
    public String valueOr(String key, Supplier<String> fallback) {
        return find(key).orElseGet(fallback);
    }

    // Absent or unparsable is an error for this caller: the exception names the key and keeps the cause.
    public int requiredInt(String key) {
        String raw = find(key).orElseThrow(() -> ConfigException.missing(key));
        try {
            return Integer.parseInt(raw.strip());
        } catch (NumberFormatException e) {
            throw ConfigException.notAnInteger(key, e);
        }
    }
}
