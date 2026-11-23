package dev.interview.javalanguage.m05.outputs;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

// Module 05 Q05.14: toMap throws on a duplicate key and on a null value; a merge function decides duplicates.
public final class Q05_14 {

    private Q05_14() {}

    public static void main(String[] args) {
        List<String> words = List.of("apple", "avocado", "banana");
        try {
            words.stream().collect(Collectors.toMap(w -> w.charAt(0), w -> w));
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());
        }
        Map<Character, Integer> counts =
                words.stream().collect(Collectors.toMap(w -> w.charAt(0), w -> 1, Integer::sum, TreeMap::new));
        System.out.println(counts);
        Map<Character, String> lastWins = words.stream()
                .collect(Collectors.toMap(w -> w.charAt(0), w -> w, (first, second) -> second, TreeMap::new));
        System.out.println(lastWins);
        try {
            Stream.of("kiwi").collect(Collectors.toMap(w -> w, w -> (String) null));
        } catch (NullPointerException e) {
            System.out.println("toMap: " + e.getClass().getSimpleName());
        }
        try {
            Stream.of("kiwi").collect(Collectors.toMap(w -> w, w -> (String) null, (first, second) -> first));
        } catch (NullPointerException e) {
            System.out.println("toMap with merge: " + e.getClass().getSimpleName());
        }
    }
}
