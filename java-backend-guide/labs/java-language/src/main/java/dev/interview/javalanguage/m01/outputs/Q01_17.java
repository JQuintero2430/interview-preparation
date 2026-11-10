package dev.interview.javalanguage.m01.outputs;

import dev.interview.javalanguage.m01.s07.CountingHashSet;
import dev.interview.javalanguage.m01.s07.CountingSet;
import java.util.HashSet;
import java.util.List;

// Module 01 Q01.17: inheriting HashSet double-counts addAll; the forwarding wrapper counts each element once.
public final class Q01_17 {

    private Q01_17() {}

    public static void main(String[] args) {
        List<String> letters = List.of("a", "b", "c");

        CountingHashSet<String> inherited = new CountingHashSet<>();
        inherited.addAll(letters);
        System.out.println(inherited.addCount() + " " + inherited.size());

        CountingSet<String> forwarding = new CountingSet<>(new HashSet<>());
        forwarding.addAll(letters);
        System.out.println(forwarding.addCount() + " " + forwarding.size());
    }
}
