package dev.interview.javalanguage.m02.s03;

/** Module 02 §3: a getClass-based equals that stays symmetric but rejects every subclass instance. */
public class GetClassPoint {

    private final int x;
    private final int y;

    public GetClassPoint(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int x() {
        return x;
    }

    public int y() {
        return y;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || o.getClass() != getClass()) {
            return false;
        }
        GetClassPoint other = (GetClassPoint) o;
        return x == other.x && y == other.y;
    }

    @Override
    public int hashCode() {
        return 31 * x + y;
    }
}
