package dev.interview.javalanguage.m06.s03;

import java.io.IOException;

@FunctionalInterface
public interface ChannelFactory {

    ExportChannel open(String batchId) throws IOException;
}
