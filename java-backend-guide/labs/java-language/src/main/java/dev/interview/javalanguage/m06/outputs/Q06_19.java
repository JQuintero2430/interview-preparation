package dev.interview.javalanguage.m06.outputs;

import java.util.Arrays;

// Module 06 Q06.19: split takes a regex and drops trailing empty strings; a text block's closing delimiter sets
// the indentation; trim and strip disagree on what white space is.
public final class Q06_19 {

    private Q06_19() {}

    public static void main(String[] args) {
        String row = "7,ana,,lima,,";
        System.out.println("1 " + Arrays.toString(row.split(",")));
        System.out.println("2 " + row.split(",", -1).length);
        System.out.println("3 " + row.split(",", 3)[2]);
        System.out.println("4 " + "".split(",").length + " " + ",".split(",").length);
        System.out.println("5 " + "2026.11.26".split(".").length + " " + "2026.11.26".split("\\.").length);

        String block = """
                {
                  "id": 7
                }
              """;
        System.out.println("6 " + block.replace(" ", "_").replace("\n", "|"));

        String padded = " ana "; // U+2003 EM SPACE, "ana", an ASCII space
        System.out.println("7 " + padded.trim().length() + " U+"
                + Integer.toHexString(padded.trim().charAt(0)));
        System.out.println("8 " + padded.strip().length() + " " + padded.strip());
    }
}
