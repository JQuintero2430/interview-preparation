package dev.interview.javalanguage.m06.outputs;

import java.io.Serial;

// Module 06 Q06.08: a wrapper exception whose cause constructor forgets to pass the cause on.
public final class Q06_08 {

    private Q06_08() {}

    // The bug: the constructor accepts a cause and never hands it to super, so getCause() is null.
    public static final class LossyExportException extends RuntimeException {
        @Serial
        private static final long serialVersionUID = 1L;

        public LossyExportException(String message, Throwable cause) {
            super(message);
        }
    }

    // The fix: the cause goes to the Throwable constructor, which keeps it for getCause and printStackTrace.
    public static final class BatchExportException extends RuntimeException {
        @Serial
        private static final long serialVersionUID = 1L;

        public BatchExportException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
