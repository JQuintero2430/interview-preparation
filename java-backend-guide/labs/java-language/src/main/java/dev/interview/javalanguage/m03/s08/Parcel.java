package dev.interview.javalanguage.m03.s08;

import java.time.LocalDate;

// Module 03 §8: a value whose sort key, LocalDate, is Comparable<ChronoLocalDate> rather than Comparable<LocalDate>.
public record Parcel(String id, LocalDate shippedOn) {}
