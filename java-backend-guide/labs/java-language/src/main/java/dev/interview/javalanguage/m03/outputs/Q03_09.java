package dev.interview.javalanguage.m03.outputs;

// Module 03 Q03.09: arrays are covariant and check every store at run time; generic types are invariant instead.
public final class Q03_09 {

    private Q03_09() {}

    public static void main(String[] args) {
        Object[] objects = new String[1];
        System.out.println(objects.getClass().getSimpleName());
        try {
            objects[0] = 42;
        } catch (ArrayStoreException e) {
            System.out.println(e.getClass().getSimpleName() + ": " + e.getMessage());
        }
    }
}
