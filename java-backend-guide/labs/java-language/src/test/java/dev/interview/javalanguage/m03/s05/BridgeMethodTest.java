package dev.interview.javalanguage.m03.s05;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.BridgeMethodResolver;

// Module 03 §5: what javac writes into the class file, read back by reflection.
class BridgeMethodTest {

    private static final String COMPARE_TO = "compareTo";
    private static final String ENTRIES = "entries";

    @Test
    @DisplayName("M03 §5 · a Comparable<Money> implementation has a bridge compareTo(Object)")
    void money_declaresSyntheticBridge_whenItImplementsComparableOfMoney() throws NoSuchMethodException {
        List<Method> bridges = bridgesNamed(COMPARE_TO);
        Method declared = Money.class.getDeclaredMethod(COMPARE_TO, Money.class);

        assertThat(bridges).singleElement().satisfies(bridge -> {
            assertThat(bridge.isSynthetic()).isTrue();
            assertThat(bridge.getParameterTypes()).containsExactly(Object.class);
        });
        assertThat(declared.isBridge()).isFalse();
        assertThat(declared.isSynthetic()).isFalse();
    }

    @Test
    @DisplayName("M03 §5 · a field's generic type survives in the Signature attribute")
    void ledgerMembers_keepDeclaredTypeArgument_whenReadByReflection() throws ReflectiveOperationException {
        Field field = Ledger.class.getDeclaredField(ENTRIES);
        Method accessor = Ledger.class.getDeclaredMethod(ENTRIES);

        assertThat(field.getType()).isEqualTo(List.class);
        assertListOfMoney(field.getGenericType());
        assertListOfMoney(accessor.getGenericReturnType());
    }

    @Test
    @DisplayName("M03 §5 · Spring's BridgeMethodResolver finds the method a bridge delegates to")
    void bridgeMethodResolver_returnsCompareToMoney_whenGivenTheBridge() throws NoSuchMethodException {
        Method bridge = bridgesNamed(COMPARE_TO).getFirst();

        Method bridged = BridgeMethodResolver.findBridgedMethod(bridge);

        assertThat(bridged).isEqualTo(Money.class.getMethod(COMPARE_TO, Money.class));
    }

    // Filters by name and flag: getDeclaredMethods returns methods in no particular order.
    private static List<Method> bridgesNamed(String name) {
        return Arrays.stream(Money.class.getDeclaredMethods())
                .filter(method -> method.getName().equals(name))
                .filter(Method::isBridge)
                .toList();
    }

    private static void assertListOfMoney(Type type) {
        assertThat(type).isInstanceOf(ParameterizedType.class);
        ParameterizedType parameterized = (ParameterizedType) type;
        assertThat(parameterized.getRawType()).isEqualTo(List.class);
        assertThat(parameterized.getActualTypeArguments()).containsExactly(Money.class);
    }
}
