package dev.interview.javalanguage.m07.s01;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import dev.interview.javalanguage.m05.support.ClassFileView;
import java.io.IOException;
import java.lang.module.ModuleFinder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import javax.tools.Diagnostic;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class ReleaseModelTest {

    // Primitive type patterns are a preview feature in Java 25 (JEP 507).
    private static final String PREVIEW_MAIN = """
            public class PreviewMain {
                static String describe(int value) {
                    return switch (value) {
                        case byte b -> "fits a byte";
                        case int i -> "needs an int";
                    };
                }

                public static void main(String[] args) {
                    System.out.println(describe(42) + " / " + describe(1000));
                }
            }
            """;

    // Pattern matching for switch on a reference type is final since Java 21 (JEP 441).
    private static final String FINAL_FEATURES_ONLY = """
            class Plain {
                static String describe(Object value) {
                    return switch (value) {
                        case Integer i -> "int " + i;
                        default -> "other";
                    };
                }
            }
            """;

    private static final List<String> ECHOED_OPTION_VARIABLES =
            List.of("JAVA_TOOL_OPTIONS", "_JAVA_OPTIONS", "JDK_JAVA_OPTIONS");

    private static InMemoryCompiler.Result compilePreviewMain() {
        return InMemoryCompiler.compile(Map.of("PreviewMain", PREVIEW_MAIN), "--release", "25", "--enable-preview");
    }

    @Test
    @DisplayName("M07 §1 · Runtime.version reports feature 25")
    void runtimeVersion_reportsFeature25() {
        Runtime.Version version = Runtime.version();

        assertThat(version.feature()).isEqualTo(25);
        assertThat(version.interim()).isZero();
        assertThat(System.getProperty("java.specification.version")).isEqualTo("25");
    }

    @Test
    @DisplayName("M07 §1 · a preview feature needs --enable-preview at compile time")
    void previewFeature_needsEnablePreview() {
        var result = InMemoryCompiler.compile(Map.of("PreviewMain", PREVIEW_MAIN), "--release", "25");

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly("compiler.err.preview.feature.disabled.plural");
    }

    @Test
    @DisplayName("M07 §1 · --enable-preview needs --release or -source of the running JDK")
    void enablePreview_needsTheRunningRelease() {
        var olderRelease =
                InMemoryCompiler.compile(Map.of("PreviewMain", PREVIEW_MAIN), "--release", "24", "--enable-preview");
        var noRelease = InMemoryCompiler.compile(Map.of("PreviewMain", PREVIEW_MAIN), "--enable-preview");
        var sourceFlag =
                InMemoryCompiler.compile(Map.of("PreviewMain", PREVIEW_MAIN), "-source", "25", "--enable-preview");

        assertThat(olderRelease.errorCodes()).containsExactly("compiler.err.preview.not.latest");
        assertThat(noRelease.errorCodes()).containsExactly("compiler.err.preview.without.source.or.release");
        assertThat(sourceFlag.success()).isTrue();
    }

    @Test
    @DisplayName("M07 §1 · javac notes every compilation that uses a preview feature")
    void enabledPreview_stillPrintsNotes() {
        var result = compilePreviewMain();

        List<String> notes = result.diagnostics().stream()
                .filter(d -> d.getKind() == Diagnostic.Kind.NOTE)
                .map(Diagnostic::getCode)
                .toList();
        assertThat(result.success()).isTrue();
        assertThat(notes).containsExactly("compiler.note.preview.filename", "compiler.note.preview.recompile");
    }

    @Test
    @DisplayName("M07 §1 · a class compiled with preview features has minor version 65535")
    void previewClass_hasMinorVersion65535() {
        var preview = ClassFileView.of(compilePreviewMain().classes().get("PreviewMain"));
        var plain = ClassFileView.of(
                InMemoryCompiler.compile(Map.of("Plain", FINAL_FEATURES_ONLY), "--release", "25", "--enable-preview")
                        .classes()
                        .get("Plain"));

        assertThat(preview.model().majorVersion()).isEqualTo(69);
        assertThat(preview.model().minorVersion()).isEqualTo(65535);
        // --enable-preview alone does not mark a class: only one that uses a preview feature.
        assertThat(plain.model().majorVersion()).isEqualTo(69);
        assertThat(plain.model().minorVersion()).isZero();
    }

    @Test
    @DisplayName("M07 §1 · a JVM without --enable-preview refuses to define a preview class")
    void jvmWithoutPreview_refusesPreviewClass() {
        var result = compilePreviewMain();

        // The test JVM runs without --enable-preview, so defineClass fails.
        assertThatThrownBy(() -> result.load("PreviewMain"))
                .isInstanceOf(UnsupportedClassVersionError.class)
                .hasMessageContaining("Preview features are not enabled for PreviewMain (class file version 69.65535)");
    }

    @Test
    @DisplayName("M07 §1 · a class that depends on an older release's preview features is refused")
    void olderReleasePreviewClass_isRefused() {
        byte[] bytes = compilePreviewMain().classes().get("PreviewMain").clone();
        // Rewrite major_version 69 (Java 25) to 68 (Java 24): the header of a Java 24 preview class.
        bytes[7] = 68;

        assertThatThrownBy(() -> new BytesLoader().define(bytes))
                .isInstanceOf(UnsupportedClassVersionError.class)
                .hasMessageContaining(
                        "(class file version 68.65535) was compiled with preview features that are" + " unsupported");
    }

    @Test
    @DisplayName("M07 §1 · a preview class does not run without --enable-preview")
    void previewClass_runsOnlyWithEnablePreview(@TempDir Path dir) throws IOException, InterruptedException {
        Files.write(
                dir.resolve("PreviewMain.class"), compilePreviewMain().classes().get("PreviewMain"));

        List<String> without = launch(dir, List.of());
        List<String> with = launch(dir, List.of("--enable-preview"));

        assertThat(without)
                .anySatisfy(line -> assertThat(line)
                        .contains("java.lang.UnsupportedClassVersionError: Preview features are not enabled for"
                                + " PreviewMain (class file version 69.65535). Try running with '--enable-preview'"));
        assertThat(with).containsExactly("fits a byte / needs an int");
    }

    @Test
    @DisplayName("M07 §1 · incubator modules ship with the JDK but are not resolved by default")
    void incubatorModule_isNotResolvedByDefault() {
        assertThat(ModuleFinder.ofSystem().find("jdk.incubator.vector")).isPresent();
        assertThat(ModuleLayer.boot().findModule("jdk.incubator.vector")).isEmpty();
    }

    // ChildJvm (m06) fixes the class path to the test classes; this launch needs a directory of its own.
    private static List<String> launch(Path classDir, List<String> options) throws IOException, InterruptedException {
        List<String> command = new ArrayList<>();
        command.add(Path.of(System.getProperty("java.home"), "bin", "java").toString());
        command.addAll(options);
        command.addAll(List.of("-cp", classDir.toString(), "PreviewMain"));
        ProcessBuilder builder = new ProcessBuilder(command).redirectErrorStream(true);
        builder.environment().keySet().removeAll(ECHOED_OPTION_VARIABLES);
        Process process = builder.start();
        if (!process.waitFor(60, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            throw new IllegalStateException("PreviewMain did not finish in 60 s");
        }
        return new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8)
                .lines()
                .toList();
    }

    private static final class BytesLoader extends ClassLoader {
        Class<?> define(byte[] bytes) {
            return defineClass(null, bytes, 0, bytes.length);
        }
    }
}
