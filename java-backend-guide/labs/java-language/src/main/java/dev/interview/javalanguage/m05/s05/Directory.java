package dev.interview.javalanguage.m05.s05;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

// The everyday collectors, one query per method, over a list of employees.
public final class Directory {

    private Directory() {}

    // Throws IllegalStateException on a duplicate name and NullPointerException on a null team.
    public static Map<String, String> teamByName(List<Employee> staff) {
        return staff.stream().collect(Collectors.toMap(Employee::name, Employee::team));
    }

    // Keeps the first team seen for each name, in encounter order.
    public static Map<String, String> firstTeamByName(List<Employee> staff) {
        return staff.stream()
                .collect(
                        Collectors.toMap(Employee::name, Employee::team, (first, second) -> first, LinkedHashMap::new));
    }

    // Teams in name order, each with its headcount.
    public static Map<String, Long> headcountByTeam(List<Employee> staff) {
        return staff.stream().collect(Collectors.groupingBy(Employee::team, TreeMap::new, Collectors.counting()));
    }

    // Each team with the names of its members, in encounter order.
    public static Map<String, List<String>> namesByTeam(List<Employee> staff) {
        return staff.stream()
                .collect(
                        Collectors.groupingBy(Employee::team, Collectors.mapping(Employee::name, Collectors.toList())));
    }

    // maxBy yields an Optional per group; collectingAndThen unwraps it, safe because a group is never empty.
    public static Map<String, String> topEarnerByTeam(List<Employee> staff) {
        return staff.stream()
                .collect(Collectors.groupingBy(
                        Employee::team,
                        Collectors.collectingAndThen(
                                Collectors.maxBy(Comparator.comparingInt(Employee::salary)),
                                top -> top.orElseThrow().name())));
    }

    // Always has both keys, true and false, even for an empty list.
    public static Map<Boolean, Long> countAtOrAbove(int threshold, List<Employee> staff) {
        return staff.stream().collect(Collectors.partitioningBy(e -> e.salary() >= threshold, Collectors.counting()));
    }

    // One pass, two collectors: teeing feeds every element to both and merges their results.
    public static Payroll payroll(List<Employee> staff) {
        return staff.stream()
                .collect(Collectors.teeing(
                        Collectors.counting(), Collectors.summingLong(Employee::salary), Payroll::new));
    }
}
