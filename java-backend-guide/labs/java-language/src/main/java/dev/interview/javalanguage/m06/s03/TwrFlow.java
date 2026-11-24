package dev.interview.javalanguage.m06.s03;

import dev.interview.javalanguage.m06.s03.TracingResource.Failure;
import java.util.List;

// Each method is one case of JLS 25 §14.20.3; the events list shows what ran and in which order.
public final class TwrFlow {

    private TwrFlow() {}

    public static void twoResources(List<String> events) {
        try (TracingResource a = TracingResource.open("A", events);
                TracingResource b = TracingResource.open("B", events)) {
            events.add("body");
        }
    }

    public static void bodyAndCloseFail(List<String> events) {
        try (TracingResource a = TracingResource.open("A", events);
                TracingResource b = TracingResource.open("B", events, Failure.ON_CLOSE)) {
            events.add("body");
            throw new IllegalArgumentException("body failed");
        }
    }

    public static void onlyCloseFails(List<String> events) {
        try (TracingResource a = TracingResource.open("A", events, Failure.ON_CLOSE)) {
            events.add("body");
        }
    }

    public static void bothClosesFail(List<String> events) {
        try (TracingResource a = TracingResource.open("A", events, Failure.ON_CLOSE);
                TracingResource b = TracingResource.open("B", events, Failure.ON_CLOSE)) {
            events.add("body");
        }
    }

    public static void secondOpenFails(List<String> events) {
        try (TracingResource a = TracingResource.open("A", events);
                TracingResource b = TracingResource.open("B", events, Failure.ON_OPEN)) {
            events.add("body");
        }
    }

    public static void catchAndFinally(List<String> events) {
        try (TracingResource a = TracingResource.open("A", events);
                TracingResource b = TracingResource.open("B", events)) {
            events.add("body");
            throw new IllegalArgumentException("body failed");
        } catch (IllegalArgumentException e) {
            events.add("catch " + e.getMessage());
        } finally {
            events.add("finally");
        }
    }

    public static void nullResource(List<String> events) {
        try (TracingResource missing = null) {
            events.add("body with " + missing);
        }
    }

    public static void existingVariable(List<String> events) {
        TracingResource shared = TracingResource.open("shared", events);
        try (shared) {
            events.add("body");
        }
    }
}
