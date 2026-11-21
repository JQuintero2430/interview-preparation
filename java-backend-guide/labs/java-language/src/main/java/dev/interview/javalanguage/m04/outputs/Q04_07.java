package dev.interview.javalanguage.m04.outputs;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

// Module 04 Q04.07: on a List<Integer>, remove(int) removes by index and remove(Object) by value.
public final class Q04_07 {

    private Q04_07() {}

    public static void main(String[] args) {
        List<Integer> ids = new ArrayList<>(List.of(1, 2, 3));
        ids.remove(1);
        System.out.println(ids);
        ids.remove(Integer.valueOf(1));
        System.out.println(ids);
        System.out.println(ids.indexOf(7));
        System.out.println(ids);
    }

    // The review snippet: meant to drop the blocked id, but the int argument selects remove(int index).
    public static List<Integer> removeBlockedBuggy(List<Integer> source, int blockedId) {
        List<Integer> ids = new ArrayList<>(source);
        ids.remove(blockedId);
        return ids;
    }

    // The fix: box explicitly, so overload resolution picks remove(Object).
    public static List<Integer> removeBlockedFixed(List<Integer> source, int blockedId) {
        List<Integer> ids = new ArrayList<>(source);
        ids.remove(Integer.valueOf(blockedId));
        return ids;
    }

    // Through a Collection reference there is only remove(Object), so the int is boxed.
    public static List<Integer> removeThroughCollection(List<Integer> source, int blockedId) {
        Collection<Integer> ids = new ArrayList<>(source);
        ids.remove(blockedId);
        return List.copyOf(ids);
    }
}
