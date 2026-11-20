package dev.interview.javalanguage.m03.outputs;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.function.Predicate;

// Module 03 Q03.18: a reflection dispatcher that matches handler methods by name and parameter type. The class
// implementing Handler<OrderPlaced> has two such methods: handle(OrderPlaced) and the bridge handle(Object).
public final class Q03_18 {

    private static final String HANDLE = "handle";

    private Q03_18() {}

    public interface Handler<E> {
        void handle(E event);
    }

    public record OrderPlaced(String id) {}

    public static final class OrderPlacedHandler implements Handler<OrderPlaced> {

        private int calls;

        @Override
        public void handle(OrderPlaced event) {
            calls++;
        }

        public int calls() {
            return calls;
        }
    }

    // ALL_METHODS is the defect on purpose; SKIP_BRIDGES is the fix.
    public enum Scan {
        ALL_METHODS(method -> true),
        SKIP_BRIDGES(method -> !method.isBridge());

        private final Predicate<Method> filter;

        Scan(Predicate<Method> filter) {
            this.filter = filter;
        }

        boolean accepts(Method method) {
            return filter.test(method);
        }
    }

    public static void dispatch(Object handler, Object event, Scan scan)
            throws IllegalAccessException, InvocationTargetException {
        for (Method method : handler.getClass().getDeclaredMethods()) {
            if (isHandlerFor(method, event) && scan.accepts(method)) {
                method.invoke(handler, event);
            }
        }
    }

    public static int deliveries(Scan scan) {
        OrderPlacedHandler handler = new OrderPlacedHandler();
        try {
            dispatch(handler, new OrderPlaced("o-1"), scan);
        } catch (IllegalAccessException | InvocationTargetException e) {
            throw new IllegalStateException(e);
        }
        return handler.calls();
    }

    private static boolean isHandlerFor(Method method, Object event) {
        return method.getName().equals(HANDLE)
                && method.getParameterCount() == 1
                && method.getParameterTypes()[0].isInstance(event);
    }
}
