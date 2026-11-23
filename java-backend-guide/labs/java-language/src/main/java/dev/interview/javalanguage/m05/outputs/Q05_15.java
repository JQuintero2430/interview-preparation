package dev.interview.javalanguage.m05.outputs;

import dev.interview.javalanguage.m05.s05.Employee;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

// Module 05 Q05.15: a filtering downstream keeps empty groups, a filter before groupingBy drops them.
public final class Q05_15 {

    private Q05_15() {}

    // Every team appears, with 0 where nobody earns at least the threshold.
    public static Map<String, Long> highEarnersPerTeam(List<Employee> staff, int threshold) {
        return staff.stream()
                .collect(Collectors.groupingBy(
                        Employee::team,
                        TreeMap::new,
                        Collectors.filtering(e -> e.salary() >= threshold, Collectors.counting())));
    }

    // Teams with no high earner disappear, because their employees never reach groupingBy.
    public static Map<String, Long> highEarnersPerTeamFilteredFirst(List<Employee> staff, int threshold) {
        return staff.stream()
                .filter(e -> e.salary() >= threshold)
                .collect(Collectors.groupingBy(Employee::team, TreeMap::new, Collectors.counting()));
    }

    // Two levels: team, then whether the salary reaches the threshold, then the names.
    public static Map<String, Map<Boolean, List<String>>> namesByTeamAndBand(List<Employee> staff, int threshold) {
        return staff.stream()
                .collect(Collectors.groupingBy(
                        Employee::team,
                        TreeMap::new,
                        Collectors.partitioningBy(
                                e -> e.salary() >= threshold,
                                Collectors.mapping(Employee::name, Collectors.toList()))));
    }
}
