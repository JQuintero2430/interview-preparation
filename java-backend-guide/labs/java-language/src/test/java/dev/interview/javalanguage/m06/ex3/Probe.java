package dev.interview.javalanguage.m06.ex3;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.Serial;
import java.io.Serializable;
import java.util.concurrent.atomic.AtomicInteger;

// Stands in for a library class on the classpath whose readObject does something an attacker wants.
final class Probe implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    static final AtomicInteger READS = new AtomicInteger();

    @Serial
    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        READS.incrementAndGet();
    }
}
