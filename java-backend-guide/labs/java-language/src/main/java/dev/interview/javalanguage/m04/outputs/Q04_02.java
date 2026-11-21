package dev.interview.javalanguage.m04.outputs;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;

// Module 04 Q04.02: reversed() is a view; addFirst and putFirst relocate an existing element or key.
public final class Q04_02 {

    private Q04_02() {}

    public static void main(String[] args) {
        List<String> letters = new ArrayList<>(List.of("a", "b", "c"));
        List<String> backwards = letters.reversed();
        System.out.println(backwards);
        System.out.println(letters.getFirst());
        letters.addLast("d");
        System.out.println(letters);
        System.out.println(backwards);

        LinkedHashSet<String> seen = new LinkedHashSet<>(List.of("a", "b", "c"));
        seen.addFirst("c");
        System.out.println(seen);
        System.out.println(seen.reversed().getFirst());

        LinkedHashMap<String, Integer> stock = new LinkedHashMap<>();
        stock.put("a", 1);
        stock.put("b", 2);
        System.out.println(stock.putFirst("b", 20));
        System.out.println(stock);
        System.out.println(stock.reversed().firstEntry());
    }
}
