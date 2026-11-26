package dev.interview.javalanguage.m06.outputs;

import java.nio.charset.StandardCharsets;

// Module 06 Q06.21: a String counts UTF-16 code units; UTF-8 byte counts and code points are different numbers.
public final class Q06_21 {

    private Q06_21() {}

    public static void main(String[] args) {
        String emoji = "😀"; // U+1F600 GRINNING FACE
        String composed = "é"; // U+00E9
        String decomposed = "é"; // e + U+0301 COMBINING ACUTE ACCENT

        System.out.println("1 " + emoji.length() + " " + emoji.codePointCount(0, emoji.length()));
        System.out.println(
                "2 " + Integer.toHexString(emoji.charAt(0)) + " " + Integer.toHexString(emoji.codePointAt(0)));
        System.out.println("3 " + emoji.getBytes(StandardCharsets.UTF_8).length);
        System.out.println("4 " + emoji.substring(0, 1).getBytes(StandardCharsets.UTF_8).length);
        System.out.println("5 " + composed.length() + " " + composed.getBytes(StandardCharsets.UTF_8).length);
        System.out.println("6 " + decomposed.length() + " " + decomposed.equals(composed));
        System.out.println("7 " + ('a' + 1));
        System.out.println("8 " + (char) ('a' + 1));
        System.out.println("9 " + 'a' + 1);
    }
}
