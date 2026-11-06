package dev.interview.javalanguage.m01.s06;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins the javac 25 access and compilation-unit rules module 01 §6 states.
class AccessRulesTest {

    private static final String PROTECTED_ACCESS = "compiler.err.report.access";
    private static final String PUBLIC_NEEDS_OWN_FILE = "compiler.err.class.public.should.be.in.file";
    private static final String NOT_PUBLIC_IN_PACKAGE = "compiler.err.not.def.public.cant.access";

    private static final String BASE = "package a; public class Base { protected int n; }";
    private static final String PEER = "package a; class Peer { int f(Base b) { return b.n; } }";

    @Test
    @DisplayName("M01 §6 · protected member not accessible through a superclass reference from another package")
    void protectedMember_isReachableOnlyThroughTheSubclassType_outsideThePackage() {
        var withBaseReference = InMemoryCompiler.compile(Map.of(
                "a/Base", BASE,
                "a/Peer", PEER,
                "b/Sub", """
                        package b;
                        public class Sub extends a.Base {
                            int viaBase(a.Base o) { return o.n; }
                            int viaSub(Sub s) { return s.n; }
                            int own() { return n; }
                        }
                        """));
        assertThat(withBaseReference.errorCodes()).containsExactly(PROTECTED_ACCESS);

        var withoutBaseReference = InMemoryCompiler.compile(Map.of(
                "a/Base", BASE,
                "a/Peer", PEER,
                "b/Sub", """
                        package b;
                        public class Sub extends a.Base {
                            int viaSub(Sub s) { return s.n; }
                            int own() { return n; }
                        }
                        """));
        assertThat(withoutBaseReference.success()).isTrue();
    }

    @Test
    @DisplayName("M01 §6 · two public top-level classes in one file do not compile")
    void twoPublicTopLevelClasses_inOneFile_doNotCompile() {
        var result = InMemoryCompiler.compile(Map.of("X", "public class X {} public class Y {}"));

        assertThat(result.errorCodes()).containsExactly(PUBLIC_NEEDS_OWN_FILE);
    }

    @Test
    @DisplayName("M01 §6 · a package-private class is not visible from another package")
    void packagePrivateClass_isNotVisibleFromAnotherPackage() {
        var result = InMemoryCompiler.compile(Map.of(
                "a/Hidden", "package a; class Hidden {}",
                "b/User", "package b; class User { a.Hidden h; }"));

        assertThat(result.errorCodes()).containsExactly(NOT_PUBLIC_IN_PACKAGE);
    }
}
