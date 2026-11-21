package dev.interview.javalanguage.m04.s10;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.NavigableMap;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.SequencedSet;
import java.util.TreeMap;

/**
 * One class, four access patterns, four structures: lookup by id, a range of due times, the last few status changes,
 * and counts per status. Each field is chosen for the question it answers most often. Not thread-safe (module 12).
 */
public final class ShipmentTracker {

    static final int HISTORY_LIMIT = 3;

    // Lookup by id: a hash table, presized so the expected load never resizes it.
    private final Map<String, Shipment> byId;

    // Range queries by due time: a red-black tree; ids due at the same instant keep registration order.
    private final NavigableMap<Instant, SequencedSet<String>> byDue = new TreeMap<>();

    // The last few status changes per shipment: an array-backed deque, trimmed at the head.
    private final Map<String, Deque<Status>> history;

    public ShipmentTracker(int expectedShipments) {
        byId = HashMap.newHashMap(expectedShipments);
        history = HashMap.newHashMap(expectedShipments);
    }

    public void register(Shipment shipment) {
        if (byId.putIfAbsent(shipment.id(), shipment) != null) {
            throw new IllegalArgumentException("duplicate shipment: " + shipment.id());
        }
        byDue.computeIfAbsent(shipment.due(), due -> new LinkedHashSet<>()).add(shipment.id());
        history.put(shipment.id(), new ArrayDeque<>(HISTORY_LIMIT));
        update(shipment.id(), Status.CREATED);
    }

    public Optional<Shipment> find(String id) {
        return Optional.ofNullable(byId.get(id));
    }

    // Half-open window [from, to): subMap is a view, so this walks only the entries inside it.
    public List<String> dueBetween(Instant from, Instant to) {
        List<String> ids = new ArrayList<>();
        for (SequencedSet<String> sameDue : byDue.subMap(from, true, to, false).values()) {
            ids.addAll(sameDue);
        }
        return List.copyOf(ids);
    }

    public void update(String id, Status status) {
        Deque<Status> changes = historyOf(id);
        if (changes.size() == HISTORY_LIMIT) {
            changes.removeFirst();
        }
        changes.addLast(status);
    }

    public List<Status> history(String id) {
        return List.copyOf(historyOf(id));
    }

    // EnumMap: an array indexed by ordinal, iterated in declaration order.
    public Map<Status, Integer> countByStatus() {
        Map<Status, Integer> counts = new EnumMap<>(Status.class);
        for (Deque<Status> changes : history.values()) {
            counts.merge(changes.getLast(), 1, Integer::sum);
        }
        return Collections.unmodifiableMap(counts);
    }

    private Deque<Status> historyOf(String id) {
        Deque<Status> changes = history.get(id);
        if (changes == null) {
            throw new NoSuchElementException("unknown shipment: " + id);
        }
        return changes;
    }
}
