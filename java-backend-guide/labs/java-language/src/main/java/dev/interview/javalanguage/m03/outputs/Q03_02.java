package dev.interview.javalanguage.m03.outputs;

import java.util.ArrayList;
import java.util.List;

// Module 03 Q03.02: a raw list accepts anything; the cast javac inserts at the typed read is the first check.
@SuppressWarnings({"rawtypes", "unchecked"})
public final class Q03_02 {

    private Q03_02() {}

    public static void main(String[] args) {
        List raw = new ArrayList();
        raw.add("sku-1");
        raw.add(42);
        List<String> skus = raw;

        System.out.println(skus.size());
        System.out.println(skus.get(0));
        String second = skus.get(1);
        System.out.println(second);
    }

    // The follow-up: with an Object target, javac 25 needs no cast, so the same read does not throw.
    public static Object untypedRead() {
        List raw = new ArrayList();
        raw.add(42);
        List<String> skus = raw;
        Object element = skus.get(0);
        return element;
    }
}
