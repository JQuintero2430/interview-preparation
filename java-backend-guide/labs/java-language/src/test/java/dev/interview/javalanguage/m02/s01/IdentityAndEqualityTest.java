package dev.interview.javalanguage.m02.s01;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 02 §1: identity vs equality, the equals contract, and the equals overload trap.
class IdentityAndEqualityTest {

    private static final String ABC = "abc";

    record R(int a) {}

    @Test
    @DisplayName("M02 §1 · Object.equals is identity until a class overrides it")
    void objectEquals_isIdentity_untilOverridden() {
        Object first = new Object();
        Object second = new Object();
        Point left = new Point(1, 2);
        Point right = new Point(1, 2);

        assertThat(first.equals(second)).isFalse();
        assertThat(first.equals(first)).isTrue();
        assertThat(left == right).isFalse();
        assertThat(left.equals(right)).isTrue();
    }

    @Test
    @DisplayName("M02 §1 · arrays compare by identity, Arrays.equals by content")
    void arrays_compareByIdentity_whileArraysEqualsComparesContent() {
        int[] first = {1, 2};
        int[] second = {1, 2};
        Object[] nestedFirst = {new int[] {1, 2}};
        Object[] nestedSecond = {new int[] {1, 2}};

        assertThat(first.equals(second)).isFalse();
        assertThat(Arrays.equals(first, second)).isTrue();
        assertThat(Arrays.equals(nestedFirst, nestedSecond)).isFalse();
        assertThat(Arrays.deepEquals(nestedFirst, nestedSecond)).isTrue();
    }

    @Test
    @DisplayName("M02 §1 · StringBuilder compares by identity, its content by compareTo")
    void stringBuilder_comparesByIdentity_whileContentComparesByCompareTo() {
        StringBuilder first = new StringBuilder(ABC);
        StringBuilder second = new StringBuilder(ABC);

        assertThat(first.equals(second)).isFalse();
        assertThat(first.compareTo(second)).isZero();
        assertThat(ABC.contentEquals(first)).isTrue();
    }

    @Test
    @DisplayName("M02 §1 · String, wrappers, lists and records compare by content")
    void jdkValueTypes_compareByContent() {
        String literal = ABC;
        String copy = new String(ABC);

        assertThat(copy == literal).isFalse();
        assertThat(copy.equals(literal)).isTrue();
        assertThat(Integer.valueOf(1000).equals(Integer.valueOf(1000))).isTrue();
        assertThat(List.of(1, 2).equals(new ArrayList<>(List.of(1, 2)))).isTrue();
        assertThat(new R(1).equals(new R(1))).isTrue();
    }

    @Test
    @DisplayName("M02 §1 · Point satisfies the equals contract over a sample")
    void pointEquals_satisfiesContract_overSample() {
        List<Point> sample = List.of(
                new Point(0, 0),
                new Point(0, 0),
                new Point(1, 2),
                new Point(1, 2),
                new Point(2, 1),
                new Point(-1, Integer.MAX_VALUE));

        for (Point x : sample) {
            assertThat(x.equals(x)).isTrue();
            assertThat(x.equals(null)).isFalse();
            for (Point y : sample) {
                boolean xy = x.equals(y);
                assertThat(y.equals(x)).isEqualTo(xy);
                assertThat(x.equals(y)).isEqualTo(xy);
                for (Point z : sample) {
                    if (x.equals(y) && y.equals(z)) {
                        assertThat(x.equals(z)).isTrue();
                    }
                }
            }
        }
    }

    @Test
    @DisplayName("M02 §1 · equals(Point) is an overload and collections ignore it")
    void overloadedEquals_isIgnoredByCollections_whilePointEqualsIsHonored() {
        OverloadedPoint overloadedA = new OverloadedPoint(1, 2);
        OverloadedPoint overloadedB = new OverloadedPoint(1, 2);
        Point pointA = new Point(1, 2);
        Point pointB = new Point(1, 2);

        assertThat(overloadedA.equals(overloadedB)).isTrue();
        assertThat(overloadedA.equals((Object) overloadedB)).isFalse();
        assertThat(List.of(overloadedA).contains(overloadedB)).isFalse();
        assertThat(new HashSet<>(Set.of(overloadedA)).contains(overloadedB)).isFalse();
        assertThat(overloadedA.hashCode() == overloadedB.hashCode()).isTrue();
        assertThat(pointA.equals(pointB)).isTrue();
        assertThat(pointA.equals((Object) pointB)).isTrue();
        assertThat(List.of(pointA).contains(pointB)).isTrue();
        assertThat(new HashSet<>(Set.of(pointA)).contains(pointB)).isTrue();
        assertThat(pointA.hashCode() == pointB.hashCode()).isTrue();
    }

    @Test
    @DisplayName("M02 §1 · Objects.equals is null-safe")
    void objectsEquals_isNullSafe() {
        assertThat(Objects.equals(null, null)).isTrue();
        assertThat(Objects.equals(null, new Point(0, 0))).isFalse();
        assertThat(Objects.equals(new Point(0, 0), null)).isFalse();
        assertThat(Objects.equals(new Point(1, 1), new Point(1, 1))).isTrue();
    }
}
