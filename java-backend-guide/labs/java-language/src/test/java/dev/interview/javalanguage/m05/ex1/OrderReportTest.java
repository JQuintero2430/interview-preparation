package dev.interview.javalanguage.m05.ex1;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.entry;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.AbstractList;
import java.util.Arrays;
import java.util.List;
import java.util.RandomAccess;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class OrderReportTest {

    private static final Order ANN_BOOKS = new Order("ann", "books", 1_000);
    private static final Order BOB_GAMES = new Order("bob", "games", 2_500);
    private static final Order ANN_GAMES = new Order("ann", "games", 500);
    private static final Order CID_BOOKS = new Order("cid", "books", 300);
    private static final Order DEE_TOYS = new Order("dee", "toys", 2_500);
    private static final Order EVE_GAMES = new Order("eve", "games", 1_500);

    // Totals: ann 1500, bob 2500, cid 300, dee 2500, eve 1500.
    private static final List<Order> ORDERS = List.of(ANN_BOOKS, BOB_GAMES, ANN_GAMES, CID_BOOKS, DEE_TOYS, EVE_GAMES);

    @Test
    @DisplayName("Ex05.1 · (1) the total per customer is a TreeMap in customer-name order")
    void totalByCustomerInNameOrder() {
        var totals = OrderReport.totalByCustomer(ORDERS);

        assertThat(totals).isInstanceOf(java.util.TreeMap.class);
        assertThat(totals)
                .containsExactly(
                        entry("ann", 1_500L),
                        entry("bob", 2_500L),
                        entry("cid", 300L),
                        entry("dee", 2_500L),
                        entry("eve", 1_500L));
    }

    @Test
    @DisplayName("Ex05.1 · (2) the count per category includes known categories with no orders, as 0")
    void countByCategoryIncludesKnownCategoriesWithZero() {
        var counts = OrderReport.countByCategory(ORDERS, List.of("books", "games", "music"));

        assertThat(counts)
                .containsExactly(entry("books", 2L), entry("games", 3L), entry("music", 0L), entry("toys", 1L));
    }

    @Test
    @DisplayName("Ex05.1 · (3) the top 3 customers by total, with ties broken by name in ascending order")
    void topThreeCustomersTiesByName() {
        assertThat(OrderReport.topCustomers(ORDERS, 3))
                .containsExactly(
                        new CustomerTotal("bob", 2_500),
                        new CustomerTotal("dee", 2_500),
                        new CustomerTotal("ann", 1_500));
    }

    @Test
    @DisplayName("Ex05.1 · (3) fewer customers than the limit returns all of them, ranked")
    void topCustomersWithFewerCustomersThanTheLimit() {
        assertThat(OrderReport.topCustomers(List.of(ANN_BOOKS, CID_BOOKS, ANN_GAMES), 3))
                .containsExactly(new CustomerTotal("ann", 1_500), new CustomerTotal("cid", 300));
    }

    @Test
    @DisplayName("Ex05.1 · (4) the partition puts orders at or above the threshold under true (large)")
    void partitionBySizeAtTheThreshold() {
        var bySize = OrderReport.partitionBySize(ORDERS, 1_000);

        assertThat(bySize.get(true)).containsExactly(ANN_BOOKS, BOB_GAMES, DEE_TOYS, EVE_GAMES);
        assertThat(bySize.get(false)).containsExactly(ANN_GAMES, CID_BOOKS);
    }

    @Test
    @DisplayName("Ex05.1 · (4) the partition always has both keys, even when every order is small")
    void partitionAlwaysHasBothKeys() {
        var bySize = OrderReport.partitionBySize(List.of(ANN_GAMES, CID_BOOKS), 1_000);

        assertThat(bySize).containsOnlyKeys(true, false);
        assertThat(bySize.get(true)).isEmpty();
        assertThat(bySize.get(false)).containsExactly(ANN_GAMES, CID_BOOKS);
    }

    @Test
    @DisplayName("Ex05.1 · (5) teeing returns the smallest and largest order as one record, ties broken by customer")
    void rangeReturnsSmallestAndLargest() {
        assertThat(OrderReport.range(ORDERS)).contains(new OrderRange(CID_BOOKS, DEE_TOYS));
    }

    @Test
    @DisplayName("Ex05.1 · (5) the minimum and maximum come from one pass over the input")
    void rangeTraversesTheInputOnce() {
        var orders = new CountingList<>(ORDERS);

        OrderReport.range(orders);

        assertThat(orders.gets()).isEqualTo(ORDERS.size());
    }

    @Test
    @DisplayName("Ex05.1 · (6) an empty input gives empty results, not exceptions")
    void emptyInputGivesEmptyResults() {
        List<Order> none = List.of();

        assertThat(OrderReport.totalByCustomer(none)).isEmpty();
        assertThat(OrderReport.countByCategory(none, List.of())).isEmpty();
        assertThat(OrderReport.countByCategory(none, List.of("books"))).containsExactly(entry("books", 0L));
        assertThat(OrderReport.topCustomers(none, 3)).isEmpty();
        assertThat(OrderReport.partitionBySize(none, 1_000))
                .containsExactly(entry(false, List.of()), entry(true, List.of()));
        assertThat(OrderReport.range(none)).isEmpty();
    }

    @Test
    @DisplayName("Ex05.1 · (6) the report keeps no mutable state: no instance fields, only static final constants")
    void reportKeepsNoMutableState() throws NoSuchMethodException {
        Field[] fields = OrderReport.class.getDeclaredFields();

        assertThat(Arrays.stream(fields).map(Field::getModifiers))
                .allMatch(modifiers -> Modifier.isStatic(modifiers) && Modifier.isFinal(modifiers));
        assertThat(Modifier.isPrivate(OrderReport.class.getDeclaredConstructor().getModifiers()))
                .isTrue();
    }

    @Test
    @DisplayName("Ex05.1 · (6) calling a method twice on an unmodifiable input gives equal results")
    void repeatedCallsGiveEqualResults() {
        assertThat(OrderReport.totalByCustomer(ORDERS)).isEqualTo(OrderReport.totalByCustomer(ORDERS));
        assertThat(OrderReport.countByCategory(ORDERS, List.of("music")))
                .isEqualTo(OrderReport.countByCategory(ORDERS, List.of("music")));
        assertThat(OrderReport.topCustomers(ORDERS, 3)).isEqualTo(OrderReport.topCustomers(ORDERS, 3));
    }

    @Test
    @DisplayName("Ex05.1 · (6) with no state outside the collectors, a parallel stream gives the same report")
    void parallelStreamGivesTheSameReport() {
        List<Order> many = IntStream.range(0, 10_000)
                .mapToObj(i -> new Order("c" + i % 97, "k" + i % 13, i % 1_000))
                .toList();
        var parallel = new ParallelList<>(many);

        assertThat(parallel.stream().isParallel()).isTrue();
        assertThat(OrderReport.totalByCustomer(parallel)).isEqualTo(OrderReport.totalByCustomer(many));
        assertThat(OrderReport.countByCategory(parallel, List.of("none")))
                .isEqualTo(OrderReport.countByCategory(many, List.of("none")));
        assertThat(OrderReport.topCustomers(parallel, 3)).isEqualTo(OrderReport.topCustomers(many, 3));
        assertThat(OrderReport.partitionBySize(parallel, 500)).isEqualTo(OrderReport.partitionBySize(many, 500));
        assertThat(OrderReport.range(parallel)).isEqualTo(OrderReport.range(many));
    }

    // A list whose stream() is parallel, so the report's own pipelines run in parallel.
    private static final class ParallelList<E> extends AbstractList<E> implements RandomAccess {

        private final List<E> delegate;

        ParallelList(List<E> delegate) {
            this.delegate = delegate;
        }

        @Override
        public E get(int index) {
            return delegate.get(index);
        }

        @Override
        public int size() {
            return delegate.size();
        }

        @Override
        public Stream<E> stream() {
            return parallelStream();
        }
    }

    // A random-access list that counts get calls: List.spliterator() on a RandomAccess list reads through get.
    private static final class CountingList<E> extends AbstractList<E> implements RandomAccess {

        private final List<E> delegate;
        private int gets;

        CountingList(List<E> delegate) {
            this.delegate = delegate;
        }

        @Override
        public E get(int index) {
            gets++;
            return delegate.get(index);
        }

        @Override
        public int size() {
            return delegate.size();
        }

        int gets() {
            return gets;
        }
    }
}
