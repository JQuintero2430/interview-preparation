package dev.interview.javalanguage.m02.s04;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.TreeSet;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Module 02 §4: Comparable and Comparator pitfalls, pinned as executable facts. */
class OrderingTest {

    private static final String ONE_SCALE_ONE = "1.0";
    private static final String ONE_SCALE_TWO = "1.00";
    private static final String BOGOTA = "Bogota";
    private static final String LIMA = "Lima";
    private static final String ANA = "Ana";
    private static final String BEA = "Bea";
    private static final String CARL = "Carl";
    private static final String ZOE = "Zoe";
    private static final String JOB_SMALL = "small";
    private static final String JOB_MIN = "min";
    private static final long FIRST_ID = 1L;
    private static final long SECOND_ID = 2L;
    private static final long THIRD_ID = 3L;
    private static final long FOURTH_ID = 4L;
    private static final int RANDOM_SEED = 0;
    private static final int RANDOM_BOUND = 4;
    private static final int LIST_SIZE = 1_000;
    private static final String CONTRACT_MESSAGE = "Comparison method violates its general contract!";

    @Test
    @DisplayName("M02 §4 · BigDecimal 1.0 and 1.00: HashSet keeps two, TreeSet keeps one")
    void compareTo_disagreesWithEquals_whenBigDecimalScaleDiffers() {
        BigDecimal oneScaleOne = new BigDecimal(ONE_SCALE_ONE);
        BigDecimal oneScaleTwo = new BigDecimal(ONE_SCALE_TWO);

        Set<BigDecimal> hashed = new HashSet<>(List.of(oneScaleOne, oneScaleTwo));
        Set<BigDecimal> sorted = new TreeSet<>(List.of(oneScaleOne, oneScaleTwo));

        assertThat(hashed).hasSize(2);
        assertThat(sorted).hasSize(1);
        assertThat(oneScaleOne.compareTo(oneScaleTwo)).isZero();
        assertThat(oneScaleOne.equals(oneScaleTwo)).isFalse();
    }

    @Test
    @DisplayName("M02 §4 · subtraction comparator misorders Integer.MIN_VALUE")
    void sort_misordersJob_whenPriorityDifferenceOverflows() {
        Job small = new Job(JOB_SMALL, 1);
        Job min = new Job(JOB_MIN, Integer.MIN_VALUE);
        List<Job> bySubtraction = new ArrayList<>(List.of(min, small));
        List<Job> byPriority = new ArrayList<>(List.of(small, min));

        bySubtraction.sort(Job.BY_PRIORITY_SUBTRACTION);
        byPriority.sort(Job.BY_PRIORITY);

        assertThat(Job.BY_PRIORITY_SUBTRACTION.compare(min, small)).isPositive();
        assertThat(bySubtraction).last().isEqualTo(min);
        assertThat(byPriority).first().isEqualTo(min);
    }

    @Test
    @DisplayName("M02 §4 · TreeSet by name drops a second person with the same name")
    void add_rejectsSecondCustomer_whenTreeSetComparesByNameOnly() {
        Customer first = new Customer(FIRST_ID, ANA, LIMA);
        Customer sameName = new Customer(SECOND_ID, ANA, BOGOTA);
        Set<Customer> byName = new TreeSet<>(Customer.BY_NAME);
        Set<Customer> byNameThenId = new TreeSet<>(Customer.BY_NAME_THEN_ID);

        boolean firstAdded = byName.add(first);
        boolean secondAdded = byName.add(sameName);
        byNameThenId.add(first);
        byNameThenId.add(sameName);

        assertThat(firstAdded).isTrue();
        assertThat(secondAdded).isFalse();
        assertThat(byName).hasSize(1);
        assertThat(new HashSet<>(List.of(first, sameName))).hasSize(2);
        assertThat(byNameThenId).hasSize(2);
    }

    @Test
    @DisplayName("M02 §4 · comparing chain with nullsLast orders nulls last")
    void sort_ordersNullCityLast_whenNullsLastChainIsUsed() {
        Customer lima = new Customer(FIRST_ID, ZOE, LIMA);
        Customer noCity = new Customer(SECOND_ID, BEA, null);
        Customer bogota = new Customer(THIRD_ID, CARL, BOGOTA);
        Customer limaTieBreak = new Customer(FOURTH_ID, ANA, LIMA);
        List<Customer> customers = new ArrayList<>(List.of(lima, noCity, bogota, limaTieBreak));

        customers.sort(Customer.BY_CITY_NULLS_LAST_THEN_NAME);

        assertThat(customers).containsExactly(bogota, limaTieBreak, lima, noCity);
    }

    @Test
    @DisplayName("M02 §4 · a comparator that never returns 0 makes List.sort throw")
    void sort_throwsIllegalArgument_whenComparatorNeverReturnsZero() {
        Comparator<Integer> neverZero = (x, y) -> x < y ? -1 : 1;
        Random random = new Random(RANDOM_SEED);
        List<Integer> values = new ArrayList<>();
        for (int i = 0; i < LIST_SIZE; i++) {
            values.add(random.nextInt(RANDOM_BOUND));
        }

        assertThatThrownBy(() -> values.sort(neverZero))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage(CONTRACT_MESSAGE);
    }
}
