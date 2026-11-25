package dev.interview.javalanguage.m06.s05;

// Run in a child JVM by the tests: another thread dies, main carries on and returns normally.
public final class WorkerThreadDies {

    private WorkerThreadDies() {}

    public static void main(String[] args) throws InterruptedException {
        Thread worker = Thread.ofPlatform().name("worker").start(() -> {
            throw new IllegalStateException("boom");
        });
        worker.join();
        System.out.println("main done");
    }
}
