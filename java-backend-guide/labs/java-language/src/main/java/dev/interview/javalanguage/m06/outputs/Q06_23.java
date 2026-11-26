package dev.interview.javalanguage.m06.outputs;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;

// Q06.23: the byte loop and the text loop, each ending on its own end-of-stream value.
public final class Q06_23 {

    private static final int CHUNK = 8192;

    private Q06_23() {}

    // Bytes stay bytes: no charset anywhere. read may return fewer bytes than asked for; only -1 ends.
    public static long copy(InputStream in, OutputStream out) throws IOException {
        byte[] buffer = new byte[CHUNK];
        long total = 0;
        int count;
        while ((count = in.read(buffer)) != -1) {
            out.write(buffer, 0, count);
            total += count;
        }
        return total;
    }

    // Bytes, then the bridge (the one place the charset enters), then the buffer that provides readLine.
    public static List<String> readLines(InputStream in, Charset charset) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(in, charset))) {
            List<String> lines = new ArrayList<>();
            String line;
            while ((line = reader.readLine()) != null) {
                lines.add(line);
            }
            return lines;
        }
    }
}
