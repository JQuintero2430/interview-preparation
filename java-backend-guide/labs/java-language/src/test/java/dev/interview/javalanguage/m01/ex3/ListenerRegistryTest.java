package dev.interview.javalanguage.m01.ex3;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ListenerRegistryTest {

    private static final String REGISTRY_NAME = "audit";
    private static final String TITLE = "Orders";
    private static final String NULL_TEXT = "null";
    private static final int EXPECTED_FIXED_COUNT = 3;
    private static final int EXPECTED_BROKEN_COUNT = 5;

    private static final List<String> RECORDED = new ArrayList<>();
    private static final Runnable FIRST = () -> {};
    private static final Runnable SECOND = () -> {};
    private static final Runnable THIRD = () -> {};

    @Test
    @DisplayName("Ex01.3 · (1) add then addAll counts each registration once")
    void addAll_countsEachElementOnce_whenCalledAfterAdd() {
        ListenerRegistry registry = ListenerRegistry.create(REGISTRY_NAME, r -> {});

        registry.add(FIRST);
        registry.addAll(List.of(SECOND, THIRD));

        assertThat(registry.registrations()).isEqualTo(EXPECTED_FIXED_COUNT);
        assertThat(registry.listeners()).hasSize(EXPECTED_FIXED_COUNT);
    }

    @Test
    @DisplayName("Ex01.3 · (1) the repaired registry composes a set instead of extending a collection")
    void listenerRegistry_extendsObject_whenInspected() {
        assertThat(ListenerRegistry.class.getSuperclass()).isEqualTo(Object.class);
    }

    @Test
    @DisplayName("Ex01.3 · (1) broken registry double counts the elements of addAll")
    void brokenAddAll_countsFiveRegistrations_whenAddThenAddAllOfTwo() {
        var registry = new dev.interview.javalanguage.m01.ex3.broken.ListenerRegistry();

        registry.add(FIRST);
        registry.addAll(List.of(SECOND, THIRD));

        assertThat(registry.registrations()).isEqualTo(EXPECTED_BROKEN_COUNT);
    }

    @Test
    @DisplayName("Ex01.3 · (1) addAll of an empty collection changes nothing and returns false")
    void addAll_returnsFalseAndCountsNothing_whenCollectionEmpty() {
        ListenerRegistry registry = ListenerRegistry.create(REGISTRY_NAME, r -> {});

        boolean changed = registry.addAll(List.of());

        assertThat(changed).isFalse();
        assertThat(registry.registrations()).isZero();
        assertThat(registry.listeners()).isEmpty();
    }

    @Test
    @DisplayName("Ex01.3 · (1) addAll of a single element registers it once and returns true")
    void addAll_returnsTrueAndCountsOnce_whenSingleElement() {
        ListenerRegistry registry = ListenerRegistry.create(REGISTRY_NAME, r -> {});

        boolean changed = registry.addAll(List.of(FIRST));

        assertThat(changed).isTrue();
        assertThat(registry.registrations()).isEqualTo(1);
        assertThat(registry.listeners()).containsExactly(FIRST);
    }

    @Test
    @DisplayName("Ex01.3 · (1) addAll of many elements keeps insertion order and counts each one")
    void addAll_registersAllInOrder_whenManyElements() {
        ListenerRegistry registry = ListenerRegistry.create(REGISTRY_NAME, r -> {});

        boolean changed = registry.addAll(List.of(FIRST, SECOND, THIRD));

        assertThat(changed).isTrue();
        assertThat(registry.registrations()).isEqualTo(EXPECTED_FIXED_COUNT);
        assertThat(registry.listeners()).containsExactly(FIRST, SECOND, THIRD);
    }

    @Test
    @DisplayName("Ex01.3 · (1) a duplicate add returns false but still counts a registration")
    void add_returnsFalseButCounts_whenListenerAlreadyRegistered() {
        ListenerRegistry registry = ListenerRegistry.create(REGISTRY_NAME, r -> {});
        registry.add(FIRST);

        boolean changed = registry.add(FIRST);

        assertThat(changed).isFalse();
        assertThat(registry.registrations()).isEqualTo(2);
        assertThat(registry.listeners()).hasSize(1);
    }

    @Test
    @DisplayName("Ex01.3 · (1) listeners view rejects mutation")
    void listeners_throwsUnsupportedOperation_whenMutated() {
        ListenerRegistry registry = ListenerRegistry.create(REGISTRY_NAME, r -> {});
        var view = registry.listeners();

        assertThatThrownBy(() -> view.add(FIRST)).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("Ex01.3 · (1) add rejects a null listener")
    void add_throwsNullPointer_whenListenerNull() {
        ListenerRegistry registry = ListenerRegistry.create(REGISTRY_NAME, r -> {});

        assertThatNullPointerException().isThrownBy(() -> registry.add(null));
    }

    @Test
    @DisplayName("Ex01.3 · (1) addAll surfaces a null element as NullPointerException")
    void addAll_throwsNullPointer_whenElementNull() {
        ListenerRegistry registry = ListenerRegistry.create(REGISTRY_NAME, r -> {});
        Collection<Runnable> withNull = Arrays.asList(FIRST, null);

        assertThatNullPointerException().isThrownBy(() -> registry.addAll(withNull));
    }

    @Test
    @DisplayName("Ex01.3 · (1) fire runs every registered listener")
    void fire_runsEveryListener_whenSeveralRegistered() {
        ListenerRegistry registry = ListenerRegistry.create(REGISTRY_NAME, r -> {});
        List<String> ran = new ArrayList<>();
        registry.add(() -> ran.add("a"));
        registry.add(() -> ran.add("b"));

        registry.fire();

        assertThat(ran).containsExactly("a", "b");
    }

    @Test
    @DisplayName("Ex01.3 · (2) the broken Refresh listener holds a field of type broken.Dashboard")
    void brokenSubscribe_registersListenerWithDashboardField_whenSubscribed() {
        var registry = new dev.interview.javalanguage.m01.ex3.broken.ListenerRegistry();
        var dashboard = new dev.interview.javalanguage.m01.ex3.broken.Dashboard(TITLE, new ArrayList<>());

        dashboard.subscribe(registry);

        Runnable listener = registry.iterator().next();
        assertThat(declaredFieldTypes(listener)).contains(dev.interview.javalanguage.m01.ex3.broken.Dashboard.class);
    }

    @Test
    @DisplayName("Ex01.3 · (2) the broken Refresh listener still appends the title on fire")
    void brokenFire_appendsTitle_whenSubscribed() {
        var registry = new dev.interview.javalanguage.m01.ex3.broken.ListenerRegistry();
        List<String> log = new ArrayList<>();
        new dev.interview.javalanguage.m01.ex3.broken.Dashboard(TITLE, log).subscribe(registry);

        registry.fire();

        assertThat(log).containsExactly(TITLE);
    }

    @Test
    @DisplayName("Ex01.3 · (2) the repaired listener holds no field of type Dashboard")
    void subscribe_registersListenerWithoutDashboardField_whenSubscribed() {
        ListenerRegistry registry = ListenerRegistry.create(REGISTRY_NAME, r -> {});

        new Dashboard(TITLE, new ArrayList<>()).subscribe(registry);

        Runnable listener = registry.listeners().iterator().next();
        assertThat(registry.listeners()).hasSize(1);
        assertThat(declaredFieldTypes(listener)).doesNotContain(Dashboard.class);
    }

    @Test
    @DisplayName("Ex01.3 · (2) the repaired listener appends the title on fire")
    void fire_appendsTitle_whenDashboardSubscribed() {
        ListenerRegistry registry = ListenerRegistry.create(REGISTRY_NAME, r -> {});
        List<String> log = new ArrayList<>();
        new Dashboard(TITLE, log).subscribe(registry);

        registry.fire();

        assertThat(log).containsExactly(TITLE);
    }

    @Test
    @DisplayName("Ex01.3 · (3) broken registry calls the overridable hook before the subclass field is set")
    void brokenConstructor_recordsNull_whenSubclassFieldNotYetAssigned() {
        RECORDED.clear();

        new Audited(REGISTRY_NAME);

        assertThat(RECORDED).containsExactly(NULL_TEXT);
    }

    @Test
    @DisplayName("Ex01.3 · (3) create hands the fully built registry to the callback")
    void create_passesBuiltRegistry_whenCallbackGiven() {
        List<String> seen = new ArrayList<>();

        ListenerRegistry.create(REGISTRY_NAME, r -> seen.add(r.name()));

        assertThat(seen).containsExactly(REGISTRY_NAME);
    }

    @Test
    @DisplayName("Ex01.3 · (3) the repaired registry is final")
    void listenerRegistry_isFinal_whenInspected() {
        assertThat(Modifier.isFinal(ListenerRegistry.class.getModifiers())).isTrue();
    }

    @Test
    @DisplayName("Ex01.3 · (3) create rejects a null name")
    void create_throwsNullPointer_whenNameNull() {
        assertThatNullPointerException().isThrownBy(() -> ListenerRegistry.create(null, r -> {}));
    }

    @Test
    @DisplayName("Ex01.3 · (3) create rejects a null callback")
    void create_throwsNullPointer_whenCallbackNull() {
        assertThatNullPointerException().isThrownBy(() -> ListenerRegistry.create(REGISTRY_NAME, null));
    }

    private static List<Class<?>> declaredFieldTypes(Object instance) {
        List<Class<?>> types = new ArrayList<>();
        for (Field field : instance.getClass().getDeclaredFields()) {
            types.add(field.getType());
        }
        return types;
    }

    private static final class Audited extends dev.interview.javalanguage.m01.ex3.broken.ListenerRegistry {

        private final String label;

        Audited(String label) {
            super();
            this.label = label;
        }

        @Override
        protected void onCreated() {
            RECORDED.add(String.valueOf(label));
        }
    }
}
