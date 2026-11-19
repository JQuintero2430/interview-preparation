package dev.interview.javalanguage.m03.s01;

import java.util.List;

// Module 03 §1: a pre-generics API, the defect on purpose. Its parameter is a raw List, so javac checks no element.
public final class LegacyCatalog {

    private static final Integer STOCK_COUNT = 42;

    private LegacyCatalog() {}

    @SuppressWarnings({"rawtypes", "unchecked"})
    public static void addStockCount(List skus) {
        skus.add(STOCK_COUNT);
    }
}
