package dev.interview.javalanguage.m03.ex3;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;

// Module 03 Ex03.3: a super type token written from scratch, compared with Spring's. One group per criterion.
class TypeRefTest {

    @Test
    @DisplayName("Ex03.3 · (1) new TypeRef<List<String>>() {}.type() is List with the argument String")
    void type_isParameterizedListOfString_whenTokenNamesListOfString() {
        Type type = new TypeRef<List<String>>() {}.type();

        assertThat(type).isInstanceOf(ParameterizedType.class);
        ParameterizedType parameterized = (ParameterizedType) type;
        assertThat(parameterized.getRawType()).isEqualTo(List.class);
        assertThat(parameterized.getActualTypeArguments()).containsExactly(String.class);
    }

    @Test
    @DisplayName("Ex03.3 · (2) a raw new TypeRef() {} is rejected with IllegalStateException naming the problem")
    @SuppressWarnings("rawtypes")
    void constructor_throwsIllegalStateException_whenSubclassIsRaw() {
        assertThatThrownBy(() -> new TypeRef() {})
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(TypeRef.MISSING_TYPE_ARGUMENT);
    }

    @Test
    @DisplayName("Ex03.3 · (3) two tokens for the same type are equal and hash alike")
    void equals_isTrueWithEqualHashCodes_whenTwoTokensNameTheSameType() {
        TypeRef<Map<String, List<Integer>>> first = new TypeRef<>() {};
        TypeRef<Map<String, List<Integer>>> second = new TypeRef<>() {};

        assertThat(first.getClass()).isNotEqualTo(second.getClass());
        assertThat(first).isEqualTo(second);
        assertThat(first.hashCode()).isEqualTo(second.hashCode());
    }

    @Test
    @DisplayName("Ex03.3 · (3) tokens for different type arguments are not equal")
    void equals_isFalse_whenTypeArgumentsDiffer() {
        TypeRef<List<String>> strings = new TypeRef<>() {};
        TypeRef<List<Integer>> integers = new TypeRef<>() {};

        assertThat(strings).isNotEqualTo(integers);
    }

    @Test
    @DisplayName("Ex03.3 · (4) type() equals Spring's ParameterizedTypeReference.getType() for List<String>")
    void type_equalsSpringType_whenBothNameListOfString() {
        Type ours = new TypeRef<List<String>>() {}.type();
        Type springs = new ParameterizedTypeReference<List<String>>() {}.getType();

        assertThat(ours).isEqualTo(springs);
        assertThat(ours.hashCode()).isEqualTo(springs.hashCode());
    }
}
