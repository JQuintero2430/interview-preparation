package dev.interview.javalanguage.m01.s05;

// Module 01 §5: a superclass constructor calls an overridable hook; Java 25 lets a subclass set its state first.
public final class Widgets {

    private Widgets() {}

    public abstract static class Widget {
        private final String label;

        protected Widget() {
            this.label = describe(); // overridable call: runs before the subclass constructor body
        }

        protected String describe() {
            return "widget";
        }

        public String label() {
            return label;
        }
    }

    // Classic order: implicit super() runs the hook while cents still holds its default 0.
    public static final class LateWidget extends Widget {
        private final long cents;

        public LateWidget(long cents) {
            this.cents = cents;
        }

        @Override
        protected String describe() {
            return "widget@" + cents;
        }
    }

    // Flexible constructor body (JEP 513, final in Java 25): validate and assign in the prologue, then super().
    public static final class EarlyWidget extends Widget {
        private final long cents;

        public EarlyWidget(long cents) {
            if (cents < 0) {
                throw new IllegalArgumentException("cents must not be negative");
            }
            this.cents = cents;
            super();
        }

        public EarlyWidget() {
            this(0);
        }

        @Override
        protected String describe() {
            return "widget@" + cents;
        }
    }
}
