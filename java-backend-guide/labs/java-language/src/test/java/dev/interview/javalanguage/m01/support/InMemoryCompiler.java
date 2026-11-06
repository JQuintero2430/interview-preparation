package dev.interview.javalanguage.m01.support;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.FileObject;
import javax.tools.ForwardingJavaFileManager;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileManager;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.ToolProvider;

// In memory so compile-time questions run inside the test JVM without scratch files on disk.
public final class InMemoryCompiler {

    private InMemoryCompiler() {}

    public static Result compile(Map<String, String> sources, String... options) {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        Map<String, byte[]> classes = new HashMap<>();
        List<JavaFileObject> units = new ArrayList<>();
        sources.forEach((name, text) -> units.add(new SourceFile(name, text)));

        try (MemoryFileManager memory =
                new MemoryFileManager(compiler.getStandardFileManager(diagnostics, null, null), classes)) {
            boolean success = compiler.getTask(null, memory, diagnostics, List.of(options), null, units)
                    .call();
            return new Result(success, List.copyOf(diagnostics.getDiagnostics()), Map.copyOf(classes));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public record Result(
            boolean success, List<Diagnostic<? extends JavaFileObject>> diagnostics, Map<String, byte[]> classes) {

        // A fresh loader per call, so recompiled classes never collide with ones loaded earlier.
        public Class<?> load(String binaryName) throws ClassNotFoundException {
            return new MemoryClassLoader(classes).loadClass(binaryName);
        }

        public List<String> errorCodes() {
            return diagnostics.stream()
                    .filter(d -> d.getKind() == Diagnostic.Kind.ERROR)
                    .map(Diagnostic::getCode)
                    .toList();
        }
    }

    private static final class SourceFile extends SimpleJavaFileObject {

        private final String text;

        SourceFile(String name, String text) {
            super(URI.create("string:///" + name + Kind.SOURCE.extension), Kind.SOURCE);
            this.text = text;
        }

        @Override
        public CharSequence getCharContent(boolean ignoreEncodingErrors) {
            return text;
        }
    }

    private static final class ClassFile extends SimpleJavaFileObject {

        private final String binaryName;
        private final Map<String, byte[]> classes;

        ClassFile(String binaryName, Map<String, byte[]> classes) {
            super(URI.create("mem:///" + binaryName.replace('.', '/') + Kind.CLASS.extension), Kind.CLASS);
            this.binaryName = binaryName;
            this.classes = classes;
        }

        @Override
        public OutputStream openOutputStream() {
            return new ByteArrayOutputStream() {
                @Override
                public void close() {
                    classes.put(binaryName, toByteArray());
                }
            };
        }
    }

    private static final class MemoryFileManager extends ForwardingJavaFileManager<JavaFileManager> {

        private final Map<String, byte[]> classes;

        MemoryFileManager(JavaFileManager delegate, Map<String, byte[]> classes) {
            super(delegate);
            this.classes = classes;
        }

        @Override
        public JavaFileObject getJavaFileForOutput(
                Location location, String className, JavaFileObject.Kind kind, FileObject sibling) {
            return new ClassFile(className, classes);
        }
    }

    private static final class MemoryClassLoader extends ClassLoader {

        private final Map<String, byte[]> classes;

        MemoryClassLoader(Map<String, byte[]> classes) {
            super(InMemoryCompiler.class.getClassLoader());
            this.classes = classes;
        }

        @Override
        protected Class<?> findClass(String name) throws ClassNotFoundException {
            byte[] bytes = classes.get(name);
            if (bytes == null) {
                throw new ClassNotFoundException(name);
            }
            return defineClass(name, bytes, 0, bytes.length);
        }
    }
}
