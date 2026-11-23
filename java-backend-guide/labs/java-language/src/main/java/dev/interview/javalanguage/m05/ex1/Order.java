package dev.interview.javalanguage.m05.ex1;

// Module 05 Ex05.1: one order line. Amounts are whole cents in a long, so sums are exact.
public record Order(String customer, String category, long amountCents) {}
