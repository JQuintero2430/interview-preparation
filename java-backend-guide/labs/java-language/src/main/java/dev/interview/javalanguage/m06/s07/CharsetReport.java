package dev.interview.javalanguage.m06.s07;

import java.nio.charset.Charset;

// Run in a child JVM by the tests: the default charset is fixed when the JVM starts.
public final class CharsetReport {

    private CharsetReport() {}

    public static void main(String[] args) {
        System.out.println("default=" + Charset.defaultCharset().name());
        System.out.println("file.encoding=" + System.getProperty("file.encoding"));
        System.out.println("native.encoding=" + System.getProperty("native.encoding"));
        System.out.println("stdout.encoding=" + System.getProperty("stdout.encoding"));
        System.out.println("text=café");
    }
}
