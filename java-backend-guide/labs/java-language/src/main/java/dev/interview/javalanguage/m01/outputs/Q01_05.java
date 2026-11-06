package dev.interview.javalanguage.m01.outputs;

// Q01.05: narrowing casts, char arithmetic and compound assignment.
public final class Q01_05 {

    private Q01_05() {}

    public static void main(String[] args) {
        System.out.println((byte) 200);
        System.out.println((int) 3.99);
        System.out.println((int) -3.99);
        System.out.println((byte) 300.7);
        System.out.println((int) Double.NaN);
        System.out.println((int) 1e20);
        System.out.println('a' + 1);
        System.out.println((char) ('a' + 1));
        System.out.println("" + 'a' + 1);
        System.out.println('a' + 'b' + "");
        char letter = 'a';
        letter += 1;
        System.out.println(letter);
        System.out.println(1L + 1.5f);
    }
}
