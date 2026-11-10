package dev.interview.javalanguage.m02.s02;

import java.util.Objects;

// Module 02 §2: a mutable key, the defect on purpose. equals and hashCode read code, and setCode changes it.
public final class Sku {

    private String code;

    public Sku(String code) {
        this.code = code;
    }

    public String code() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof Sku that)) {
            return false;
        }
        return Objects.equals(code, that.code);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(code);
    }
}
