package dev.interview.javalanguage.m03.s01;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Top stack frames are asserted because §1 is about where the failure surfaces, not only that it happens.
class RawTypesTest {

    private static final String SKU = "A-100";
    private static final String OTHER_SKU = "B-200";
    private static final String FIRST_LETTERS = "AB";
    private static final String CHECKED_VIEW_CLASS = "java.util.Collections$CheckedCollection";
    private static final String TYPE_CHECK_METHOD = "typeCheck";

    @Test
    @DisplayName("M03 §1 · firstLetters returns the first letter of each String element")
    void firstLetters_returnsOneLetterPerSku_whenEveryElementIsAString() {
        assertThat(SkuReport.firstLetters(List.of(SKU, OTHER_SKU))).isEqualTo(FIRST_LETTERS);
    }

    @Test
    @DisplayName("M03 §1 · firstLetters of an empty list is the empty string")
    void firstLetters_returnsEmptyString_whenListIsEmpty() {
        assertThat(SkuReport.firstLetters(List.of())).isEmpty();
    }

    @Test
    @DisplayName("M03 §1 · a raw-typed add makes the ClassCastException appear at the typed read")
    void firstLetters_throwsClassCastException_whenRawAddPollutedTheList() {
        List<String> skus = new ArrayList<>(List.of(SKU));

        LegacyCatalog.addStockCount(skus);

        assertThat(skus).hasSize(2);
        for (Object element : skus) {
            assertThat(element).isNotNull();
        }
        ClassCastException thrown = catchThrowableOfType(ClassCastException.class, () -> SkuReport.firstLetters(skus));
        assertThat(thrown).isNotNull();
        assertThat(thrown.getStackTrace()[0].getClassName()).isEqualTo(SkuReport.class.getName());
    }

    @Test
    @DisplayName("M03 §1 · Collections.checkedList throws at the bad add")
    void addStockCount_throwsClassCastException_whenListIsCheckedView() {
        List<String> skus = Collections.checkedList(new ArrayList<>(List.of(SKU)), String.class);

        ClassCastException thrown =
                catchThrowableOfType(ClassCastException.class, () -> LegacyCatalog.addStockCount(skus));

        assertThat(thrown).isNotNull();
        StackTraceElement top = thrown.getStackTrace()[0];
        assertThat(top.getClassName()).isEqualTo(CHECKED_VIEW_CLASS);
        assertThat(top.getMethodName()).isEqualTo(TYPE_CHECK_METHOD);
        assertThat(skus).hasSize(1);
    }
}
