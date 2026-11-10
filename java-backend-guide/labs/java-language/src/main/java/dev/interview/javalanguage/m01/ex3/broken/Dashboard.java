package dev.interview.javalanguage.m01.ex3.broken;

import java.util.List;

/** Intentionally defective starting code for Ex01.3; do not copy. */
// Module 01 Ex01.3: a registered inner-class listener pins the whole dashboard in memory.
public final class Dashboard {

    private final String title;
    private final List<String> log;

    public Dashboard(String title, List<String> log) {
        this.title = title;
        this.log = log;
    }

    public void subscribe(ListenerRegistry registry) {
        registry.add(new Refresh());
    }

    // Defect: the inner class keeps a synthetic reference to the dashboard.
    final class Refresh implements Runnable {

        @Override
        public void run() {
            log.add(title);
        }
    }
}
