package dev.interview.javalanguage.m02.s05;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Module 02 §5: immutability leaks and their fix, pinned as executable facts. */
class ImmutabilityTest {

    private static final String ANA = "Ana";
    private static final String LUIS = "Luis";
    private static final String EMPTY_MESSAGE = "a roster needs at least one member";

    @Test
    @DisplayName("M02 §5 · unmodifiable view reflects later source changes, List.copyOf does not")
    void unmodifiableList_reflectsSourceChange_whenCopyOfDoesNot() {
        List<String> source = new ArrayList<>(List.of(ANA));
        List<String> view = Collections.unmodifiableList(source);
        List<String> copy = List.copyOf(source);

        source.add(LUIS);

        assertThat(view).containsExactly(ANA, LUIS);
        assertThat(copy).containsExactly(ANA);
        assertThatThrownBy(() -> view.add(LUIS)).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M02 §5 · a constructor that does not copy leaks the caller's list")
    void members_seesCallerChange_whenConstructorDoesNotCopy() {
        List<String> callerList = new ArrayList<>(List.of(ANA));
        LeakyRoster roster = new LeakyRoster(callerList);

        callerList.add(LUIS);

        assertThat(roster.members()).containsExactly(ANA, LUIS);
    }

    @Test
    @DisplayName("M02 §5 · getter returning the internal list lets callers mutate")
    void members_changesRoster_whenGetterReturnsInternalList() {
        LeakyRoster roster = new LeakyRoster(new ArrayList<>(List.of(ANA)));

        roster.members().add(LUIS);

        assertThat(roster.members()).containsExactly(ANA, LUIS);
    }

    @Test
    @DisplayName("M02 §5 · Roster copies in and returns an unmodifiable list")
    void members_isIsolated_whenRosterCopiesIn() {
        List<String> callerList = new ArrayList<>(List.of(ANA));
        Roster roster = new Roster(callerList);

        callerList.add(LUIS);

        assertThat(roster.members()).containsExactly(ANA);
        assertThatThrownBy(() -> roster.members().add(LUIS)).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M02 §5 · Roster validates the copy, so an empty list is rejected")
    void constructor_throwsIllegalArgument_whenListIsEmpty() {
        List<String> empty = new ArrayList<>();

        assertThatThrownBy(() -> new Roster(empty))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage(EMPTY_MESSAGE);
    }

    @Test
    @DisplayName("M02 §5 · List.copyOf returns a List.of list itself on JDK 25")
    void copyOf_returnsSameInstance_whenArgumentIsListOf() {
        List<String> immutable = List.of(ANA, LUIS);
        List<String> mutable = new ArrayList<>(immutable);

        assertThat(List.copyOf(immutable)).isSameAs(immutable);
        assertThat(List.copyOf(mutable)).isNotSameAs(mutable);
    }
}
