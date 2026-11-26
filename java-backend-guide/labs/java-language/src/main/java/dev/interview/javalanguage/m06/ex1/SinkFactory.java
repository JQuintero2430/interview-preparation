package dev.interview.javalanguage.m06.ex1;

import java.io.IOException;

@FunctionalInterface
public interface SinkFactory {

    Sink open(String batchId, BatchPart part) throws IOException;
}
