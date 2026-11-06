package dev.interview.javalanguage.m01.s04;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

// Module 01 §4: an object that owns its state, so a copy must build new state instead of sharing the reference.
public final class Basket {

    static final String NULL_ITEM = "item must not be null";

    private final List<String> items;

    public Basket() {
        this.items = new ArrayList<>();
    }

    // Copy constructor: a new list, so the copy and the original stop sharing state.
    // Shallow is enough here because String elements are immutable.
    public Basket(Basket other) {
        this.items = new ArrayList<>(other.items);
    }

    public void add(String item) {
        items.add(Objects.requireNonNull(item, NULL_ITEM));
    }

    // A snapshot, so callers never hold a reference to the internal list.
    public List<String> items() {
        return List.copyOf(items);
    }
}
