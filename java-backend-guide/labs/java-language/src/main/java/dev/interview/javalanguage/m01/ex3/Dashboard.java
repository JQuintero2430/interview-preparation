package dev.interview.javalanguage.m01.ex3;

import java.util.List;

// Module 01 Ex01.3: the registered listener copies only the data it needs, so it does not pin the dashboard.
public final class Dashboard {

    private final String title;
    private final List<String> log;

    public Dashboard(String title, List<String> log) {
        this.title = title;
        this.log = log;
    }

    public void subscribe(ListenerRegistry registry) {
        // Locals are copied first because using the fields inside the lambda would capture this.
        String capturedTitle = title;
        List<String> capturedLog = log;
        registry.add(() -> capturedLog.add(capturedTitle));
    }
}
