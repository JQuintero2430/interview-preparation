package dev.interview.javalanguage.m06.s02;

import java.util.concurrent.CountDownLatch;

// Run in a child JVM by the tests: when main returns, the JVM terminates and the daemon's finally never runs.
public final class DaemonFinally {

    private DaemonFinally() {}

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch inTry = new CountDownLatch(1);
        Thread worker = new Thread(() -> {
            try {
                inTry.countDown();
                new CountDownLatch(1).await();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                System.out.println("daemon finally");
            }
        });
        worker.setDaemon(true);
        worker.start();
        inTry.await();
        System.out.println("main done");
    }
}
