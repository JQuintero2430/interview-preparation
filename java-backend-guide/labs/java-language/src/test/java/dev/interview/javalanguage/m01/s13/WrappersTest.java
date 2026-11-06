package dev.interview.javalanguage.m01.s13;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m01.s13.OrderBook.Order;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

// Pins module 01 §13 on the running JDK; the child JVM keeps the cache flag out of the surefire JVM.
class WrappersTest {

    private static final int CACHED = 127;
    private static final int NOT_CACHED = 128;
    private static final int LARGE = 1000;
    private static final long CACHED_ID = 127L;
    private static final long NOT_CACHED_ID = 128L;
    private static final String CUSTOMER = "ada";
    private static final String OTHER_CUSTOMER = "grace";
    private static final String SKU = "sku-1";
    private static final String MISSING_SKU = "sku-missing";
    private static final int STOCK = 7;
    private static final byte BYTE_VALUE = 5;
    private static final double BYTE_AS_DOUBLE = 5.0;
    private static final char CACHED_CHAR = 'a';

    private static final String CACHE_MAX_FLAG = "-XX:AutoBoxCacheMax=1000";
    private static final String JAVA_EXECUTABLE = "java";
    private static final String BIN_DIRECTORY = "bin";
    private static final String JAVA_HOME_PROPERTY = "java.home";
    private static final String SOURCE_FILE = "Main.java";
    private static final String CHILD_SOURCE = "public class Main { public static void main(String[] args) {"
            + " Integer a = Integer.valueOf(1000); Integer b = Integer.valueOf(1000);"
            + " System.out.println(a == b); } }";
    private static final String TRUE_OUTPUT = "true";
    private static final long CHILD_TIMEOUT_SECONDS = 60L;

    @Test
    @DisplayName("M01 §13 · == on Integer 127 is true and on 128 is false")
    void integerIdentity_isTrueAt127AndFalseAt128_whenBoxedSeparately() {
        Integer cachedA = Integer.valueOf(CACHED);
        Integer cachedB = Integer.valueOf(CACHED);
        Integer largeA = Integer.valueOf(NOT_CACHED);
        Integer largeB = Integer.valueOf(NOT_CACHED);

        assertThat(cachedA == cachedB).isTrue();
        assertThat(largeA == largeB).isFalse();
    }

    @Test
    void integerValueOf_returnsDistinctInstances_whenValueIsOutsideTheCache() {
        Integer first = Integer.valueOf(LARGE);
        Integer second = Integer.valueOf(LARGE);

        assertThat(first).isNotSameAs(second);
        assertThat(first).isEqualTo(second);
    }

    @Test
    void boxing_returnsSharedInstances_whenBooleanOrCharacterIsInCache() {
        Boolean trueA = Boolean.valueOf(true);
        Boolean trueB = Boolean.valueOf(true);
        Character charA = Character.valueOf(CACHED_CHAR);
        Character charB = Character.valueOf(CACHED_CHAR);

        assertThat(trueA == trueB).isTrue();
        assertThat(charA == charB).isTrue();
    }

