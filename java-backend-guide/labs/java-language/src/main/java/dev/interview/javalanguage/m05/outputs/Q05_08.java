package dev.interview.javalanguage.m05.outputs;

import java.util.function.Supplier;

// Module 05 Q05.08: a bound method reference evaluates its receiver when it is created; a lambda, when it runs.
public final class Q05_08 {

    private Q05_08() {}

    public static void main(String[] args) {
        Holder holder = null;
        Supplier<String> lambda = () -> holder.get();
        System.out.println("1: lambda created");
        try {
            lambda.get();
        } catch (NullPointerException e) {
            System.out.println("2: lambda call threw");
        }
        try {
            Supplier<String> reference = holder::get;
            System.out.println("3: reference created");
        } catch (NullPointerException e) {
            System.out.println("3: reference creation threw");
        }
    }

    public static NullPointerException lambdaCallFailure(Holder holder) {
        Supplier<String> lambda = () -> holder.get();
        try {
            lambda.get();
            return null;
        } catch (NullPointerException e) {
            return e;
        }
    }

    public static NullPointerException referenceCreationFailure(Holder holder) {
        try {
            Supplier<String> reference = holder::get;
            reference.get();
            return null;
        } catch (NullPointerException e) {
            return e;
        }
    }

    public static final class Holder {
        private final String value;

        public Holder(String value) {
            this.value = value;
        }

        public String get() {
            return value;
        }
    }
}
