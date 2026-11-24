package dev.interview.javalanguage.m06.s03;

import java.io.IOException;
import java.io.InputStream;

@FunctionalInterface
public interface StreamOpener {

    InputStream open() throws IOException;
}
