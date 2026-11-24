package dev.interview.javalanguage.m06.s02;

import java.io.FileNotFoundException;
import java.io.IOException;

// Handlers are tried left to right and the first compatible one wins (JLS §14.20.1).
public final class CatchSelection {

    @FunctionalInterface
    public interface Action {
        void run() throws Exception;
    }

    private CatchSelection() {}

    public static String handle(Action action) {
        try {
            action.run();
            return "completed";
        } catch (FileNotFoundException e) {
            return "missing file";
        } catch (IOException e) {
            return "other I/O failure";
        } catch (RuntimeException e) {
            return "bug";
        } catch (Exception e) {
            return "other checked";
        }
    }
}
