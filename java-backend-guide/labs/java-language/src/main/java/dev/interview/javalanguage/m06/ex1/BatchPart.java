package dev.interview.javalanguage.m06.ex1;

// The two sinks every batch is written to: the records, then a manifest that names how many there were.
public enum BatchPart {
    DATA(".csv"),
    MANIFEST(".manifest");

    private final String fileSuffix;

    BatchPart(String fileSuffix) {
        this.fileSuffix = fileSuffix;
    }

    public String fileSuffix() {
        return fileSuffix;
    }
}
