package dev.interview.javalanguage.m06.s01;

import java.io.IOException;
import java.lang.System.Logger.Level;
import java.util.Objects;

// The caller that can recover: it handles the checked failure and lets every bug propagate.
public final class RateCards {

    private static final System.Logger LOG = System.getLogger(RateCards.class.getName());

    private final RateCardLoader loader;
    private final RateCard lastKnownGood;

    public RateCards(RateCardLoader loader, RateCard lastKnownGood) {
        this.loader = Objects.requireNonNull(loader, "loader");
        this.lastKnownGood = Objects.requireNonNull(lastKnownGood, "lastKnownGood");
    }

    public RateCard current(String name) {
        try {
            return loader.load(name);
        } catch (IOException e) {
            LOG.log(Level.WARNING, "rate card " + name + " unreadable, using last known good", e);
            return lastKnownGood;
        }
    }
}
