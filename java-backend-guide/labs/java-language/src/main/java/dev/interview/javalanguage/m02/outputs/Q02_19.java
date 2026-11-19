package dev.interview.javalanguage.m02.outputs;

import dev.interview.javalanguage.m02.s06.Event;
import dev.interview.javalanguage.m02.s06.RawEvent;
import java.util.HashSet;
import java.util.Set;

// Module 02 Q02.19: a record compares a byte[] component by reference, so a set of such records never rejects a
// duplicate; Event compares the array by content and does.
public final class Q02_19 {

    private Q02_19() {}

    public static void main(String[] args) {
        byte[] payload = {1, 2, 3};

        Set<RawEvent> seen = new HashSet<>();
        System.out.println(seen.add(new RawEvent("e-1", payload.clone())));
        System.out.println(seen.add(new RawEvent("e-1", payload.clone())));
        System.out.println(seen.size());

        Set<Event> fixed = new HashSet<>();
        System.out.println(fixed.add(new Event("e-1", payload.clone())));
        System.out.println(fixed.add(new Event("e-1", payload.clone())));
        System.out.println(fixed.size());
    }
}
