package dev.interview.javalanguage.m06.ex3;

import java.io.IOException;
import java.io.InvalidObjectException;
import java.io.ObjectInputStream;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

// A legacy cache entry. Its serialized form is userId, roles (always an ArrayList) and expiresAt.
public final class Session implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    public static final int MAX_ROLES = 64;
    private static final String ADMIN = "admin";

    private final String userId;
    private final List<String> roles;
    private final Instant expiresAt;

    // Derived from roles, so it is not written; readObject rebuilds it.
    private transient boolean admin;

    public Session(String userId, List<String> roles, Instant expiresAt) {
        if (roles.size() > MAX_ROLES) {
            throw new IllegalArgumentException("at most " + MAX_ROLES + " roles, got " + roles.size());
        }
        this.userId = userId;
        this.roles = new ArrayList<>(roles); // the one List class the codec's allow-list names
        this.expiresAt = expiresAt;
        requireValid();
        this.admin = this.roles.contains(ADMIN);
    }

    // No constructor of this class runs on read: check what the stream put in the fields, then derive.
    @Serial
    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        try {
            requireValid();
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidObjectException(e.getMessage(), e);
        }
        admin = roles.contains(ADMIN);
    }

    private void requireValid() {
        if (Objects.requireNonNull(userId, "userId").isBlank()) {
            throw new IllegalArgumentException("blank userId");
        }
        Objects.requireNonNull(expiresAt, "expiresAt");
        // Generics are erased: the stream can put any class the filter allows into a List<String>.
        for (Object role : Objects.requireNonNull(roles, "roles")) {
            if (!(role instanceof String)) {
                throw new IllegalArgumentException("role is not a String: " + describe(role));
            }
        }
    }

    private static String describe(Object role) {
        return role == null ? "null" : role.getClass().getName();
    }

    public String userId() {
        return userId;
    }

    public List<String> roles() {
        return Collections.unmodifiableList(roles);
    }

    public Instant expiresAt() {
        return expiresAt;
    }

    public boolean isAdmin() {
        return admin;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof Session other
                && userId.equals(other.userId)
                && roles.equals(other.roles)
                && expiresAt.equals(other.expiresAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, roles, expiresAt);
    }

    @Override
    public String toString() {
        return "Session[userId=" + userId + ", roles=" + roles + ", expiresAt=" + expiresAt + "]";
    }
}
