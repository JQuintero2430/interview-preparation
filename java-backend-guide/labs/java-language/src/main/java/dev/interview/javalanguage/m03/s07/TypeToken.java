package dev.interview.javalanguage.m03.s07;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

// Module 03 §7: a super type token in plain Java. An anonymous subclass such as new TypeToken<List<String>>() {}
// records List<String> in its Signature attribute, and getGenericSuperclass() reads it back.
public abstract class TypeToken<T> {

    static final String MISSING_TYPE_ARGUMENT = "TypeToken must be created with a type argument";

    private final Type type;

    protected TypeToken() {
        if (!(getClass().getGenericSuperclass() instanceof ParameterizedType superclass)) {
            throw new IllegalStateException(MISSING_TYPE_ARGUMENT);
        }
        this.type = superclass.getActualTypeArguments()[0];
    }

    public Type type() {
        return type;
    }
}
