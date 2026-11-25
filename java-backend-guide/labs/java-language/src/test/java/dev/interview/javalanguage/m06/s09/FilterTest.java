package dev.interview.javalanguage.m06.s09;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayInputStream;
import java.io.InvalidClassException;
import java.io.ObjectInputFilter;
import java.io.ObjectInputStream;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class FilterTest {

    record Invoice(String id, long cents) implements Serializable {}

    static final class Link implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        final Link next;

        Link(Link next) {
            this.next = next;
        }

        static Link chain(int length) {
            Link head = null;
            for (int i = 0; i < length; i++) {
                head = new Link(head);
            }
            return head;
        }
    }

    static final class Gadget implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        static final AtomicInteger HOOK_RUNS = new AtomicInteger();

        @Serial
        private void readObject(java.io.ObjectInputStream in) throws java.io.IOException, ClassNotFoundException {
            in.defaultReadObject();
            HOOK_RUNS.incrementAndGet(); // stands in for whatever a library class does on deserialization
        }
    }

    private final AllowListReader reader = new AllowListReader(List.of(Invoice.class, Link.class), 3, 10_000);

    @Test
    @DisplayName("M06 §9 · an allow-list filter accepts a listed class")
    void allowedClassIsRead() throws Exception {
        Invoice invoice = reader.read(SerialBytes.write(new Invoice("INV-7", 1250)), Invoice.class);

        assertThat(invoice).isEqualTo(new Invoice("INV-7", 1250));
    }

    @Test
    @DisplayName("M06 §9 · an allow-list filter rejects a class outside the list before its readObject runs")
    void unlistedClassIsRejected() throws Exception {
        byte[] bytes = SerialBytes.write(new Gadget());
        int before = Gadget.HOOK_RUNS.get();

        assertThatThrownBy(() -> reader.read(bytes, Invoice.class))
                .isInstanceOf(InvalidClassException.class)
                .hasMessageContaining("filter status: REJECTED");
        assertThat(Gadget.HOOK_RUNS.get()).isEqualTo(before);
    }

    @Test
    @DisplayName("M06 §9 · maxdepth rejects a graph nested deeper than the limit")
    void depthLimit() throws Exception {
        assertThat(reader.read(SerialBytes.write(Link.chain(3)), Link.class)).isNotNull();
        assertThatThrownBy(() -> reader.read(SerialBytes.write(Link.chain(5)), Link.class))
                .isInstanceOf(InvalidClassException.class)
                .hasMessageContaining("filter status: REJECTED");
    }

    @Test
    @DisplayName("M06 §9 · maxbytes rejects a stream larger than the limit")
    void byteLimit() throws Exception {
        AllowListReader small = new AllowListReader(List.of(Invoice.class), 3, 100);
        Invoice big = new Invoice("x".repeat(500), 1);

        assertThatThrownBy(() -> small.read(SerialBytes.write(big), Invoice.class))
                .isInstanceOf(InvalidClassException.class)
                .hasMessageContaining("filter status: REJECTED");
    }

    @Test
    @DisplayName("M06 §9 · a stream's filter can be set only once")
    void filterSetOnce() throws Exception {
        ObjectInputFilter filter = ObjectInputFilter.Config.createFilter("!*");
        try (ObjectInputStream in =
                new ObjectInputStream(new ByteArrayInputStream(SerialBytes.write(new Invoice("a", 1))))) {
            in.setObjectInputFilter(filter);

            assertThatThrownBy(() -> in.setObjectInputFilter(filter)).isInstanceOf(IllegalStateException.class);
        }
    }
}
