package dev.interview.javalanguage.m06.outputs;

// Module 06 Q06.15: only literals, constant expressions and intern() give the pooled instance.
public final class Q06_15 {

    static final String PREFIX = "or";

    private Q06_15() {}

    @SuppressWarnings({"StringEquality", "StringOperationCanBeSimplified"})
    public static void main(String[] args) {
        String literal = "order";
        final String finalLocal = "or";
        String plainLocal = "or";
        String copy = new String("order");

        System.out.println("1 " + (literal == "or" + "der"));
        System.out.println("2 " + (literal == PREFIX + "der"));
        System.out.println("3 " + (literal == finalLocal + "der"));
        System.out.println("4 " + (literal == plainLocal + "der"));
        System.out.println("5 " + literal.equals(plainLocal + "der"));
        System.out.println("6 " + (literal == copy));
        System.out.println("7 " + (literal == copy.intern()));
        System.out.println("8 " + (literal == (plainLocal + "der").intern()));
        System.out.println("9 " + literal == "9 " + literal);
    }
}
