package dev.interview.javalanguage.m03.smoke;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;

class M03LabSmokeTest {

    private static final String NAMES_FIELD = "names";

    private static final class Holder {
        private List<String> names;
    }

    @Test
    @DisplayName("M03 smoke · ArrayList<String> and ArrayList<Integer> share one runtime class")
    void arrayLists_shareRuntimeClass_whenTypeArgumentsDiffer() {
        List<String> strings = new ArrayList<>();
        List<Integer> integers = new ArrayList<>();

        Class<?> stringsClass = strings.getClass();
        Class<?> integersClass = integers.getClass();

        assertThat(stringsClass).isSameAs(integersClass);
    }

    @Test
    @DisplayName("M03 smoke · a field's declared type argument survives erasure")
    void fieldGenericType_keepsTypeArgument_whenReadByReflection() throws NoSuchFieldException {
        Field field = Holder.class.getDeclaredField(NAMES_FIELD);

        Type genericType = field.getGenericType();

        assertThat(genericType).isInstanceOf(ParameterizedType.class);
        ParameterizedType parameterized = (ParameterizedType) genericType;
        assertThat(parameterized.getRawType()).isEqualTo(List.class);
        assertThat(parameterized.getActualTypeArguments()).containsExactly(String.class);
    }

    @Test
    @DisplayName("M03 smoke · Spring's ParameterizedTypeReference captures List<String>")
    void parameterizedTypeReference_capturesListOfString_whenSubclassedAnonymously() {
        ParameterizedTypeReference<List<String>> reference = new ParameterizedTypeReference<>() {};

        Type type = reference.getType();

        assertThat(type).isInstanceOf(ParameterizedType.class);
        ParameterizedType parameterized = (ParameterizedType) type;
        assertThat(parameterized.getRawType()).isEqualTo(List.class);
        assertThat(parameterized.getActualTypeArguments()).containsExactly(String.class);
    }
}
