package dev.interview.javalanguage.m01.outputs;

// Q01.10: Java passes references by value, so reassigning a parameter never reaches the caller.
public final class Q01_10 {

    private Q01_10() {}

    static void swap(StringBuilder first, StringBuilder second) {
        StringBuilder temp = first;
        first = second;
        second = temp;
    }

    static void rename(StringBuilder name) {
        name.append("-v2");
        name = new StringBuilder("other");
        name.append("-v3");
    }

    static void bump(int count) {
        count++;
    }

    public static void main(String[] args) {
        StringBuilder a = new StringBuilder("a");
        StringBuilder b = new StringBuilder("b");
        swap(a, b);
        System.out.println(a + " " + b);
        rename(a);
        System.out.println(a);
        int count = 1;
        bump(count);
        System.out.println(count);
    }
}
