package dev.interview.javalanguage.m01.outputs;

// Q01.12: initialization order of static blocks, fields, instance blocks and constructors.
public final class Q01_12 {

    private Q01_12() {}

    static String log(String step) {
        System.out.println(step);
        return step;
    }

    static class Parent {
        static {
            log("Parent static block");
        }

        String parentField = log("Parent field");

        Parent() {
            log("Parent constructor");
        }
    }

    static class Child extends Parent {
        {
            log("Child instance block");
        }

        static String tag = log("Child static field");

        String childField = log("Child field");

        Child() {
            log("Child constructor");
        }
    }

    public static void main(String[] args) {
        new Child();
        log("--");
        new Child();
    }
}
