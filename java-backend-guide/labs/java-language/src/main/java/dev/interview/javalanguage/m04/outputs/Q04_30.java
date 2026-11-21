package dev.interview.javalanguage.m04.outputs;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

// Module 04 Q04.30: collection equality follows the interface; array equality is identity.
public final class Q04_30 {

    private Q04_30() {}

    public static void main(String[] args) {
        List<Integer> arrayList = new ArrayList<>(List.of(1, 2, 3));
        List<Integer> linkedList = new LinkedList<>(List.of(1, 2, 3));
        Set<Integer> hashSet = new HashSet<>(List.of(3, 1, 2));
        Set<Integer> treeSet = new TreeSet<>(List.of(1, 2, 3));
        int[] a = {1, 2, 3};
        int[] b = {1, 2, 3};
        System.out.println(arrayList.equals(linkedList) + " " + (arrayList.hashCode() == linkedList.hashCode()));
        System.out.println(hashSet.equals(treeSet) + " " + (hashSet.hashCode() == treeSet.hashCode()));
        System.out.println(arrayList.equals(treeSet) + " " + treeSet.equals(arrayList));
        System.out.println(a.equals(b) + " " + Arrays.equals(a, b));
        System.out.println(List.of(a).equals(List.of(b)) + " " + Arrays.deepEquals(new int[][] {a}, new int[][] {b}));
    }
}
