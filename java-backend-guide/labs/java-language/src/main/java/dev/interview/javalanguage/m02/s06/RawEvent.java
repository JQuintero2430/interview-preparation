package dev.interview.javalanguage.m02.s06;

/** Module 02 §6: the trap: the generated equals compares the array by reference, so equal contents are not equal. */
public record RawEvent(String id, byte[] payload) {}
