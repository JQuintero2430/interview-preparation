package dev.interview.javalanguage.m01.s07;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins the Object.clone behaviour module 01 §7 states: a shallow copy, and only for Cloneable classes.
class CloneTest {

    static final class Box implements Cloneable {
        int[] items = {1, 2, 3};

        @Override
        public Box clone() {
            try {
                return (Box) super.clone();
            } catch (CloneNotSupportedException e) {
                throw new AssertionError(e);
            }
        }
    }

    static final class Plain {
        Object copy() throws CloneNotSupportedException {
            return super.clone();
        }
    }

    @Test
    @DisplayName("M01 §7 · Object.clone copies fields shallowly")
    void clone_sharesMutableFields_withTheOriginal() {
        var original = new Box();

        var copy = original.clone();
        copy.items[0] = 99;

        assertThat(copy).isNotSameAs(original);
        assertThat(copy.items).isSameAs(original.items);
        assertThat(original.items[0]).isEqualTo(99);
    }

    @Test
    @DisplayName("M01 §7 · clone without Cloneable throws CloneNotSupportedException")
    void clone_throws_whenTheClassIsNotCloneable() {
        assertThatThrownBy(() -> new Plain().copy()).isInstanceOf(CloneNotSupportedException.class);
    }
}
