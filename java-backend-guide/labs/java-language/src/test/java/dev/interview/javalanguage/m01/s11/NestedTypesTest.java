package dev.interview.javalanguage.m01.s11;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 01 §11 at runtime and through reflection. Reachability is asserted through the synthetic field, never
// through GC timing, because a collector run is not deterministic.
class NestedTypesTest {

    private static final String TITLE = "Quarterly";
    private static final String OTHER_TITLE = "Annual";
    private static final String FIRST = "first";
    private static final String SECOND = "second";

    static class Sibling {}

    private final List<String> log = new ArrayList<>();

    private static boolean isSyntheticScreenField(Field field) {
        return field.isSynthetic() && field.getType() == ReportScreen.class;
    }

    @Test
    @DisplayName("M01 §11 · inner class that uses the outer instance has a synthetic outer field")
    void innerListener_keepsTheCreatingScreenReachable_whenItReadsTheOuterInstance() throws IllegalAccessException {
        var screen = new ReportScreen(TITLE, log);
        var bus = new EventBus();
        screen.registerInnerListener(bus);
        Runnable listener = bus.listeners().get(0);

        Field outer = Arrays.stream(listener.getClass().getDeclaredFields())
                .filter(NestedTypesTest::isSyntheticScreenField)
                .findFirst()
                .orElseThrow();
        outer.setAccessible(true);

        assertThat(outer.get(listener)).isSameAs(screen);
    }

    @Test
    @DisplayName("M01 §11 · static nested class has none")
    void staticListener_declaresNoOuterReference_whenItIsAStaticNestedClass() {
        var screen = new ReportScreen(TITLE, log);
        var bus = new EventBus();
        screen.registerStaticListener(bus);
        Runnable listener = bus.listeners().get(0);

        Field[] fields = listener.getClass().getDeclaredFields();

        assertThat(fields).noneMatch(Field::isSynthetic);
        assertThat(fields).noneMatch(f -> f.getType() == ReportScreen.class);
    }

    @Test
    @DisplayName("M01 §11 · lambda listener captures only what it needs")
    void lambdaListener_capturesNoScreen_whenItUsesOnlyCopiedLocals() {
        var screen = new ReportScreen(TITLE, log);
        var bus = new EventBus();
        screen.registerLambdaListener(bus);
        Runnable listener = bus.listeners().get(0);

        bus.fire();

        assertThat(listener.getClass().getDeclaredFields()).noneMatch(f -> f.getType() == ReportScreen.class);
        assertThat(log).containsExactly(TITLE);
    }

    @Test
    @DisplayName("M01 §11 · local class reads an effectively final local")
    void localClass_returnsTheCapturedLocal_whenTheLocalIsEffectivelyFinal() {
        String captured = TITLE;

        class Reader {
            String run() {
                return captured;
            }
        }

        assertThat(new Reader().run()).isEqualTo(TITLE);
    }

    @Test
    @DisplayName("M01 §11 · static nested class is created with new Outer.Nested(...)")
    void titleListener_logsTheTitle_whenCreatedThroughTheOuterName() {
        Runnable listener = new ReportScreen.TitleListener(TITLE, log);

        listener.run();

        assertThat(log).containsExactly(TITLE);
    }

    @Test
    @DisplayName("M01 §11 · inner class is created with outer.new Inner()")
    void refreshListener_logsTheScreenTitle_whenCreatedThroughAnOuterInstance() {
        var screen = new ReportScreen(TITLE, log);
        Runnable listener = screen.new RefreshListener();

        listener.run();

        assertThat(log).containsExactly(TITLE);
    }

    @Test
    @DisplayName("M01 §11 · anonymous class implements the interface and extends Object")
    void anonymousClass_reportsItsShape_whenItImplementsRunnable() {
        Runnable anonymous = new Runnable() {
            @Override
            public void run() {}
        };

        Class<?> type = anonymous.getClass();

        assertThat(type.isAnonymousClass()).isTrue();
        assertThat(type.getInterfaces()).containsExactly(Runnable.class);
        assertThat(type.getSuperclass()).isEqualTo(Object.class);
        assertThat(type).isNotEqualTo(Runnable.class);
    }

    @Test
    @DisplayName("M01 §11 · nested class of the test reports the test class as nest host")
    void getNestHost_returnsTheOuterClass_whenCalledOnANestedClass() {
        assertThat(Sibling.class.getNestHost()).isEqualTo(NestedTypesTest.class);
        assertThat(NestedTypesTest.class.getNestMembers()).contains(Sibling.class);
    }

    @Test
    @DisplayName("M01 §11 · inner and static nested classes share the nest host of their outer class")
    void getNestHost_returnsReportScreen_whenCalledOnInnerAndStaticNestedClasses() {
        assertThat(ReportScreen.RefreshListener.class.getNestHost()).isEqualTo(ReportScreen.class);
        assertThat(ReportScreen.TitleListener.class.getNestHost()).isEqualTo(ReportScreen.class);
    }

    @Test
    @DisplayName("M01 §11 · fire runs listeners in registration order")
    void fire_runsListenersInRegistrationOrder_whenSeveralAreRegistered() {
        var bus = new EventBus();
        bus.register(() -> log.add(FIRST));
        bus.register(() -> log.add(SECOND));

        bus.fire();

        assertThat(log).containsExactly(FIRST, SECOND);
    }

    @Test
    @DisplayName("M01 §11 · fire with a single listener runs it once")
    void fire_runsTheListenerOnce_whenOnlyOneIsRegistered() {
        var bus = new EventBus();
        bus.register(() -> log.add(FIRST));

        bus.fire();

        assertThat(log).containsExactly(FIRST);
    }

    @Test
    @DisplayName("M01 §11 · fire on an empty bus does nothing")
    void fire_doesNothing_whenNoListenerIsRegistered() {
        var bus = new EventBus();

        bus.fire();

        assertThat(bus.listeners()).isEmpty();
        assertThat(log).isEmpty();
    }

    @Test
    @DisplayName("M01 §11 · the three listener kinds of one screen log the title three times")
    void fire_logsTheTitleThreeTimes_whenAllListenerKindsAreRegistered() {
        var screen = new ReportScreen(OTHER_TITLE, log);
        var bus = new EventBus();
        screen.registerInnerListener(bus);
        screen.registerStaticListener(bus);
        screen.registerLambdaListener(bus);

        bus.fire();

        assertThat(log).containsExactly(OTHER_TITLE, OTHER_TITLE, OTHER_TITLE);
    }

    @Test
    @DisplayName("M01 §11 · listeners view cannot be modified")
    void listeners_throwsUnsupportedOperation_whenTheCallerTriesToAdd() {
        var bus = new EventBus();
        List<Runnable> view = bus.listeners();

        assertThatThrownBy(() -> view.add(() -> log.add(FIRST))).isInstanceOf(UnsupportedOperationException.class);
    }
}
