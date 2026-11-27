package dev.interview.javalanguage.m06.ex3;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;

// Plays an earlier release: compiles a class under the same name as one in this release and loads it
// child-first, so the old and the current class can live side by side in one JVM.
final class OldRelease {

    private OldRelease() {}

    static ClassLoader compile(Map<String, String> sources) {
        InMemoryCompiler.Result result = InMemoryCompiler.compile(sources);
        assertThat(result.success())
                .as("old release compiles: %s", result.diagnostics())
                .isTrue();
        return new ChildFirstLoader(result.classes());
    }

    private static final class ChildFirstLoader extends ClassLoader {

        private final Map<String, byte[]> classes;

        ChildFirstLoader(Map<String, byte[]> classes) {
            super(OldRelease.class.getClassLoader());
            this.classes = classes;
        }

        @Override
        protected Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
            byte[] bytes = classes.get(name);
            if (bytes == null) {
                return super.loadClass(name, resolve);
            }
            synchronized (getClassLoadingLock(name)) {
                Class<?> loaded = findLoadedClass(name);
                return loaded != null ? loaded : defineClass(name, bytes, 0, bytes.length);
            }
        }
    }
}
