package dev.interview.javalanguage.m01.s01;

import java.nio.ByteBuffer;

// Reads the version stamp a JVM checks before loading a class (JVMS §4.1), to diagnose UnsupportedClassVersionError.
public final class ClassFileVersion {

    static final String NOT_A_CLASS_FILE = "not a class file";

    private static final int MAGIC = 0xCAFEBABE;
    private static final int HEADER_LENGTH = 8;
    private static final int MAJOR_VERSION_OFFSET = 6;
    private static final int FIRST_MAJOR_VERSION = 45;
    private static final int RELEASE_OFFSET = 44;
    private static final String BELOW_FIRST_VERSION = "major version below " + FIRST_MAJOR_VERSION + ": ";

    private ClassFileVersion() {}

    public static int majorVersion(byte[] classFile) {
        if (classFile.length < HEADER_LENGTH) {
            throw new IllegalArgumentException(NOT_A_CLASS_FILE);
        }
        ByteBuffer header = ByteBuffer.wrap(classFile);
        if (header.getInt(0) != MAGIC) {
            throw new IllegalArgumentException(NOT_A_CLASS_FILE);
        }
        return Short.toUnsignedInt(header.getShort(MAJOR_VERSION_OFFSET));
    }

    public static int javaFeatureRelease(int majorVersion) {
        if (majorVersion < FIRST_MAJOR_VERSION) {
            throw new IllegalArgumentException(BELOW_FIRST_VERSION + majorVersion);
        }
        return majorVersion - RELEASE_OFFSET;
    }
}
