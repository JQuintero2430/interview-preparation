package dev.interview.javalanguage.m04.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.support.InMemoryCompiler;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.ConcurrentModificationException;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.RandomAccess;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.IntStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Claims of Q04.25, Q04.26, Q04.28, Q04.29 and Q04.32 that are not printed output.
class Q04ListsAndIteratorsTest {

    private record Item(int key, int seq) {}

    @Test
    @DisplayName(
            "Q04.25 · after an add, ArrayList's iterator throws, ConcurrentHashMap's keeps going, COW's ignores it")
    void q04_25_threeIteratorKinds() {
        List<String> list = new ArrayList<>(List.of("a", "b"));
        Iterator<String> failFast = list.iterator();
        failFast.next();
        list.add("c");
        assertThatThrownBy(failFast::next).isInstanceOf(ConcurrentModificationException.class);

        Map<String, Integer> map = new ConcurrentHashMap<>(Map.of("a", 1, "b", 2));
        List<String> seen = new ArrayList<>();
        for (String key : map.keySet()) {
            seen.add(key);
            map.put(key + "+", 0);
        }
        assertThat(seen).contains("a", "b");
        assertThat(seen.stream().filter(k -> !k.contains("+")).toList()).containsExactlyInAnyOrder("a", "b");

        List<String> cow = new CopyOnWriteArrayList<>(List.of("a", "b"));
        Iterator<String> snapshot = cow.iterator();
        cow.add("c");
        List<String> fromSnapshot = new ArrayList<>();
        snapshot.forEachRemaining(fromSnapshot::add);
        assertThat(fromSnapshot).containsExactly("a", "b");
    }

    @Test
    @DisplayName("Q04.25 · a synchronizedList hands out the backing list's fail-fast iterator")
    void q04_25_synchronizedListIteratorIsFailFast() {
        List<String> list = Collections.synchronizedList(new ArrayList<>(List.of("a", "b")));
        Iterator<String> it = list.iterator();
        it.next();
        list.add("c");

        assertThatThrownBy(it::next).isInstanceOf(ConcurrentModificationException.class);
    }

    @Test
    @DisplayName(
            "Q04.26 · a listener that unsubscribes mid-delivery breaks a live-list bus, top frame in ArrayList$Itr")
    void q04_26_liveListBusThrows() {
        List<String> received = new ArrayList<>();
        Q04_26.Bus bus = new Q04_26.LiveListBus();
        bus.subscribe(oneShot(received));
        bus.subscribe((event, b) -> received.add("audit " + event));
        bus.subscribe((event, b) -> received.add("metrics " + event));

        assertThatThrownBy(() -> bus.publish("job-1"))
                .isInstanceOf(ConcurrentModificationException.class)
                .satisfies(e -> {
                    StackTraceElement top = e.getStackTrace()[0];
                    assertThat(top.getClassName()).isEqualTo("java.util.ArrayList$Itr");
                    assertThat(top.getMethodName()).isEqualTo("checkForComodification");
                    assertThat(Arrays.stream(e.getStackTrace()).map(StackTraceElement::getClassName))
                            .contains(Q04_26.LiveListBus.class.getName());
                });
        assertThat(received).containsExactly("once job-1");
    }

    @Test
    @DisplayName("Q04.26 · second-to-last, the unsubscribing listener makes the bus skip the last one silently")
    void q04_26_liveListBusSkipsSilently() {
        List<String> received = new ArrayList<>();
        Q04_26.Bus bus = new Q04_26.LiveListBus();
        bus.subscribe((event, b) -> received.add("audit " + event));
        bus.subscribe(oneShot(received));
        bus.subscribe((event, b) -> received.add("metrics " + event));

        bus.publish("job-1");

        assertThat(received).containsExactly("audit job-1", "once job-1");
    }

    @Test
    @DisplayName("Q04.26 · the snapshot bus delivers to everyone, and the unsubscription applies from the next event")
    void q04_26_snapshotBusDeliversToAll() {
        List<String> received = new ArrayList<>();
        Q04_26.Bus bus = new Q04_26.SnapshotBus();
        bus.subscribe(oneShot(received));
        bus.subscribe((event, b) -> received.add("audit " + event));
        bus.subscribe((event, b) -> received.add("metrics " + event));

        bus.publish("job-1");
        bus.publish("job-2");

        assertThat(received)
                .containsExactly("once job-1", "audit job-1", "metrics job-1", "audit job-2", "metrics job-2");
    }

    @Test
    @DisplayName("Q04.26 · a listener that subscribes another during delivery breaks the live-list bus even when last")
    void q04_26_liveListBusThrowsOnAdd() {
        List<String> received = new ArrayList<>();
        Q04_26.Bus bus = new Q04_26.LiveListBus();
        bus.subscribe((event, b) -> received.add("audit " + event));
        bus.subscribe((event, b) -> b.subscribe((e, inner) -> received.add("late " + e)));

        assertThatThrownBy(() -> bus.publish("job-1")).isInstanceOf(ConcurrentModificationException.class);
        assertThat(received).containsExactly("audit job-1");
    }

