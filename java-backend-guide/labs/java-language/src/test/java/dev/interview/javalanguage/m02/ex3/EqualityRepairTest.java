package dev.interview.javalanguage.m02.ex3;

import static org.assertj.core.api.Assertions.assertThat;

import dev.interview.javalanguage.m02.ex3.broken.ColorPoint;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The coordinates are the cases the exercise names, so they stay literal in each test.
class EqualityRepairTest {

    // Two equal points, a different one, two equal colored points and one that differs only in color.
    private static final List<Object> SAMPLE = List.of(
            new Point(1, 2),
            new Point(1, 2),
            new Point(3, 4),
            new ColoredPoint(new Point(1, 2), Color.RED),
            new ColoredPoint(new Point(1, 2), Color.RED),
            new ColoredPoint(new Point(1, 2), Color.BLUE));

    @Test
    @DisplayName("Ex02.3 · (1) starting code: a point equals a colored point, but not the other way round")
    void brokenEquals_isAsymmetric_betweenPointAndColorPoint() {
        var point = new dev.interview.javalanguage.m02.ex3.broken.Point(1, 2);
        var colorPoint = new ColorPoint(1, 2, Color.RED);

        assertThat(point.equals(colorPoint)).isTrue();
        assertThat(colorPoint.equals(point)).isFalse();
    }

    @Test
    @DisplayName("Ex02.3 · (1) equals is reflexive over the sample")
    void equals_isReflexive_overSample() {
        assertThat(SAMPLE).allSatisfy(a -> assertThat(a.equals(a)).isTrue());
    }

    @Test
    @DisplayName("Ex02.3 · (1) equals is symmetric over the sample")
    void equals_isSymmetric_overSample() {
        for (Object a : SAMPLE) {
            assertThat(SAMPLE).allSatisfy(b -> assertThat(a.equals(b)).isEqualTo(b.equals(a)));
        }
    }

    @Test
    @DisplayName("Ex02.3 · (1) equals is transitive over the sample")
    void equals_isTransitive_overSample() {
        for (Object a : SAMPLE) {
            for (Object b : equalTo(a)) {
                assertThat(equalTo(b)).allSatisfy(c -> assertThat(a.equals(c)).isTrue());
            }
        }
    }

    @Test
    @DisplayName("Ex02.3 · (2) starting code: Point overrides equals but inherits Object.hashCode")
    void brokenPoint_inheritsHashCode_fromObject() throws NoSuchMethodException {
        Class<?> owner = dev.interview.javalanguage.m02.ex3.broken.Point.class
                .getMethod("hashCode")
                .getDeclaringClass();

        assertThat(owner).isEqualTo(Object.class);
    }

    @Test
    @DisplayName("Ex02.3 · (2) equal objects have equal hash codes over the sample")
    void hashCode_isEqual_whenObjectsAreEqual() {
        for (Object a : SAMPLE) {
            assertThat(equalTo(a)).allSatisfy(b -> assertThat(b.hashCode()).isEqualTo(a.hashCode()));
        }
    }

    @Test
    @DisplayName(
            "Ex02.3 · (3) starting code: the subtraction comparator sorts Integer.MAX_VALUE before Integer.MIN_VALUE")
    void brokenComparator_sortsMaxBeforeMin_whenSubtractionOverflows() {
        var min = new dev.interview.javalanguage.m02.ex3.broken.Point(Integer.MIN_VALUE, 0);
        var max = new dev.interview.javalanguage.m02.ex3.broken.Point(Integer.MAX_VALUE, 0);
        var points = new ArrayList<>(List.of(min, max));

        points.sort(dev.interview.javalanguage.m02.ex3.broken.Point.BY_X_THEN_Y);

        assertThat(points).containsExactly(max, min);
    }

    @Test
    @DisplayName("Ex02.3 · (3) extreme coordinates sort by x, then by y")
    void byXThenY_sortsExtremeCoordinates_inNumericOrder() {
        List<Point> points = new ArrayList<>(List.of(
                new Point(Integer.MIN_VALUE, 0),
                new Point(Integer.MAX_VALUE, 0),
                new Point(0, Integer.MAX_VALUE),
                new Point(0, Integer.MIN_VALUE),
                new Point(0, 0)));

        points.sort(Point.BY_X_THEN_Y);

        assertThat(points)
                .containsExactly(
                        new Point(Integer.MIN_VALUE, 0),
                        new Point(0, Integer.MIN_VALUE),
                        new Point(0, 0),
                        new Point(0, Integer.MAX_VALUE),
                        new Point(Integer.MAX_VALUE, 0));
    }

    @Test
    @DisplayName("Ex02.3 · (4) a HashSet of the sample holds no duplicates")
    void hashSet_holdsFourElements_whenBuiltFromSample() {
        assertThat(new HashSet<>(SAMPLE)).hasSize(4);
    }

    private static List<Object> equalTo(Object a) {
        return SAMPLE.stream().filter(a::equals).toList();
    }
}
