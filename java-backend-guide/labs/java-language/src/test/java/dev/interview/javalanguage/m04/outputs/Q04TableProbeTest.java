package dev.interview.javalanguage.m04.outputs;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

// Q04.09, Q04.10 and Q04.13 read HashMap's private table, so each probe runs in a child JVM
// (OpenedJavaUtilJvm). The printed lines are the claims the guide makes, so they stay literal.
class Q04TableProbeTest {

    @Test
    @DisplayName(
            "Q04.09 · the null key sits in bin 0, and spreading sends hashes that differ only above bit 15 to bins 1, 2 and 3")
    void q04_09_printsBinIndexes() throws Exception {
        List<String> lines = OpenedJavaUtilJvm.run(Q04_09.class);

        assertThat(lines)
                .containsExactly(
                        "table: 16 buckets",
                        "null -> bin 0",
                        "0x11 -> bin 1",
                        "0x10000 -> bin 1",
                        "0x20000 -> bin 2",
                        "0x30000 -> bin 3");
    }

    @Test
    @DisplayName("Q04.10 · new HashMap<>(n) takes a capacity and HashMap.newHashMap(n) an expected number of mappings")
    void q04_10_printsTableGrowth() throws Exception {
        List<String> lines = OpenedJavaUtilJvm.run(Q04_10.class);

        assertThat(lines)
                .containsExactly(
                        "new HashMap<>(10): 0 buckets, 16 after put 1, 32 on put 13",
                        "HashMap.newHashMap(10): 0 buckets, 16 after put 1, 32 on put 13",
                        "new HashMap<>(13): 0 buckets, 16 after put 1, 32 on put 13",
                        "HashMap.newHashMap(13): 0 buckets, 32 after put 1, 64 on put 25");
    }

    @Test
    @DisplayName("Q04.13 · filling 100,000 mappings from the default size doubles 14 times; newHashMap never resizes")
    void q04_13_countsResizes() throws Exception {
        List<String> lines = OpenedJavaUtilJvm.run(Q04_13.class);

        assertThat(lines)
                .containsExactly(
                        "new HashMap<>(): 14 resizes, 196610 nodes moved, final table 262144",
                        "HashMap.newHashMap(100000): 0 resizes, 0 nodes moved, final table 262144");
    }
}
