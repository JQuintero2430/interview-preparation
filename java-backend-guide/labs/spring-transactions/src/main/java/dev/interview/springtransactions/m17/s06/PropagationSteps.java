package dev.interview.springtransactions.m17.s06;

import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public class PropagationSteps {

    private static final String INNER_STEP_FAILED = "inner step failed";

    @Transactional(propagation = Propagation.REQUIRED)
    public void required() {}

    @Transactional(propagation = Propagation.SUPPORTS)
    public void supports() {}

    @Transactional(propagation = Propagation.MANDATORY)
    public void mandatory() {}

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void requiresNew() {}

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void notSupported() {}

    @Transactional(propagation = Propagation.NEVER)
    public void never() {}

    @Transactional(propagation = Propagation.NESTED)
    public void nested() {}

    @Transactional(propagation = Propagation.NESTED)
    public void nestedFailing() {
        throw new IllegalStateException(INNER_STEP_FAILED);
    }
}