    @Test
    @DisplayName("Q04.28 · Arrays.asList(int[]) is one element, so contains(1) is false; the fix finds it")
    void q04_28_primitiveArrayTrap() {
        int[] codes = {1, 2, 3};

        assertThat(Arrays.asList(codes)).hasSize(1);
        assertThat(Arrays.asList(codes).get(0)).isSameAs(codes);
        assertThat(List.of(codes)).hasSize(1);
        assertThat(Q04_28.isAllowedBuggy(codes, 1)).isFalse();
        assertThat(Q04_28.isAllowedFixed(codes, 1)).isTrue();
        assertThat(Q04_28.isAllowedFixed(codes, 9)).isFalse();
        assertThat(Arrays.asList(new Integer[] {1, 2, 3}).contains(1)).isTrue();
    }

    @Test
    @DisplayName("Q04.28 · assigning Arrays.asList(int[]) to a List<Integer> does not compile")
    void q04_28_listOfIntegerDoesNotCompile() {
        String source = "class Probe {\n void run() {\n"
                + "java.util.List<Integer> codes = java.util.Arrays.asList(new int[] {1, 2, 3});\n }\n}\n";

        InMemoryCompiler.Result result = InMemoryCompiler.compile(Map.of("Probe", source));

        assertThat(result.success()).isFalse();
        assertThat(result.errorCodes()).containsExactly("compiler.err.prob.found.req");
    }

    @Test
    @DisplayName("Q04.29 · List.sort keeps equal keys in input order on 1,000 elements, where TimSort merges runs")
    void q04_29_stableOnLargeInput() {
        Random random = new Random(42);
        List<Item> items = new ArrayList<>(IntStream.range(0, 1_000)
                .mapToObj(i -> new Item(random.nextInt(10), i))
                .toList());

        items.sort(Comparator.comparingInt(Item::key));

        for (int i = 1; i < items.size(); i++) {
            Item previous = items.get(i - 1);
            Item current = items.get(i);
            assertThat(previous.key()).isLessThanOrEqualTo(current.key());
            if (previous.key() == current.key()) {
                assertThat(previous.seq()).isLessThan(current.seq());
            }
        }
    }

    @Test
    @DisplayName(
            "Q04.29 · on JDK 25, TimSort compares sorted and strictly descending input n - 1 times, random far more")
    void q04_29_adaptiveComparisonCounts() {
        List<Integer> ascending = IntStream.range(0, 1_000).boxed().toList();
        List<Integer> descending = ascending.reversed();
        List<Integer> shuffled = new ArrayList<>(ascending);
        Collections.shuffle(shuffled, new Random(42));

        assertThat(comparisonsToSort(ascending)).isEqualTo(999);
        assertThat(comparisonsToSort(descending)).isEqualTo(999);
        assertThat(comparisonsToSort(shuffled)).isGreaterThan(5 * 999);
    }

    @Test
    @DisplayName("Q04.32 · both export loops give the same text; only ArrayList is RandomAccess")
    void q04_32_exportLoopsAgree() {
        List<String> source = List.of("r1", "r2", "r3");
        Function<String, String> format = row -> row.toUpperCase(java.util.Locale.ROOT);

        for (List<String> rows : List.of(new ArrayList<>(source), new LinkedList<>(source))) {
            assertThat(Q04_32.exportIndexed(rows, format)).isEqualTo("R1\nR2\nR3\n");
            assertThat(Q04_32.exportIterated(rows, format)).isEqualTo("R1\nR2\nR3\n");
        }
        assertThat(new ArrayList<>(source)).isInstanceOf(RandomAccess.class);
        assertThat(new LinkedList<>(source)).isNotInstanceOf(RandomAccess.class);
    }

    @Test
    @DisplayName("Q04.32 · get(0..n-1) on a LinkedList walks n(n-2)/4 links for even n: 4x the work for 2x the rows")
    void q04_32_linkStepsGrowQuadratically() {
        assertThat(Q04_32.linkedListSteps(4)).isEqualTo(2);
        assertThat(Q04_32.linkedListSteps(100_000)).isEqualTo(2_499_950_000L);
        assertThat(Q04_32.linkedListSteps(200_000)).isEqualTo(9_999_900_000L);
    }

    private static Q04_26.Listener oneShot(List<String> received) {
        return new Q04_26.Listener() {
            @Override
            public void onEvent(String event, Q04_26.Bus bus) {
                received.add("once " + event);
                bus.unsubscribe(this);
            }
        };
    }

    private static int comparisonsToSort(List<Integer> input) {
        AtomicInteger count = new AtomicInteger();
        List<Integer> copy = new ArrayList<>(input);
        copy.sort((x, y) -> {
            count.incrementAndGet();
            return Integer.compare(x, y);
        });
        assertThat(copy).isSorted();
        return count.get();
    }
}
