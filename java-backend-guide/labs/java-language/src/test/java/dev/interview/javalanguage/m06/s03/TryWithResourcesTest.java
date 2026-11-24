package dev.interview.javalanguage.m06.s03;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TryWithResourcesTest {

    private final List<String> events = new ArrayList<>();

    @Test
    @DisplayName("M06 §3 · resources close in reverse order of declaration")
    void resources_closeInReverseOrder() {
        TwrFlow.twoResources(events);

        assertThat(events).containsExactly("open A", "open B", "body", "close B", "close A");
    }

    @Test
    @DisplayName("M06 §3 · a close failure is suppressed behind the body's exception")
    void closeFailure_isSuppressed_behindBodyException() {
        Throwable thrown = catchThrowable(() -> TwrFlow.bodyAndCloseFail(events));

        assertThat(thrown).isInstanceOf(IllegalArgumentException.class).hasMessage("body failed");
        assertThat(thrown.getSuppressed())
                .singleElement()
                .isInstanceOf(IllegalStateException.class)
                .hasFieldOrPropertyWithValue("message", "close B failed");
        assertThat(events).containsExactly("open A", "open B", "body", "close B", "close A");
    }

    @Test
    @DisplayName("M06 §3 · a close failure after a normal body is thrown")
    void closeFailure_afterNormalBody_isThrown() {
        Throwable thrown = catchThrowable(() -> TwrFlow.onlyCloseFails(events));

        assertThat(thrown).isInstanceOf(IllegalStateException.class).hasMessage("close A failed");
        assertThat(thrown.getSuppressed()).isEmpty();
    }

    @Test
    @DisplayName("M06 §3 · two close failures after a normal body: the rightmost resource's is thrown")
    void twoCloseFailures_rightmostIsThrown_leftmostSuppressed() {
        Throwable thrown = catchThrowable(() -> TwrFlow.bothClosesFail(events));

        assertThat(thrown).hasMessage("close B failed");
        assertThat(thrown.getSuppressed()).singleElement().hasFieldOrPropertyWithValue("message", "close A failed");
        assertThat(events).containsExactly("open A", "open B", "body", "close B", "close A");
    }

    @Test
    @DisplayName("M06 §3 · when a later resource fails to open, the earlier ones are closed and the body never runs")
    void failedOpen_closesEarlierResources() {
        Throwable thrown = catchThrowable(() -> TwrFlow.secondOpenFails(events));

        assertThat(thrown).hasMessage("open B failed");
        assertThat(events).containsExactly("open A", "open B failed", "close A");
    }

    @Test
    @DisplayName("M06 §3 · resources are closed before the catch block runs, and finally runs last")
    void resources_closeBeforeCatch_andFinallyRunsLast() {
        TwrFlow.catchAndFinally(events);

        assertThat(events)
                .containsExactly("open A", "open B", "body", "close B", "close A", "catch body failed", "finally");
    }

    @Test
    @DisplayName("M06 §3 · a null resource is skipped, not closed")
    void nullResource_isSkipped() {
        TwrFlow.nullResource(events);

        assertThat(events).containsExactly("body with null");
    }

    @Test
    @DisplayName("M06 §3 · an effectively final variable can be the resource (Java 9)")
    void effectivelyFinalVariable_isClosed() {
        TwrFlow.existingVariable(events);

        assertThat(events).containsExactly("open shared", "body", "close shared");
    }
}
