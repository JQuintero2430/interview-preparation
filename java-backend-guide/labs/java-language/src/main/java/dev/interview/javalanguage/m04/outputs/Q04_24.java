package dev.interview.javalanguage.m04.outputs;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.ListIterator;
import java.util.Locale;

// Module 04 Q04.24: a ListIterator's cursor sits between elements; set and add work at the cursor.
public final class Q04_24 {

    private Q04_24() {}

    // Upper-cases each word in place and inserts a "|" after every word but the last.
    public static List<String> withSeparators(List<String> words) {
        List<String> result = new LinkedList<>(words);
        for (ListIterator<String> it = result.listIterator(); it.hasNext(); ) {
            it.set(it.next().toUpperCase(Locale.ROOT));
            if (it.hasNext()) {
                it.add("|");
            }
        }
        return result;
    }

    // Starts the cursor after the last element and walks back with previous().
    public static List<String> reversedCopy(List<String> list) {
        List<String> reversed = new ArrayList<>(list.size());
        for (ListIterator<String> it = list.listIterator(list.size()); it.hasPrevious(); ) {
            reversed.add(it.previous());
        }
        return reversed;
    }
}
