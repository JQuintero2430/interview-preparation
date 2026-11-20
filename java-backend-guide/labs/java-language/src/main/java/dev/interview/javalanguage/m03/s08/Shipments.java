package dev.interview.javalanguage.m03.s08;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;

// Module 03 §8: one call per JDK signature read in the section. Each compiles only because of a wildcard or bound.
public final class Shipments {

    // ? super K accepts a function over a supertype of the key; ? extends V accepts a subtype of the value.
    private static final Function<CharSequence, ArrayList<String>> NEW_BUCKET = key -> new ArrayList<>();

    private Shipments() {}

    // <T extends Object & Comparable<? super T>>: LocalDate is Comparable<ChronoLocalDate>, a supertype's comparison.
    public static LocalDate latestShipDate(Collection<LocalDate> dates) {
        return Collections.max(dates);
    }

    // A Collector<Object, ?, String> fits Stream<T>.collect(Collector<? super T, A, R>) for every T.
    public static Collector<Object, ?, String> describingAnything() {
        return Collectors.mapping(String::valueOf, Collectors.joining(", "));
    }

    public static void index(Map<String, List<String>> byPrefix, String prefix, String value) {
        byPrefix.computeIfAbsent(prefix, NEW_BUCKET).add(value);
    }

    // <T, U extends Comparable<? super U>>: U is LocalDate here.
    public static List<Parcel> byShipDate(List<Parcel> parcels) {
        return parcels.stream().sorted(Comparator.comparing(Parcel::shippedOn)).toList();
    }
}
