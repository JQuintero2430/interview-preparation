package dev.interview.javalanguage.m02.ex2;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m02.ex2.Order.Line;
import dev.interview.javalanguage.m02.ex2.Order.Status;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// The ids, SKUs and quantities are the cases the exercise names, so they stay literal in each test.
class OrderTest {

    private static final Line PEN = new Line("PEN-1", 2);
    private static final Line INK = new Line("INK-7", 1);

    private static Order.Builder validBuilder() {
        return Order.builder().id("o-1").customer("ada");
    }

    @Test
    @DisplayName("Ex02.2 · (1) changing the list passed to the builder after build() does not change the order")
    void build_copiesLines_whenCallerMutatesItsListAfterwards() {
        List<Line> callerLines = new ArrayList<>(List.of(PEN));
        Order order = validBuilder().lines(callerLines).build();

        callerLines.add(INK);
        callerLines.set(0, INK);

        assertThat(order.lines()).containsExactly(PEN);
    }

    @Test
    @DisplayName("Ex02.2 · (2) the order's line list throws UnsupportedOperationException on add")
    void lines_throwsUnsupportedOperationException_whenAdding() {
        Order order = validBuilder().lines(List.of(PEN)).build();
        List<Line> lines = order.lines();

        assertThatThrownBy(() -> lines.add(INK)).isInstanceOf(UnsupportedOperationException.class);
        assertThat(order.lines()).containsExactly(PEN);
    }

    @Test
    @DisplayName("Ex02.2 · (3) withStatus returns a new order and leaves the original unchanged")
    void withStatus_returnsNewOrder_andKeepsOriginal() {
        Order original = validBuilder().lines(List.of(PEN)).build();

        Order paid = original.withStatus(Status.PAID);

        assertThat(paid).isNotSameAs(original);
        assertThat(paid.status()).isEqualTo(Status.PAID);
        assertThat(original.status()).isEqualTo(Status.NEW);
        assertThat(paid.id()).isEqualTo(original.id());
        assertThat(paid.customer()).isEqualTo(original.customer());
        assertThat(paid.lines()).isEqualTo(original.lines());
    }

    @Test
    @DisplayName("Ex02.2 · (3) withLine returns a new order with one more line and leaves the original unchanged")
    void withLine_returnsNewOrderWithOneMoreLine_andKeepsOriginal() {
        Order original = validBuilder().lines(List.of(PEN)).build();

        Order extended = original.withLine(INK);

        assertThat(extended).isNotSameAs(original);
        assertThat(extended.lines()).containsExactly(PEN, INK);
        assertThat(original.lines()).containsExactly(PEN);
    }

    @Test
    @DisplayName("Ex02.2 · (4) build() without an id throws IllegalStateException naming id")
    void build_throwsIllegalStateException_whenIdIsMissing() {
        Order.Builder builder = Order.builder().customer("ada");

        assertThatThrownBy(builder::build)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("missing required field: id");
    }

    @Test
    @DisplayName("Ex02.2 · (4) build() without a customer throws IllegalStateException naming customer")
    void build_throwsIllegalStateException_whenCustomerIsMissing() {
        Order.Builder builder = Order.builder().id("o-1");

        assertThatThrownBy(builder::build)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("missing required field: customer");
    }
}
