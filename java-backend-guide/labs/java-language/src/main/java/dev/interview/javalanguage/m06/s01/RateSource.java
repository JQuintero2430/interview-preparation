package dev.interview.javalanguage.m06.s01;

import java.io.IOException;

// The port to wherever rate cards are stored; reading may fail for reasons outside the program.
@FunctionalInterface
public interface RateSource {

    String read(String name) throws IOException;
}
