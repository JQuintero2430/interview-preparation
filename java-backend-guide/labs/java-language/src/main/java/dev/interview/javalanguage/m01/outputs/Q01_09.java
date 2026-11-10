package dev.interview.javalanguage.m01.outputs;

// Q01.09: labeled break and continue, String switch fall-through and null selector.
public final class Q01_09 {

    private Q01_09() {}

    public static void main(String[] args) {
        outer:
        for (int row = 0; row < 3; row++) {
            for (int col = 0; col < 3; col++) {
                if (col > row) {
                    continue outer;
                }
                if (row == 2) {
                    break outer;
                }
                System.out.println(row + "," + col);
            }
        }
        String plan = "pro";
        switch (plan) {
            case "pro":
                System.out.println("pro");
            case "basic":
                System.out.println("basic");
                break;
            default:
                System.out.println("free");
        }
        String missing = null;
        try {
            switch (missing) {
                case "pro":
                    System.out.println("pro");
                    break;
                default:
                    System.out.println("free");
            }
        } catch (NullPointerException e) {
            System.out.println("NullPointerException");
        }
    }
}
