package dev.interview.javalanguage.m01.s11;

import java.util.List;

// Module 01 §11: the inner RefreshListener reads the outer title, so javac gives it a synthetic outer reference and a
// registered listener pins the screen; the static nested and lambda variants copy only the data they need.
public final class ReportScreen {

    private final String title;
    private final List<String> log;

    public ReportScreen(String title, List<String> log) {
        this.title = title;
        this.log = log;
    }

    public void registerInnerListener(EventBus bus) {
        bus.register(new RefreshListener());
    }

    public void registerStaticListener(EventBus bus) {
        bus.register(new TitleListener(title, log));
    }

    // Locals are copied first because using the fields inside the lambda would capture this.
    public void registerLambdaListener(EventBus bus) {
        String capturedTitle = title;
        List<String> capturedLog = log;
        bus.register(() -> capturedLog.add(capturedTitle));
    }

    final class RefreshListener implements Runnable {

        RefreshListener() {}

        @Override
        public void run() {
            log.add(title);
        }
    }

    static final class TitleListener implements Runnable {

        private final String title;
        private final List<String> log;

        TitleListener(String title, List<String> log) {
            this.title = title;
            this.log = log;
        }

        @Override
        public void run() {
            log.add(title);
        }
    }
}
