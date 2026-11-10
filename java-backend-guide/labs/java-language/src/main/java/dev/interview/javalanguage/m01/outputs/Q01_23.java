package dev.interview.javalanguage.m01.outputs;

// Module 01 Q01.23: unrelated defaults must be resolved by an override; a shared ancestor is no conflict; the more
// specific override wins.
public final class Q01_23 {

    private Q01_23() {}

    interface Left {
        default String hello() {
            return "left";
        }
    }

    interface Right {
        default String hello() {
            return "right";
        }
    }

    interface Root {
        default String origin() {
            return "root";
        }
    }

    interface A extends Root {}

    interface B extends Root {}

    interface Over extends Root {
        @Override
        default String origin() {
            return "over";
        }
    }

    static class Both implements Left, Right {
        @Override
        public String hello() {
            return Left.super.hello() + "+" + Right.super.hello();
        }
    }

    static class Joined implements A, B {}

    static class Skewed implements A, Over {}

    public static void main(String[] args) {
        System.out.println(new Both().hello());
        System.out.println(new Joined().origin());
        System.out.println(new Skewed().origin());
    }
}
