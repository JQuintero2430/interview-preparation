package dev.interview.javalanguage.m06.s09;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.Externalizable;
import java.io.IOException;
import java.io.InvalidClassException;
import java.io.ObjectInput;
import java.io.ObjectOutput;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ExternalizableTest {

    public static final class Point implements Externalizable {
        static final AtomicInteger NO_ARG_CALLS = new AtomicInteger();

        int x;
        int y;
        String label = "default";

        public Point() {
            NO_ARG_CALLS.incrementAndGet();
        }

        Point(int x, int y, String label) {
            this.x = x;
            this.y = y;
            this.label = label;
        }

        @Override
        public void writeExternal(ObjectOutput out) throws IOException {
            out.writeInt(x);
            out.writeInt(y); // label is not written: only what this method writes is in the stream
        }

        @Override
        public void readExternal(ObjectInput in) throws IOException {
            x = in.readInt();
            y = in.readInt();
        }
    }

    public static final class NoPublicConstructor implements Externalizable {
        NoPublicConstructor() {}

        @Override
        public void writeExternal(ObjectOutput out) {}

        @Override
        public void readExternal(ObjectInput in) {}
    }

    @Test
    @DisplayName(
            "M06 §9 · Externalizable: the public no-arg constructor runs, then readExternal restores what writeExternal wrote")
    void externalizableRoundTrip() throws Exception {
        byte[] bytes = SerialBytes.write(new Point(3, 4, "home"));
        int before = Point.NO_ARG_CALLS.get();

        Point copy = (Point) SerialBytes.read(bytes);

        assertThat(Point.NO_ARG_CALLS.get()).isEqualTo(before + 1);
        assertThat(copy.x).isEqualTo(3);
        assertThat(copy.y).isEqualTo(4);
        assertThat(copy.label).isEqualTo("default");
    }

    @Test
    @DisplayName("M06 §9 · Externalizable without a public no-arg constructor fails on read with InvalidClassException")
    void externalizableNeedsPublicNoArgConstructor() throws Exception {
        byte[] bytes = SerialBytes.write(new NoPublicConstructor());

        assertThatThrownBy(() -> SerialBytes.read(bytes))
                .isInstanceOf(InvalidClassException.class)
                .hasMessageContaining("no valid constructor");
    }
}
