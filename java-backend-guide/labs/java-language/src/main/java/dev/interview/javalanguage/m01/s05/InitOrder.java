package dev.interview.javalanguage.m01.s05;

// Module 01 §5: prints each initialization step, so a test can pin the order the JLS defines.
public final class InitOrder {

    private InitOrder() {}

    private static String trace(String step) {
        System.out.println(step);
        return step;
    }

    public static class Parent {
        static {
            System.out.println("Parent static");
        }

        {
            System.out.println("Parent instance initializer");
        }

        private final String field = trace("Parent field initializer");

        public Parent() {
            System.out.println("Parent constructor");
        }
    }

    public static final class Child extends Parent {
        static {
            System.out.println("Child static");
        }

        {
            System.out.println("Child instance initializer");
        }

        private final String field = trace("Child field initializer");

        public Child() {
            System.out.println("Child constructor");
        }
    }
}
