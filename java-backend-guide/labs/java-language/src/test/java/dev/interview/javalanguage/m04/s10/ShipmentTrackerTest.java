package dev.interview.javalanguage.m04.s10;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.NoSuchElementException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ShipmentTrackerTest {

    private static final Instant NINE = Instant.parse("2026-11-21T09:00:00Z");
    private static final Instant TEN = Instant.parse("2026-11-21T10:00:00Z");
    private static final Instant ELEVEN = Instant.parse("2026-11-21T11:00:00Z");

    @Test
    @DisplayName("M04 §10 · find returns a registered shipment by id and nothing for an unknown id")
    void find_byId() {
        ShipmentTracker tracker = new ShipmentTracker(10);
        Shipment parcel = new Shipment("s-1", NINE);
        tracker.register(parcel);

        assertThat(tracker.find("s-1")).contains(parcel);
        assertThat(tracker.find("s-9")).isEmpty();
    }

    @Test
    @DisplayName("M04 §10 · registering the same id twice is rejected")
    void register_duplicateRejected() {
        ShipmentTracker tracker = new ShipmentTracker(10);
        tracker.register(new Shipment("s-1", NINE));

        assertThatThrownBy(() -> tracker.register(new Shipment("s-1", TEN)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("s-1");
    }

    @Test
    @DisplayName("M04 §10 · dueBetween lists ids in due order, ties in registration order, end excluded")
    void dueBetween_sortedHalfOpenRange() {
        ShipmentTracker tracker = new ShipmentTracker(10);
        tracker.register(new Shipment("late", ELEVEN));
        tracker.register(new Shipment("b", TEN));
        tracker.register(new Shipment("early", NINE));
        tracker.register(new Shipment("a", TEN));

        assertThat(tracker.dueBetween(NINE, ELEVEN)).containsExactly("early", "b", "a");
        assertThat(tracker.dueBetween(TEN, TEN)).isEmpty();
    }

    @Test
    @DisplayName("M04 §10 · history keeps the last three statuses, oldest first")
    void history_boundedOldestFirst() {
        ShipmentTracker tracker = new ShipmentTracker(10);
        tracker.register(new Shipment("s-1", NINE));
        tracker.update("s-1", Status.IN_TRANSIT);
        tracker.update("s-1", Status.HELD);
        tracker.update("s-1", Status.IN_TRANSIT);

        assertThat(tracker.history("s-1")).containsExactly(Status.IN_TRANSIT, Status.HELD, Status.IN_TRANSIT);
    }

    @Test
    @DisplayName("M04 §10 · countByStatus counts current statuses in declaration order")
    void countByStatus_enumOrder() {
        ShipmentTracker tracker = new ShipmentTracker(10);
        tracker.register(new Shipment("s-1", NINE));
        tracker.register(new Shipment("s-2", NINE));
        tracker.register(new Shipment("s-3", TEN));
        tracker.update("s-3", Status.DELIVERED);
        tracker.update("s-1", Status.IN_TRANSIT);

        assertThat(tracker.countByStatus())
                .containsExactly(
                        java.util.Map.entry(Status.CREATED, 1),
                        java.util.Map.entry(Status.IN_TRANSIT, 1),
                        java.util.Map.entry(Status.DELIVERED, 1));
    }

    @Test
    @DisplayName("M04 §10 · update and history reject an unknown id")
    void unknownId_rejected() {
        ShipmentTracker tracker = new ShipmentTracker(10);

        assertThatThrownBy(() -> tracker.update("s-9", Status.HELD)).isInstanceOf(NoSuchElementException.class);
        assertThatThrownBy(() -> tracker.history("s-9")).isInstanceOf(NoSuchElementException.class);
    }

    @Test
    @DisplayName("M04 §10 · the returned history and counts cannot change the tracker")
    void views_unmodifiable() {
        ShipmentTracker tracker = new ShipmentTracker(10);
        tracker.register(new Shipment("s-1", NINE));

        assertThatThrownBy(() -> tracker.history("s-1").clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> tracker.countByStatus().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThat(tracker.history("s-1")).containsExactly(Status.CREATED);
    }

    @Test
    @DisplayName("M04 §10 · a negative expected size and null fields are rejected")
    void invalidInput_rejected() {
        assertThatThrownBy(() -> new ShipmentTracker(-1)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Shipment(null, NINE)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new Shipment("s-1", null)).isInstanceOf(NullPointerException.class);
    }
}
