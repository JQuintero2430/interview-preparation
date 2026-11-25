package dev.interview.javalanguage.m06.s05;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ThreadPoolFailureTest {

    private static final IllegalStateException BOOM = new IllegalStateException("nightly job failed");

    @Test
    @DisplayName("M06 §5 · submit stores the exception in the Future and get wraps it in ExecutionException")
    void submit_storesExceptionInFuture() throws Exception {
        AtomicInteger handlerCalls = new AtomicInteger();
        ExecutorService pool = new ThreadPoolExecutor(
                1,
                1,
                0L,
                TimeUnit.MILLISECONDS,
                new LinkedBlockingQueue<>(),
                PoolThreads.withHandler("nightly-", (t, e) -> handlerCalls.incrementAndGet()));

        Future<?> future = pool.submit(() -> {
            throw BOOM;
        });
        Throwable thrown = catchThrowable(future::get);
        pool.shutdown();
        assertThat(pool.awaitTermination(10, TimeUnit.SECONDS)).isTrue();

        assertThat(thrown).isInstanceOf(ExecutionException.class).hasCause(BOOM);
        assertThat(future.state()).isEqualTo(Future.State.FAILED);
        assertThat(handlerCalls).hasValue(0);
    }

    @Test
    @DisplayName("M06 §5 · execute lets the exception reach the worker's handler")
    void execute_exceptionReachesWorkersHandler() throws Exception {
        CompletableFuture<String> seen = new CompletableFuture<>();
        ExecutorService pool = new ThreadPoolExecutor(
                1,
                1,
                0L,
                TimeUnit.MILLISECONDS,
                new LinkedBlockingQueue<>(),
                PoolThreads.withHandler("nightly-", (t, e) -> seen.complete(t.getName() + ": " + e.getMessage())));

        pool.execute(() -> {
            throw BOOM;
        });

        assertThat(seen.get(10, TimeUnit.SECONDS)).startsWith("nightly-").endsWith(": nightly job failed");
        pool.shutdown();
        assertThat(pool.awaitTermination(10, TimeUnit.SECONDS)).isTrue();
    }

    @Test
    @DisplayName("M06 §5 · a worker killed by an execute task is replaced by a new thread")
    void deadWorker_isReplaced() throws Exception {
        CompletableFuture<String> deadWorker = new CompletableFuture<>();
        ExecutorService pool = new ThreadPoolExecutor(
                1,
                1,
                0L,
                TimeUnit.MILLISECONDS,
                new LinkedBlockingQueue<>(),
                PoolThreads.withHandler("nightly-", (t, e) -> deadWorker.complete(t.getName())));

        pool.execute(() -> {
            throw BOOM;
        });
        String deadName = deadWorker.get(10, TimeUnit.SECONDS);
        String nextName = pool.submit(() -> Thread.currentThread().getName()).get(10, TimeUnit.SECONDS);
        pool.shutdown();
        assertThat(pool.awaitTermination(10, TimeUnit.SECONDS)).isTrue();

        assertThat(nextName).startsWith("nightly-").isNotEqualTo(deadName);
    }

    @Test
    @DisplayName("M06 §5 · afterExecute sees the exception of an execute task and not of a submit task")
    void afterExecute_seesExecuteFailureOnly() throws Exception {
        RecordingExecutor pool = new RecordingExecutor(2);

        pool.execute(() -> {
            throw BOOM;
        });
        pool.submit(() -> {
            throw BOOM;
        });
        assertThat(pool.calls.await(10, TimeUnit.SECONDS)).isTrue();
        pool.shutdown();
        assertThat(pool.awaitTermination(10, TimeUnit.SECONDS)).isTrue();

        assertThat(pool.seen).hasSize(2).containsOnlyOnce(BOOM).containsOnlyOnce("null");
    }

    @Test
    @DisplayName("M06 §5 · a reporting executor sees the failures of execute and submit tasks")
    void reportingExecutor_reportsBothKinds() throws Exception {
        List<Throwable> reported = new CopyOnWriteArrayList<>();
        CountDownLatch twoReports = new CountDownLatch(2);
        FailureReportingExecutor pool = new FailureReportingExecutor(
                1, PoolThreads.withHandler("reporting-", (t, e) -> {}), (task, failure) -> {
                    reported.add(failure);
                    twoReports.countDown();
                });

        pool.execute(() -> {
            throw BOOM;
        });
        pool.submit(() -> {
            throw new IllegalArgumentException("bad input");
        });
        pool.submit(() -> {});
        assertThat(twoReports.await(10, TimeUnit.SECONDS)).isTrue();
        pool.shutdown();
        assertThat(pool.awaitTermination(10, TimeUnit.SECONDS)).isTrue();

        assertThat(reported)
                .hasSize(2)
                .anySatisfy(e -> assertThat(e).isSameAs(BOOM))
                .anySatisfy(e -> assertThat(e).isInstanceOf(IllegalArgumentException.class));
    }

    // Records what afterExecute receives: the Throwable, or "null".
    private static final class RecordingExecutor extends ThreadPoolExecutor {

        final List<Object> seen = new CopyOnWriteArrayList<>();
        final CountDownLatch calls = new CountDownLatch(2);

        RecordingExecutor(int threads) {
            super(
                    threads,
                    threads,
                    0L,
                    TimeUnit.MILLISECONDS,
                    new LinkedBlockingQueue<>(),
                    PoolThreads.withHandler("recording-", (t, e) -> {}));
        }

        @Override
        protected void afterExecute(Runnable task, Throwable thrown) {
            seen.add(thrown == null ? "null" : thrown);
            calls.countDown();
        }
    }
}
