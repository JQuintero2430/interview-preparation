package dev.interview.javalanguage.m03.outputs;

import dev.interview.javalanguage.m03.s05.Money;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.stream.Collectors;

// Module 03 Q03.16: getDeclaredMethods has no specified order, so the lines are sorted before printing.
public final class Q03_16 {

    private Q03_16() {}

    public static void main(String[] args) {
        Arrays.stream(Money.class.getDeclaredMethods())
                .map(Q03_16::describe)
                .sorted()
                .forEach(System.out::println);
    }

    private static String describe(Method method) {
        String parameters = Arrays.stream(method.getParameterTypes())
                .map(Class::getSimpleName)
                .collect(Collectors.joining(", "));
        String flags = (method.isBridge() ? " bridge" : "") + (method.isSynthetic() ? " synthetic" : "");
        return method.getName() + "(" + parameters + ")" + flags;
    }
}
