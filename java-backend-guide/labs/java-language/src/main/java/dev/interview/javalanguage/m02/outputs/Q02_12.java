package dev.interview.javalanguage.m02.outputs;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.TreeSet;

// Module 02 Q02.12: BigDecimal's natural ordering is inconsistent with equals, so a HashSet and a TreeSet disagree
// about whether 1.0 and 1.00 are duplicates.
public final class Q02_12 {

    private Q02_12() {}

    public static void main(String[] args) {
        BigDecimal a = new BigDecimal("1.0");
        BigDecimal b = new BigDecimal("1.00");

        System.out.println(a.equals(b));
        System.out.println(a.compareTo(b));
        System.out.println(new HashSet<>(List.of(a, b)).size());
        System.out.println(new TreeSet<>(List.of(a, b)).size());
    }
}
