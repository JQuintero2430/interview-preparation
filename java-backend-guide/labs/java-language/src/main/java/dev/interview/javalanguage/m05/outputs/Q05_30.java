package dev.interview.javalanguage.m05.outputs;

import java.util.Map;
import java.util.Optional;

// Module 05 Q05.30: get() on an empty Optional fails with a message that names nothing.
public final class Q05_30 {

    static final int FREE_TIER_SEATS = 1;

    private final Map<String, Plan> plans;

    public Q05_30(Map<String, Plan> plans) {
        this.plans = Map.copyOf(plans);
    }

    public record Plan(String tenant, int seats) {}

    // The exception a caller can act on: it says which tenant has no plan.
    public static final class PlanNotFoundException extends RuntimeException {

        PlanNotFoundException(String tenant) {
            super("no billing plan for tenant " + tenant);
        }
    }

    public Optional<Plan> findPlan(String tenant) {
        return Optional.ofNullable(plans.get(tenant));
    }

    // Bug: get() assumes every tenant has a plan; a new tenant fails with "No value present".
    public int seatsBuggy(String tenant) {
        return findPlan(tenant).get().seats();
    }

    // Fix where absence is an error: throw an exception that names what is missing.
    public int seats(String tenant) {
        return findPlan(tenant).map(Plan::seats).orElseThrow(() -> new PlanNotFoundException(tenant));
    }

    // Fix where absence has a business meaning: decide it explicitly at the call site.
    public int seatsOrFreeTier(String tenant) {
        return findPlan(tenant).map(Plan::seats).orElse(FREE_TIER_SEATS);
    }
}
