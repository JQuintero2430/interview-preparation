package dev.interview.javalanguage.m01.outputs;

// Q01.04: integer overflow, division and remainder signs, floating-point edge cases.
public final class Q01_04 {

    private Q01_04() {}

    public static void main(String[] args) {
        int big = Integer.MAX_VALUE;
        int zero = 0;
        System.out.println(big + 1);
        System.out.println(-7 / 2);
        System.out.println(-7 % 2);
        System.out.println(7 % -2);
        System.out.println(Math.floorMod(-7, 2));
        System.out.println(5.5 % 2);
        System.out.println(1.0 / zero);
        System.out.println(0.0 / zero);
        System.out.println(Math.abs(Integer.MIN_VALUE));
        try {
            System.out.println(1 / zero);
        } catch (ArithmeticException e) {
            System.out.println(e.getMessage());
        }
    }
}