    @Test
    @DisplayName("M01 §13 · unboxing null throws NullPointerException")
    void unbox_throwsNullPointer_whenTheWrapperIsNull() {
        Integer nothing = null;

        assertThatThrownBy(() -> unbox(nothing)).isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M01 §13 · ternary with Integer null and int throws NPE")
    void ternary_throwsNullPointer_whenIntegerNullMeetsInt() {
        Integer nothing = null;

        assertThatThrownBy(() -> pickMixed(true, nothing, 1)).isInstanceOf(NullPointerException.class);
    }

    @Test
    void ternary_returnsNull_whenBothOperandsAreInteger() {
        Integer nothing = null;
        Integer other = Integer.valueOf(1);

        assertThat(pickBoxed(true, nothing, other)).isNull();
    }

    @Test
    void mapGetIntoInt_throwsNullPointer_whenTheKeyIsMissing() {
        Map<String, Integer> stock = new HashMap<>();

        assertThatThrownBy(() -> unbox(stock.get(MISSING_SKU))).isInstanceOf(NullPointerException.class);
    }

    @Test
    void integerEqualsInt_comparesNumerically_whenValueIsAboveTheCache() {
        Integer boxed = Integer.valueOf(LARGE);
        int primitive = LARGE;

        assertThat(boxed == primitive).isTrue();
    }

    @Test
    void longEquals_isFalse_whenArgumentBoxesToInteger() {
        Long one = Long.valueOf(1L);
        int intOne = 1;

        assertThat(one.equals(intOne)).isFalse();
    }

    @Test
    void castToDouble_givesTheNumericValue_whenOperandIsAByteObject() {
        Byte boxed = Byte.valueOf(BYTE_VALUE);

        double widened = (double) boxed;

        assertThat(widened).isEqualTo(BYTE_AS_DOUBLE);
    }

    @Test
    void findByIdentity_findsTheOrder_whenIdIsInTheLongCache() {
        var book = new OrderBook(List.of(new Order(Long.valueOf(CACHED_ID), CUSTOMER)));

        assertThat(book.findByIdentity(Long.valueOf(CACHED_ID)))
                .hasValueSatisfying(o -> assertThat(o.customer()).isEqualTo(CUSTOMER));
    }

    @Test
    void findByIdentity_returnsEmpty_whenIdIsOutsideTheCacheAndBoxedSeparately() {
        var book = new OrderBook(List.of(new Order(Long.valueOf(NOT_CACHED_ID), CUSTOMER)));

        assertThat(book.findByIdentity(Long.valueOf(NOT_CACHED_ID))).isEmpty();
    }

    @Test
    void findById_findsTheOrder_whenIdIsInsideAndOutsideTheCache() {
        var book = new OrderBook(List.of(
                new Order(Long.valueOf(CACHED_ID), CUSTOMER), new Order(Long.valueOf(NOT_CACHED_ID), OTHER_CUSTOMER)));

        assertThat(book.findById(Long.valueOf(CACHED_ID)))
                .hasValueSatisfying(o -> assertThat(o.customer()).isEqualTo(CUSTOMER));
        assertThat(book.findById(Long.valueOf(NOT_CACHED_ID)))
                .hasValueSatisfying(o -> assertThat(o.customer()).isEqualTo(OTHER_CUSTOMER));
    }

    @Test
    void findById_returnsEmpty_whenNoOrderMatches() {
        var book = new OrderBook(List.of(new Order(Long.valueOf(CACHED_ID), CUSTOMER)));

        assertThat(book.findById(Long.valueOf(NOT_CACHED_ID))).isEmpty();
    }

    @Test
    void lookups_returnEmpty_whenTheBookHasNoOrders() {
        var book = new OrderBook(List.of());

        assertThat(book.findById(Long.valueOf(CACHED_ID))).isEmpty();
        assertThat(book.findByIdentity(Long.valueOf(CACHED_ID))).isEmpty();
    }

    @Test
    void constructor_keepsTheOrders_whenTheSourceListIsLaterModified() {
        List<Order> source = new ArrayList<>(List.of(new Order(Long.valueOf(CACHED_ID), CUSTOMER)));
        var book = new OrderBook(source);

        source.clear();

        assertThat(book.findById(Long.valueOf(CACHED_ID))).isPresent();
    }

    @Test
    void quantityOf_returnsTheStoredValue_whenTheKeyIsPresent() {
        assertThat(OrderBook.quantityOf(Map.of(SKU, STOCK), SKU)).isEqualTo(STOCK);
    }

    @Test
    void quantityOf_returnsZero_whenTheKeyIsMissing() {
        assertThat(OrderBook.quantityOf(Map.of(SKU, STOCK), MISSING_SKU)).isZero();
    }

    @Test
    void quantityUnboxed_returnsTheStoredValue_whenTheKeyIsPresent() {
        assertThat(OrderBook.quantityUnboxed(Map.of(SKU, STOCK), SKU)).isEqualTo(STOCK);
    }

    @Test
    void quantityUnboxed_throwsNullPointer_whenTheKeyIsMissing() {
        Map<String, Integer> stock = Map.of(SKU, STOCK);

        assertThatThrownBy(() -> OrderBook.quantityUnboxed(stock, MISSING_SKU))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("M01 §13 · AutoBoxCacheMax=1000 makes Integer 1000 identical in a child JVM")
    void integerIdentity_isTrueAt1000_whenChildJvmRaisesTheCache(@TempDir Path directory)
            throws IOException, InterruptedException {
        Path source = directory.resolve(SOURCE_FILE);
        Files.writeString(source, CHILD_SOURCE);
        Path java = Path.of(System.getProperty(JAVA_HOME_PROPERTY), BIN_DIRECTORY, JAVA_EXECUTABLE);
        Process child = new ProcessBuilder(java.toString(), CACHE_MAX_FLAG, source.toString())
                .redirectErrorStream(true)
                .start();

        boolean finished = child.waitFor(CHILD_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        if (!finished) {
            child.destroyForcibly();
        }
        String output = new String(child.getInputStream().readAllBytes());

        assertThat(finished).as("child JVM output: %s", output).isTrue();
        assertThat(output.lines().toList().getLast())
                .as("child JVM output: %s", output)
                .isEqualTo(TRUE_OUTPUT);
    }

    private static int unbox(Integer value) {
        return value;
    }

    private static Integer pickMixed(boolean first, Integer boxed, int primitive) {
        return first ? boxed : primitive;
    }

    private static Integer pickBoxed(boolean first, Integer left, Integer right) {
        return first ? left : right;
    }
}
