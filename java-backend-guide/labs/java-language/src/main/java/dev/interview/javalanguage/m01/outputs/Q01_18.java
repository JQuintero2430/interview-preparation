package dev.interview.javalanguage.m01.outputs;

// Module 01 Q01.18: fields and static methods are bound to the declared type; instance methods dispatch on the runtime
// type.
public final class Q01_18 {

    private Q01_18() {}

    static class Parent {
        String name = "parent";

        static String kind() {
            return "parent";
        }

        String who() {
            return "parent";
        }

        String describe() {
            return name;
        }
    }

    static class Child extends Parent {
        String name = "child";

        static String kind() {
            return "child";
        }

        @Override
        String who() {
            return "child";
        }
    }

    @SuppressWarnings("static")
    public static void main(String[] args) {
        Parent p = new Child();
        System.out.println(p.name);
        System.out.println(((Child) p).name);
        System.out.println(p.kind());
        System.out.println(p.who());
        System.out.println(p.describe());
    }
}
