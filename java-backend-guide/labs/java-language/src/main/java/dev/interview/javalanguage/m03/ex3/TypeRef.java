package dev.interview.javalanguage.m03.ex3;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

// Module 03 Ex03.3: a super type token. Each new TypeRef<...>() {} is a new anonymous class, so equality must come
// from the captured Type, never from the class.
public abstract class TypeRef<T> {

    static final String MISSING_TYPE_ARGUMENT =
            "TypeRef needs a type argument: write new TypeRef<List<String>>() {}, not a raw new TypeRef() {}";

    private final Type type;

    protected TypeRef() {
        this.type = capturedTypeArgument();
    }

    public final Type type() {
        return type;
    }

    @Override
    public final boolean equals(Object other) {
        return other instanceof TypeRef<?> that && type.equals(that.type);
    }

    @Override
    public final int hashCode() {
        return type.hashCode();
    }

    private Type capturedTypeArgument() {
        if (getClass().getGenericSuperclass() instanceof ParameterizedType superclass) {
            return superclass.getActualTypeArguments()[0];
        }
        throw new IllegalStateException(MISSING_TYPE_ARGUMENT);
    }
}
