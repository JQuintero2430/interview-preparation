package dev.interview.javalanguage.m01.outputs;

// Q01.08: signed and unsigned shifts, shift-distance masking.
public final class Q01_08 {

    private Q01_08() {}

    public static void main(String[] args) {
        int minusEight = -8;
        System.out.println(minusEight >> 1);
        System.out.println(minusEight >>> 1);
        System.out.println(minusEight >>> 28);
        System.out.println(1 << 32);
        System.out.println(1 << 33);
        System.out.println(1L << 32);
        System.out.println(1 << -1);
        byte small = -1;
        System.out.println(small >>> 4);
        small >>>= 4;
        System.out.println(small);
    }
}
