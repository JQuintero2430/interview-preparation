package dev.interview.javalanguage.m05.s08;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.ForkJoinWorkerThread;
import java.util.function.UnaryOperator;
import java.util.stream.IntStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;

class CommonPoolTest {

    private static final String COMMON_WORKER_PREFIX = "ForkJoinPool.commonPool-worker-";

    // Runs a sum over [0, 100_000) and returns every thread that ran the mapper.
    // The concurrent set is the only shared state, and it exists only to observe the threads.
    private static Set<Thread> threadsUsedBy(UnaryOperator<IntStream> mode) {
        Set<Thread> threads = ConcurrentHashMap.newKeySet();
        mode.apply(IntStream.range(0, 100_000).map(i -> {
                    threads.add(Thread.currentThread());
                    return i;
                }))
                .sum();
        return threads;
    }

    @RepeatedTest(5)
    @DisplayName("M05 §8 · parallel work runs on the caller and common-pool workers")
    void parallelWork_runsOnCallerAndCommonPoolWorkers() {
        Thread caller = Thread.currentThread();

        Set<Thread> threads = threadsUsedBy(IntStream::parallel);

        // Permitted set: the calling thread, or a worker of the common pool. Which thread ran which
        // element, and how many workers joined in, is never asserted.
        assertThat(threads)
                .allSatisfy(t -> assertThat(t == caller || t.getName().startsWith(COMMON_WORKER_PREFIX))
                        .isTrue());
        assertThat(threads)
                .filteredOn(t -> t != caller)
                .allSatisfy(
                        t -> assertThat(((ForkJoinWorkerThread) t).getPool()).isSameAs(ForkJoinPool.commonPool()));
        // JDK 25's AbstractTask.compute ends with the invoking thread processing one leaf itself.
        assertThat(threads).contains(caller);
    }

    @Test
    @DisplayName("M05 §8 · the common pool's parallelism defaults to availableProcessors() - 1, at least 1")
    void commonPoolParallelism_defaultsToProcessorsMinusOne() {
        String property = System.getProperty("java.util.concurrent.ForkJoinPool.common.parallelism");
        int expected = property == null
                ? Math.max(1, Runtime.getRuntime().availableProcessors() - 1)
                : Integer.parseInt(property);

        assertThat(ForkJoinPool.getCommonPoolParallelism()).isEqualTo(expected);
    }

    @Test
    @DisplayName("M05 §8 · the last parallel or sequential call decides the whole pipeline")
    void lastModeCall_decidesWholePipeline() {
        Thread caller = Thread.currentThread();

        assertThat(IntStream.range(0, 10).parallel().map(x -> x).sequential().isParallel())
                .isFalse();
        assertThat(IntStream.range(0, 10).sequential().map(x -> x).parallel().isParallel())
                .isTrue();
        // parallel() before the map, sequential() after it: the whole pipeline runs on the caller.
        Set<Thread> threads = threadsUsedBy(s -> s.parallel().sequential());
        assertThat(threads).containsExactly(caller);
    }

    @Test
    @DisplayName("M05 §8 · CompletableFuture async methods without an executor use the same common pool")
    void supplyAsyncWithoutExecutor_runsOnCommonPool() {
        Thread worker = CompletableFuture.supplyAsync(Thread::currentThread).join();

        assertThat(worker).isInstanceOf(ForkJoinWorkerThread.class);
        assertThat(((ForkJoinWorkerThread) worker).getPool()).isSameAs(ForkJoinPool.commonPool());
    }

    @Test
    @DisplayName("M05 §8 · in JDK 25 a parallel stream started inside a custom ForkJoinPool runs on that pool")
    void parallelStreamInsideCustomPool_usesThatPool() throws Exception {
        try (var pool = new ForkJoinPool(2)) {
            Set<Thread> threads =
                    pool.submit(() -> threadsUsedBy(IntStream::parallel)).get();

            // Undocumented: ForkJoinTask.fork uses the pool of the current worker thread.
            assertThat(threads)
                    .allSatisfy(t ->
                            assertThat(((ForkJoinWorkerThread) t).getPool()).isSameAs(pool));
        }
    }
}
