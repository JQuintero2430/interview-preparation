package dev.interview.javalanguage.m03.s01;

import java.util.List;

// Module 03 §1: typed code with no cast in its source. javac inserts the cast where each element is read as a String.
public final class SkuReport {

    private SkuReport() {}

    public static String firstLetters(List<String> skus) {
        StringBuilder letters = new StringBuilder();
        for (String sku : skus) {
            letters.append(sku.charAt(0));
        }
        return letters.toString();
    }
}
