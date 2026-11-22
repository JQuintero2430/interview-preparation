package dev.interview.javalanguage.m05.s05;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalStateException;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ToMapTest {

    private static final Employee ANN_PAYMENTS = new Employee("ann", "payments", 90);
    private static final Employee BOB_SEARCH = new Employee("bob", "search", 80);
    private static final Employee ANN_SEARCH = new Employee("ann", "search", 70);

    @Test
    @DisplayName("M05 §5 · toMap throws IllegalStateException on a duplicate key")
    void toMap_throwsIllegalStateException_onDuplicateKey() {
        var staff = List.of(ANN_PAYMENTS, BOB_SEARCH, ANN_SEARCH);

        assertThatIllegalStateException()
                .isThrownBy(() -> Directory.teamByName(staff))
                .withMessage("Duplicate key ann (attempted merging values payments and search)");
    }

    @Test
    @DisplayName("M05 §5 · toMap throws NullPointerException on a null value")
    void toMap_throwsNullPointerException_onNullValue() {
        var staff = List.of(ANN_PAYMENTS, new Employee("cid", null, 60));

        assertThatNullPointerException().isThrownBy(() -> Directory.teamByName(staff));
    }

    @Test
    @DisplayName("M05 §5 · toMap with a merge function also rejects a null value")
    void toMapWithMerge_throwsNullPointerException_onNullValue() {
        var staff = List.of(ANN_PAYMENTS, new Employee("cid", null, 60));

        assertThatNullPointerException().isThrownBy(() -> Directory.firstTeamByName(staff));
    }

    @Test
    @DisplayName("M05 §5 · toMap accepts a null key")
    void toMap_acceptsNullKey() {
        var staff = List.of(new Employee(null, "payments", 90));

        var teams = staff.stream().collect(Collectors.toMap(Employee::name, Employee::team));

        assertThat(teams).containsEntry(null, "payments");
    }

    @Test
    @DisplayName("M05 §5 · a merge function resolves duplicate keys")
    void mergeFunction_resolvesDuplicateKeys() {
        var staff = List.of(ANN_PAYMENTS, BOB_SEARCH, ANN_SEARCH);

        var firstTeam = Directory.firstTeamByName(staff);

        assertThat(firstTeam).isInstanceOf(LinkedHashMap.class);
        assertThat(firstTeam).containsExactly(Map.entry("ann", "payments"), Map.entry("bob", "search"));
    }
}
