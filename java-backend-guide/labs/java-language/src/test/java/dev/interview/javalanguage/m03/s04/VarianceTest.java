package dev.interview.javalanguage.m03.s04;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Each wildcard method is called with two different element types, because accepting both is the point of a wildcard.
class VarianceTest {

    private static final int FIRST = 0;
    private static final String A = "a";
    private static final String B = "b";
    private static final String C = "c";
    private static final List<Integer> INTEGERS = List.of(1, 2, 3);
    private static final double SUM_OF_INTEGERS = 6.0;
    private static final List<Double> DOUBLES = List.of(1.5, 2.5);
    private static final double SUM_OF_DOUBLES = 4.0;
    private static final double EMPTY_SUM = 0.0;
    private static final int ONE = 1;
    private static final int TWO = 2;
    private static final int TWO_ONES = 2;
    private static final int NO_ONES = 0;
    private static final double HALF = 0.5;
    private static final int SIZE_AFTER_ADDING_NULL = 3;
    private static final int SIZE_AFTER_REMOVE = 2;

    @Test
    @DisplayName("M03 §4 · storing an Integer through an Object[] view of a String[] throws ArrayStoreException")
    void arrayStore_throwsArrayStoreException_whenIntegerIsStoredThroughObjectArrayView() {
        String[] names = {A};
        Object[] view = names;

        assertThatThrownBy(() -> view[FIRST] = ONE).isInstanceOf(ArrayStoreException.class);
        assertThat(names[FIRST]).isEqualTo(A);
    }

    @Test
    @DisplayName("M03 §4 · a List<? extends Number> parameter reads Numbers from a List<Integer> and a List<Double>")
    void total_addsDoubleValues_whenListHoldsIntegersOrDoubles() {
        assertThat(Transfers.total(INTEGERS)).isEqualTo(SUM_OF_INTEGERS);
        assertThat(Transfers.total(DOUBLES)).isEqualTo(SUM_OF_DOUBLES);
        assertThat(Transfers.total(List.<Integer>of())).isEqualTo(EMPTY_SUM);
    }

    @Test
    @DisplayName("M03 §4 · a List<? super Integer> accepts Integers and reads Objects")
    void fillWithOnes_addsIntegers_whenSinkIsAListOfNumberOrObject() {
        List<Number> numbers = new ArrayList<>();
        List<Object> objects = new ArrayList<>();
        List<Number> untouched = new ArrayList<>();

        Transfers.fillWithOnes(numbers, TWO_ONES);
        Transfers.fillWithOnes(objects, TWO_ONES);
        Transfers.fillWithOnes(untouched, NO_ONES);

        List<? super Integer> sink = numbers;
        Object first = sink.get(FIRST);
        assertThat(numbers).containsExactly(ONE, ONE);
        assertThat(objects).containsExactly(ONE, ONE);
        assertThat(untouched).isEmpty();
        assertThat(first).isEqualTo(ONE);
    }

    @Test
    @DisplayName("M03 §4 · PECS copies a List<Integer> into a List<Number>")
    void appendAll_addsEverySourceElement_whenDestinationIsAListOfASupertype() {
        List<Number> destination = new ArrayList<>(List.of(HALF));

        Transfers.appendAll(destination, List.of(ONE, TWO));
        Transfers.appendAll(destination, List.<Integer>of());

        assertThat(destination).containsExactly(HALF, ONE, TWO);
    }

    @Test
    @DisplayName("M03 §4 · a List<? extends Number> still allows null, remove and clear")
    void extendsWildcardList_allowsNullRemoveAndClear_whenAccessedThroughTheWildcardType() {
        List<? extends Number> view = new ArrayList<>(List.of(ONE, TWO));

        view.add(null);
        int sizeAfterAddingNull = view.size();
        view.remove(FIRST);
        int sizeAfterRemove = view.size();
        view.clear();

        assertThat(sizeAfterAddingNull).isEqualTo(SIZE_AFTER_ADDING_NULL);
        assertThat(sizeAfterRemove).isEqualTo(SIZE_AFTER_REMOVE);
        assertThat(view).isEmpty();
    }

    @Test
    @DisplayName("M03 §4 · a capture helper swaps the first two elements of a List<?>")
    void swapFirstTwo_swapsOnlyWhenTwoElementsExist_whenListHasThreeTwoOneOrNoElements() {
        List<String> three = new ArrayList<>(List.of(A, B, C));
        List<String> two = new ArrayList<>(List.of(A, B));
        List<String> one = new ArrayList<>(List.of(A));
        List<String> none = new ArrayList<>();

        Transfers.swapFirstTwo(three);
        Transfers.swapFirstTwo(two);
        Transfers.swapFirstTwo(one);
        Transfers.swapFirstTwo(none);

        assertThat(three).containsExactly(B, A, C);
        assertThat(two).containsExactly(B, A);
        assertThat(one).containsExactly(A);
        assertThat(none).isEmpty();
    }
}
