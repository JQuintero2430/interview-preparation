package dev.interview.javalanguage.m05.s08;

import java.util.stream.IntStream;

// CPU-bound, independent work per element: the kind of pipeline parallel streams are built for.
public final class Primes {

    private Primes() {}

    // Counts the primes in [2, upTo] on the calling thread.
    public static long count(int upTo) {
        return candidates(upTo).filter(Primes::isPrime).count();
    }

    // The same pipeline, split across the calling thread and the common ForkJoinPool.
    public static long countInParallel(int upTo) {
        return candidates(upTo).parallel().filter(Primes::isPrime).count();
    }

    // Trial division: reads only its argument, so any thread may test any number.
    static boolean isPrime(int n) {
        for (int d = 2; (long) d * d <= n; d++) {
            if (n % d == 0) {
                return false;
            }
        }
        return true;
    }

    // SIZED and SUBSIZED: the source splits without traversal into parts of exactly known size.
    private static IntStream candidates(int upTo) {
        return IntStream.rangeClosed(2, upTo);
    }
}
