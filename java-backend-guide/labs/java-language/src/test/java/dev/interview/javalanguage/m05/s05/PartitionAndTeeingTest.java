package dev.interview.javalanguage.m05.s05;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PartitionAndTeeingTest {

    @Test
    @DisplayName("M05 §5 · partitioningBy returns both keys for an empty stream")
    void partitioningBy_onEmptyStream_hasBothKeys() {
        Map<Boolean, List<Employee>> lists =
                Stream.<Employee>empty().collect(Collectors.partitioningBy(e -> e.salary() >= 80));
        Map<Boolean, Long> counts = Directory.countAtOrAbove(80, List.of());

        assertThat(lists).containsOnly(Map.entry(false, List.of()), Map.entry(true, List.of()));
        assertThat(counts).containsOnly(Map.entry(false, 0L), Map.entry(true, 0L));
    }

    @Test
    @DisplayName("M05 §5 · groupingBy on an empty stream returns an empty map")
    void groupingBy_onEmptyStream_hasNoKeys() {
        var groups = Stream.<Employee>empty().collect(Collectors.groupingBy(e -> e.salary() >= 80));

        assertThat(groups).isEmpty();
    }

    @Test
    @DisplayName("M05 §5 · teeing combines a count and a sum")
    void teeing_combinesCountAndSum() {
        var staff = List.of(new Employee("ann", "search", 90), new Employee("bob", "payments", 80));

        var payroll = Directory.payroll(staff);

        assertThat(payroll).isEqualTo(new Payroll(2, 170));
    }
}
