package dev.interview.javalanguage.m06.ex3;

import java.io.ObjectInputFilter;
import java.util.Optional;

// Decorator: delegates every check and remembers the first rejection, so the codec can tell
// "the filter said no" apart from the other InvalidClassExceptions. One instance per stream.
final class RecordingFilter implements ObjectInputFilter {

    private final ObjectInputFilter delegate;
    private String firstRejection;

    RecordingFilter(ObjectInputFilter delegate) {
        this.delegate = delegate;
    }

    @Override
    public Status checkInput(FilterInfo info) {
        Status status = delegate.checkInput(info);
        if (status == Status.REJECTED && firstRejection == null) {
            firstRejection = describe(info);
        }
        return status;
    }

    Optional<String> firstRejection() {
        return Optional.ofNullable(firstRejection);
    }

    private static String describe(FilterInfo info) {
        Class<?> type = info.serialClass();
        return "class=" + (type == null ? "none" : type.getName())
                + " arrayLength=" + info.arrayLength()
                + " depth=" + info.depth()
                + " refs=" + info.references()
                + " bytes=" + info.streamBytes();
    }
}
