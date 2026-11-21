package dev.interview.javalanguage.m04.s08;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CatalogTest {

    private static final Product PEN = new Product("pen", new BigDecimal("2.50"), true);
    private static final Product INK = new Product("ink", new BigDecimal("9.00"), false);
    private static final Product PAD = new Product("pad", new BigDecimal("1.20"), true);

    @Test
    @DisplayName("M04 §8 · Catalog copies its input and rejects null products")
    void constructor_copiesInput_rejectsNull() {
        List<Product> source = new ArrayList<>(List.of(PEN, INK));
        Catalog catalog = new Catalog(source);
        source.add(PAD);

        assertThat(catalog.all()).containsExactly(PEN, INK);
        assertThatThrownBy(() -> catalog.all().add(PAD)).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> new Catalog(Arrays.asList(PEN, null))).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M04 §8 · inStock is unmodifiable and keeps catalog order")
    void inStock_unmodifiable_inCatalogOrder() {
        Catalog catalog = new Catalog(List.of(PEN, INK, PAD));
        List<Product> inStock = catalog.inStock();

        assertThat(inStock).containsExactly(PEN, PAD);
        assertThatThrownBy(() -> inStock.sort(Comparator.comparing(Product::price)))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("M04 §8 · cheapestFirst sorts a new list and leaves the catalog order alone")
    void cheapestFirst_sortsWithoutTouchingCatalog() {
        Catalog catalog = new Catalog(List.of(PEN, INK, PAD));

        assertThat(catalog.cheapestFirst()).containsExactly(PAD, PEN);
        assertThat(catalog.inStock()).containsExactly(PEN, PAD);
    }

    @Test
    @DisplayName("M04 §8 · inStockForEditing returns a new ArrayList the caller owns")
    void inStockForEditing_returnsOwnedMutableList() {
        Catalog catalog = new Catalog(List.of(PEN, INK, PAD));

        ArrayList<Product> editable = catalog.inStockForEditing();
        editable.sort(Comparator.comparing(Product::price));
        editable.add(INK);

        assertThat(editable).containsExactly(PAD, PEN, INK);
        assertThat(catalog.inStockForEditing()).isNotSameAs(editable).containsExactly(PEN, PAD);
        assertThat(catalog.all()).containsExactly(PEN, INK, PAD);
    }
}
