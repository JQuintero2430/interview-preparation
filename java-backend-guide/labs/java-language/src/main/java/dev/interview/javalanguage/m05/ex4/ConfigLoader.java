package dev.interview.javalanguage.m05.ex4;

import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.Properties;
import java.util.stream.Stream;

/**
 * Module 05 Ex05.4: reads every {@code *.properties} file of a directory, in file-name order, and reports one
 * {@link LoadResult} per file instead of failing on the first bad one.
 */
public final class ConfigLoader {

    /** Lists a directory's entries; it declares {@code IOException}, which {@code java.util.function} types cannot. */
    @FunctionalInterface
    public interface DirectoryLister {
        Stream<Path> list(Path dir) throws IOException;
    }

    private final DirectoryLister lister;

    public ConfigLoader(DirectoryLister lister) {
        this.lister = lister;
    }

    public static ConfigLoader fromDisk() {
        return new ConfigLoader(Files::list);
    }

    // Opening the directory can fail as a whole, so that IOException is declared; a bad file never escapes.
    public List<LoadResult> load(Path dir) throws IOException {
        try (Stream<Path> entries = lister.list(dir)) { // closes the open directory, on success and on failure
            return entries.filter(ConfigLoader::isPropertiesFile)
                    .sorted(Comparator.comparing(path -> path.getFileName().toString()))
                    .map(ConfigLoader::loadOne)
                    .toList();
        }
    }

    private static boolean isPropertiesFile(Path path) {
        return path.getFileName().toString().endsWith(".properties");
    }

    // The checked exception is caught inside the lambda's body and returned as data (§9, "a result per element").
    private static LoadResult loadOne(Path file) {
        try (Reader reader = Files.newBufferedReader(file)) {
            Properties properties = new Properties();
            properties.load(reader);
            return new LoadResult.Loaded(file, properties);
        } catch (IOException | IllegalArgumentException e) { // undecodable bytes, a vanished file, a bad Unicode escape
            return new LoadResult.Failed(file, e);
        }
    }
}
