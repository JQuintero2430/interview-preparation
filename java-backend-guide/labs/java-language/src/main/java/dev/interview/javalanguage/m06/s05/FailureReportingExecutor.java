package dev.interview.javalanguage.m06.s05;

import java.util.concurrent.Future;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

// Reports the failure of every task, whether it was run with execute or submit.
public class FailureReportingExecutor extends ThreadPoolExecutor {

    private final TaskFailureListener listener;

    public FailureReportingExecutor(int threads, ThreadFactory threadFactory, TaskFailureListener listener) {
        super(threads, threads, 0L, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<>(), threadFactory);
        this.listener = listener;
    }

    @Override
    protected void afterExecute(Runnable task, Throwable thrown) {
        super.afterExecute(task, thrown);
        Throwable failure = thrown != null ? thrown : failureStoredIn(task);
        if (failure != null) {
            listener.taskFailed(task, failure);
        }
    }

    // A submitted task is a FutureTask that caught the exception, so afterExecute receives null.
    private static Throwable failureStoredIn(Runnable task) {
        if (task instanceof Future<?> future && future.state() == Future.State.FAILED) {
            return future.exceptionNow();
        }
        return null;
    }
}
