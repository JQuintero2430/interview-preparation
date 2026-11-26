package dev.interview.javalanguage.m06.outputs;

// Module 06 Q06.16: a literal is resolved when first used, so a string interned earlier becomes the literal's
// value (JVMS §5.1). HotSpot resolves string constants lazily; another JVM may resolve them earlier.
public final class Q06_16 {

    private Q06_16() {}

    public record InternFirst(boolean internKeptTheBuiltObject, boolean literalIsTheBuiltObject) {}

    @SuppressWarnings("StringEquality")
    public static InternFirst internBeforeTheLiteralIsUsed() {
        String built = new StringBuilder("q06-16-").append("first-intern").toString();
        String pooled = built.intern();
        String literal = "q06-16-first-intern";
        return new InternFirst(pooled == built, literal == built);
    }
}
