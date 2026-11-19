package dev.interview.javalanguage.m02.outputs;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// Module 02 Q02.16: an unmodifiable view keeps reading its backing list, a List.copyOf copy does not.
public final class Q02_16 {

    private Q02_16() {}

    public static void main(String[] args) {
        List<String> source = new ArrayList<>(List.of("EUR", "USD"));
        List<String> view = Collections.unmodifiableList(source);
        List<String> copy = List.copyOf(source);

        source.add("XXX");

        System.out.println(view);
        System.out.println(copy);
        try {
            view.add("COP");
        } catch (UnsupportedOperationException e) {
            System.out.println("view rejects add");
        }
    }
}
