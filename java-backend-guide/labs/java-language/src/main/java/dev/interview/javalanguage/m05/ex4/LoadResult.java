package dev.interview.javalanguage.m05.ex4;

import java.nio.file.Path;
import java.util.Properties;

/** Module 05 Ex05.4: the outcome of loading one file. A bad file is a value, so it cannot end the whole load. */
public sealed interface LoadResult permits LoadResult.Loaded, LoadResult.Failed {

    Path file();

    record Loaded(Path file, Properties properties) implements LoadResult {}

    record Failed(Path file, Exception cause) implements LoadResult {}
}
