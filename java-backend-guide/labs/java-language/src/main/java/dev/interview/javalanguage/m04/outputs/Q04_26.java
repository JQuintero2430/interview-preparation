package dev.interview.javalanguage.m04.outputs;

import java.util.ArrayList;
import java.util.List;

// Module 04 Q04.26: a listener that unsubscribes during delivery breaks a bus that walks its live list.
public final class Q04_26 {

    private Q04_26() {}

    // A listener receives each event and the bus, so a one-shot listener can unsubscribe itself.
    public interface Listener {
        void onEvent(String event, Bus bus);
    }

    public interface Bus {
        void subscribe(Listener listener);

        void unsubscribe(Listener listener);

        void publish(String event);
    }

    // The incident: publish walks the live list, so an unsubscribe during delivery modifies it mid-loop.
    public static final class LiveListBus implements Bus {

        private final List<Listener> listeners = new ArrayList<>();

        @Override
        public void subscribe(Listener listener) {
            listeners.add(listener);
        }

        @Override
        public void unsubscribe(Listener listener) {
            listeners.remove(listener);
        }

        @Override
        public void publish(String event) {
            for (Listener listener : listeners) {
                listener.onEvent(event, this);
            }
        }
    }

    // The fix: deliver to a snapshot; changes made during delivery apply from the next event.
    public static final class SnapshotBus implements Bus {

        private final List<Listener> listeners = new ArrayList<>();

        @Override
        public void subscribe(Listener listener) {
            listeners.add(listener);
        }

        @Override
        public void unsubscribe(Listener listener) {
            listeners.remove(listener);
        }

        @Override
        public void publish(String event) {
            for (Listener listener : List.copyOf(listeners)) {
                listener.onEvent(event, this);
            }
        }
    }
}
