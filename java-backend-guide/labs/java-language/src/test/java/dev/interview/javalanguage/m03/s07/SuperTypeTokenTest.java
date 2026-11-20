package dev.interview.javalanguage.m03.s07;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.ResolvableType;

// Module 03 §7: super type tokens read the Signature of an anonymous subclass, in plain Java and in Spring.
class SuperTypeTokenTest {

    private static final String ORDERS = "orders";
    private static final String TYPE_VARIABLE_NAME = "T";
    private static final int FIRST = 0;

    private record Order(long id) {}

    private static final class Holder {
        private List<Order> orders;
    }

    @Test
    @DisplayName("M03 §7 · an anonymous subclass's getGenericSuperclass carries the type argument")
    void typeToken_capturesListOfString_whenSubclassedAnonymously() {
        TypeToken<List<String>> token = new TypeToken<>() {};

        assertListOf(token.type(), String.class);
    }

    @Test
    @DisplayName("M03 §7 · a token expression evaluated twice yields one anonymous class; another site yields another")
    void typeToken_sharesOneClassPerSourceSite_whenEvaluatedRepeatedly() {
        List<Class<?>> sameSite = new ArrayList<>();
        for (int i = 0; i < 2; i++) {
            sameSite.add(new TypeToken<List<String>>() {}.getClass());
        }
        Class<?> otherSite = new TypeToken<List<String>>() {}.getClass();

        assertThat(sameSite.get(0)).isSameAs(sameSite.get(1));
        assertThat(otherSite).isNotSameAs(sameSite.get(0));
    }

    @Test
    @DisplayName("M03 §7 · a TypeToken subclassed without a type argument is rejected")
    @SuppressWarnings("rawtypes")
    void typeToken_throwsIllegalStateException_whenSubclassIsRaw() {
        assertThatThrownBy(() -> new TypeToken() {})
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(TypeToken.MISSING_TYPE_ARGUMENT);
    }

    @Test
    @DisplayName("M03 §7 · ParameterizedTypeReference<List<Order>> reports List<Order>")
    void parameterizedTypeReference_reportsListOfOrder_whenSubclassedAnonymously() {
        ParameterizedTypeReference<List<Order>> reference = new ParameterizedTypeReference<>() {};

        assertListOf(reference.getType(), Order.class);
    }

    @Test
    @DisplayName("M03 §7 · a token created inside a generic method captures the type variable, not the caller's type")
    void typeToken_capturesTypeVariable_whenCreatedInsideGenericMethod() {
        Type captured = firstArgument(GenericTokens.<String>listOf().type());

        assertThat(captured).isInstanceOf(TypeVariable.class);
        assertThat(((TypeVariable<?>) captured).getName()).isEqualTo(TYPE_VARIABLE_NAME);
    }

    @Test
    @DisplayName(
            "M03 §7 · a ParameterizedTypeReference created inside a generic method also captures the type variable")
    void parameterizedTypeReference_capturesTypeVariable_whenCreatedInsideGenericMethod() {
        Type captured = firstArgument(springListOf().getType());

        assertThat(captured).isInstanceOf(TypeVariable.class);
        assertThat(((TypeVariable<?>) captured).getName()).isEqualTo(TYPE_VARIABLE_NAME);
    }

    @Test
    @DisplayName("M03 §7 · Spring's ResolvableType resolves a field's type argument")
    void resolvableType_resolvesOrder_whenReadFromListOfOrderField() throws NoSuchFieldException {
        ResolvableType type = ResolvableType.forField(Holder.class.getDeclaredField(ORDERS));

        assertThat(type.resolve()).isEqualTo(List.class);
        assertThat(type.getGeneric(FIRST).resolve()).isEqualTo(Order.class);
    }

    // Defect on purpose, as in GenericTokens: the token records List<T>, whatever the caller's T is.
    private static <T> ParameterizedTypeReference<List<T>> springListOf() {
        return new ParameterizedTypeReference<>() {};
    }

    private static Type firstArgument(Type type) {
        assertThat(type).isInstanceOf(ParameterizedType.class);
        return ((ParameterizedType) type).getActualTypeArguments()[FIRST];
    }

    private static void assertListOf(Type type, Class<?> element) {
        assertThat(type).isInstanceOf(ParameterizedType.class);
        ParameterizedType parameterized = (ParameterizedType) type;
        assertThat(parameterized.getRawType()).isEqualTo(List.class);
        assertThat(parameterized.getActualTypeArguments()).containsExactly(element);
    }
}
