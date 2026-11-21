package dev.interview.javalanguage.m04.outputs;

import java.util.ArrayList;
import java.util.ConcurrentModificationException;
import java.util.List;
import java.util.Set;

// Module 04 Q04.23: removing through the list inside a for-each loop throws, or ends the loop early.
public final class Q04_23 {

    private Q04_23() {}

    public static void main(String[] args) {
        System.out.println(removeInLoop(new ArrayList<>(List.of("a", "b", "c", "d")), "b"));
        System.out.println(removeInLoop(new ArrayList<>(List.of("a", "b", "c")), "b"));
        System.out.println(removeInLoop(new ArrayList<>(List.of("a", "b", "c")), "c"));
    }

    // Removes doomed through the list while a for-each loop walks it, and reports what happened.
    static String removeInLoop(List<String> list, String doomed) {
        List<String> visited = new ArrayList<>();
        try {
            for (String s : list) {
                visited.add(s);
                if (s.equals(doomed)) {
                    list.remove(s);
                }
            }
            return "visited " + visited + ", list " + list;
        } catch (ConcurrentModificationException e) {
            return "visited " + visited + ", then ConcurrentModificationException";
        }
    }

    // The review snippet: meant to drop every blocked user.
    public static List<String> dropBlockedBuggy(List<String> source, Set<String> blocked) {
        List<String> users = new ArrayList<>(source);
        for (String user : users) {
            if (blocked.contains(user)) {
                users.remove(user);
            }
        }
        return users;
    }

    // The fix: removeIf removes every match in one call; ArrayList overrides it to compact the array once.
    public static List<String> dropBlockedFixed(List<String> source, Set<String> blocked) {
        List<String> users = new ArrayList<>(source);
        users.removeIf(blocked::contains);
        return users;
    }
}
