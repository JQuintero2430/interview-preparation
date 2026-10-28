package dev.interview.javalanguage;

public final class HelloOutput {

    private static final String FIRST_LINE = "Hello, interview labs";
    private static final String SECOND_LINE = "Java 25 build is working";

    private HelloOutput() {}

    public static void main(String[] args) {
        System.out.println(FIRST_LINE);
        System.out.println(SECOND_LINE);
    }
}
