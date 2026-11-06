package dev.interview.javalanguage.m01.outputs;

// Q01.07: increment order, short-circuit operators, ternary typing.
public final class Q01_07 {

    private Q01_07() {}

    public static void main(String[] args) {
        int i = 5;
        int j = i++ + ++i;
        System.out.println(i + " " + j);
        int k = 1;
        k = k++;
        System.out.println(k);
        int n = 10;
        n += n++ + ++n;
        System.out.println(n);
        boolean off = false;
        int calls = 0;
        boolean first = off && ++calls > 0;
        boolean second = off & ++calls > 0;
        System.out.println(calls + " " + first + " " + second);
        System.out.println(true || off && off);
        int size = 5;
        System.out.println(size > 3 ? "big" : size > 1 ? "mid" : "small");
        System.out.println(true ? 1 : 2.0);
    }
}
