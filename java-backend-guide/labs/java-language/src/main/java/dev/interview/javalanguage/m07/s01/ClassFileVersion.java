package dev.interview.javalanguage.m07.s01;

import java.nio.ByteBuffer;

// The version stamped in the first eight bytes of every class file (JVMS §4.1):
// magic 0xCAFEBABE, then minor_version, then major_version, each unsigned and big-endian.
public record ClassFileVersion(int major, int minor) {

    private static final int MAGIC = 0xCAFEBABE;
    private static final int HEADER_BYTES = 8;
    private static final int PREVIEW_MINOR = 0xFFFF;
    private static final int MAJOR_OF_RELEASE_ZERO = 44;

    public static ClassFileVersion of(byte[] classFile) {
        if (classFile.length < HEADER_BYTES) {
            throw new IllegalArgumentException("not a class file: " + classFile.length + " bytes");
        }
        ByteBuffer header = ByteBuffer.wrap(classFile, 0, HEADER_BYTES);
        if (header.getInt() != MAGIC) {
            throw new IllegalArgumentException("not a class file: wrong magic number");
        }
        int minor = Short.toUnsignedInt(header.getShort());
        int major = Short.toUnsignedInt(header.getShort());
        return new ClassFileVersion(major, minor);
    }

    // All 16 bits of minor_version set: the class depends on the preview features of its release.
    public boolean dependsOnPreview() {
        return minor == PREVIEW_MINOR;
    }

    // The Java SE release whose compiler targeted this file (52 is Java 8, 69 is Java 25).
    public int javaRelease() {
        return major - MAJOR_OF_RELEASE_ZERO;
    }

    // The JVMS §4.1 rule: a preview class loads only on its own release with preview enabled;
    // any other class loads on its own release or a later one.
    public boolean loadableOn(int runtimeFeature, boolean previewEnabled) {
        if (dependsOnPreview()) {
            return previewEnabled && javaRelease() == runtimeFeature;
        }
        return javaRelease() <= runtimeFeature;
    }

    @Override
    public String toString() {
        return major + "." + minor;
    }
}
