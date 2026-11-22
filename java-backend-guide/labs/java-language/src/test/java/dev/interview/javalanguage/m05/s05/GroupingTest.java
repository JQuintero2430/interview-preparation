package dev.interview.javalanguage.m05.s05;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class GroupingTest {

    private static final List<Employee> STAFF = List.of(
            new Employee("ann", "search", 90),
            new Employee("bob", "payments", 80),
            new Employee("cid", "search", 70),
            new Employee("dee", "payments", 95),
            new Employee("eve", "infra", 60));

    @Test
    @DisplayName("M05 §5 · groupingBy with a TreeMap factory and counting")
    void groupingBy_withTreeMapAndCounting_sortsTeamsAndCounts() {
        var headcount = Directory.headcountByTeam(STAFF);

        assertThat(headcount).isInstanceOf(TreeMap.class);
        assertThat(headcount)
                .containsExactly(Map.entry("infra", 1L), Map.entry("payments", 2L), Map.entry("search", 2L));
    }

    @Test
    @DisplayName("M05 §5 · groupingBy with mapping keeps only the mapped values")
    void groupingBy_withMapping_collectsNames() {
        var names = Directory.namesByTeam(STAFF);

        assertThat(names)
                .containsOnly(
                        Map.entry("search", List.of("ann", "cid")),
                        Map.entry("payments", List.of("bob", "dee")),
                        Map.entry("infra", List.of("eve")));
    }

    @Test
    @DisplayName("M05 §5 · maxBy as a downstream collector yields an Optional per group")
    void maxBy_downstream_yieldsOptional_andCollectingAndThenUnwrapsIt() {
        Map<String, Optional<Employee>> wrapped = STAFF.stream()
                .collect(Collectors.groupingBy(
                        Employee::team, Collectors.maxBy(Comparator.comparingInt(Employee::salary))));
        var unwrapped = Directory.topEarnerByTeam(STAFF);

        assertThat(wrapped.get("search")).map(Employee::name).contains("ann");
        assertThat(unwrapped)
                .containsOnly(Map.entry("search", "ann"), Map.entry("payments", "dee"), Map.entry("infra", "eve"));
    }

    @Test
    @DisplayName("M05 §5 · groupingBy without a map factory returns a HashMap in JDK 25")
    void groupingBy_default_isHashMapInThisJdk() {
        var groups = STAFF.stream().collect(Collectors.groupingBy(Employee::team));

        assertThat(groups).isInstanceOf(HashMap.class);
        assertThat(groups.get("search")).extracting(Employee::name).containsExactly("ann", "cid");
    }

    @Test
    @DisplayName("M05 §5 · groupingBy rejects a null key")
    void groupingBy_rejectsNullKey() {
        var staff = List.of(new Employee("ann", null, 90));

        assertThatNullPointerException()
                .isThrownBy(() -> Directory.headcountByTeam(staff))
                .withMessage("element cannot be mapped to a null key");
    }
}
