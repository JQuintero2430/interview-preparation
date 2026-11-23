package dev.interview.javalanguage.m05.s09;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.stream.IntStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;

// Which failing element surfaces, and on which thread it failed, are not specified: assert the permitted set.
class ParallelExceptionTest {

    @RepeatedTest(5)
    @DisplayName(
            "M05 §9 · a failure in a parallel stream reaches the caller as one thrown exception or a same-type copy caused by it")
    void parallelFailure_reachesCaller_asThrownExceptionOrSameTypeCopy() {
        Queue<IllegalStateException> thrown = new ConcurrentLinkedQueue<>();

        Throwable caught = catchThrowable(() -> IntStream.range(0, 10_000)
                .parallel()
                .map(i -> {
                    if (i % 1_000 == 999) {
                        IllegalStateException e = new IllegalStateException("bad element " + i);
                        thrown.add(e);
                        throw e;
                    }
                    return i;
                })
                .sum());

        assertThat(caught).isInstanceOf(IllegalStateException.class);
        Throwable original = thrown.contains(caught) ? caught : caught.getCause();
        assertThat(thrown).contains((IllegalStateException) original);
    }
}
