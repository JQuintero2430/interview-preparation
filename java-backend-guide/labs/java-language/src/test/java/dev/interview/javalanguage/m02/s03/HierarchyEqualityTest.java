package dev.interview.javalanguage.m02.s03;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Pins module 02 §3: equals across a class hierarchy and the composition fix.
class HierarchyEqualityTest {

    private static final int X = 1;
    private static final int Y = 2;
    private static final int OTHER_X = 3;
    private static final int OTHER_Y = 4;
    private static final long MILLIS = 1_000L;

    @Test
    @DisplayName("M02 §3 · instanceof equals in a subclass with an extra field is asymmetric")
    void equals_isAsymmetric_whenSubclassAddsFieldWithInstanceofCheck() {
        Point point = new Point(X, Y);
        ColorPoint colorPoint = new ColorPoint(X, Y, Color.RED);
        List<Point> holdingColorPoint = new ArrayList<>();
        holdingColorPoint.add(colorPoint);
        List<Point> holdingPoint = new ArrayList<>();
        holdingPoint.add(point);

        assertThat(point.equals(colorPoint)).isTrue();
        assertThat(colorPoint.equals(point)).isFalse();
        assertThat(holdingColorPoint.contains(point)).isTrue();
        assertThat(holdingPoint.contains(colorPoint)).isFalse();
    }

    @Test
    @DisplayName("M02 §3 · the symmetric patch is not transitive")
    void equals_isNotTransitive_whenSymmetricPatchIsApplied() {
        SymmetricColorPoint red = new SymmetricColorPoint(X, Y, Color.RED);
        Point point = new Point(X, Y);
        SymmetricColorPoint blue = new SymmetricColorPoint(X, Y, Color.BLUE);

        assertThat(red.equals(point)).isTrue();
        assertThat(point.equals(red)).isTrue();
        assertThat(point.equals(blue)).isTrue();
        assertThat(blue.equals(point)).isTrue();
        assertThat(red.equals(blue)).isFalse();
        assertThat(red.hashCode()).isEqualTo(point.hashCode()).isEqualTo(blue.hashCode());
    }

    @Test
    @DisplayName("M02 §3 · getClass equals rejects a subclass with no extra state")
    void equals_rejectsSubclass_whenGetClassIsUsed() {
        GetClassPoint point = new GetClassPoint(X, Y);
        GetClassPoint sameClass = new GetClassPoint(X, Y);
        GetClassPoint anonymousSubclass = new GetClassPoint(X, Y) {};
        Point plain = new Point(X, Y);
        Point plainAnonymousSubclass = new Point(X, Y) {};

        assertThat(point.equals(sameClass)).isTrue();
        assertThat(point.equals(anonymousSubclass)).isFalse();
        assertThat(anonymousSubclass.equals(point)).isFalse();
        assertThat(plain.equals(plainAnonymousSubclass)).isTrue();
        assertThat(plainAnonymousSubclass.equals(plain)).isTrue();
    }

    @Test
    @DisplayName("M02 §3 · composition keeps all three clauses")
    void equals_keepsAllClauses_whenCompositionIsUsed() {
        List<Object> samples = List.of(
                new Point(X, Y),
                new Point(X, Y),
                new ColoredPoint(new Point(X, Y), Color.RED),
                new ColoredPoint(new Point(X, Y), Color.RED),
                new ColoredPoint(new Point(X, Y), Color.BLUE),
                new Point(OTHER_X, OTHER_Y));

        for (Object a : samples) {
            assertThat(a.equals(a)).isTrue();
            assertPairClauses(a, samples);
        }
    }

    @Test
    @DisplayName("M02 §3 · java.sql.Timestamp equals is not symmetric with java.util.Date")
    void equals_isAsymmetric_whenDateIsComparedWithTimestamp() {
        Date date = new Date(MILLIS);
        Timestamp timestamp = new Timestamp(MILLIS);

        assertThat(date.equals(timestamp)).isTrue();
        assertThat(timestamp.equals(date)).isFalse();
    }

    private static void assertPairClauses(Object a, List<Object> samples) {
        for (Object b : samples) {
            assertThat(a.equals(b)).isEqualTo(b.equals(a));
            if (a.equals(b)) {
                assertThat(a.hashCode()).isEqualTo(b.hashCode());
            }
            assertTransitive(a, b, samples);
        }
    }

    private static void assertTransitive(Object a, Object b, List<Object> samples) {
        if (!a.equals(b)) {
            return;
        }
        for (Object c : samples) {
            if (b.equals(c)) {
                assertThat(a.equals(c)).isTrue();
            }
        }
    }
}
