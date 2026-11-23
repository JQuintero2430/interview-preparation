package dev.interview.javalanguage.m05.s10;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CustomerServiceTest {

    private static final Customer ADA = new Customer("c1", "Ada", "c0");
    private static final Customer ALAN = new Customer("c0", "Alan", null);
    private static final Customer GRACE = new Customer("c9", "Grace", null);

    private final List<String> fallbackCalls = new ArrayList<>();
    private final CustomerService service = new CustomerService(
            id -> Optional.ofNullable(Map.of("c1", ADA, "c0", ALAN).get(id)), id -> {
                fallbackCalls.add(id);
                return Optional.ofNullable(Map.of("c9", GRACE).get(id));
            });

    @Test
    @DisplayName("M05 §10 · map and orElse turn a missing customer into a default name")
    void displayName_usesDefaultWhenAbsent() {
        assertThat(service.displayName("c1")).isEqualTo("Ada");
        assertThat(service.displayName("nope")).isEqualTo("guest");
    }

    @Test
    @DisplayName("M05 §10 · chained flatMap follows an optional reference to another lookup")
    void referrerOf_followsReferrerOrIsEmpty() {
        assertThat(service.referrerOf("c1")).contains(ALAN);
        assertThat(service.referrerOf("c0")).isEmpty();
        assertThat(service.referrerOf("nope")).isEmpty();
    }

    @Test
    @DisplayName("M05 §10 · or queries the fallback only when the primary finds nothing")
    void findAnywhere_queriesFallbackOnlyWhenNeeded() {
        assertThat(service.findAnywhere("c1")).contains(ADA);
        assertThat(service.findAnywhere("c9")).contains(GRACE);
        assertThat(fallbackCalls).containsExactly("c9");
    }

    @Test
    @DisplayName("M05 §10 · orElseThrow with a supplier names what was missing")
    void require_throwsDomainExceptionNamingTheId() {
        assertThat(service.require("c9")).isEqualTo(GRACE);
        assertThatThrownBy(() -> service.require("c404"))
                .isInstanceOf(CustomerNotFoundException.class)
                .hasMessage("No customer with id c404");
    }

    @Test
    @DisplayName("M05 §10 · flatMap(Optional::stream) drops the absent results")
    void namesOf_dropsMissingIds() {
        assertThat(service.namesOf(List.of("c1", "nope", "c0"))).containsExactly("Ada", "Alan");
    }
}
