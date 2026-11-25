package dev.interview.javalanguage.m06.s07;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.MalformedInputException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class PartnerFeedTest {

    @Test
    @DisplayName("M06 §7 · the feed is read with the declared charset")
    void readsWithDeclaredCharset(@TempDir Path dir) throws Exception {
        Path utf8 = Files.writeString(dir.resolve("utf8.csv"), "id,name\n1,José\n", StandardCharsets.UTF_8);
        Path latin1 = Files.writeString(dir.resolve("latin1.csv"), "id,name\n1,José\n", StandardCharsets.ISO_8859_1);

        assertThat(PartnerFeed.readLines(utf8, StandardCharsets.UTF_8)).containsExactly("id,name", "1,José");
        assertThat(PartnerFeed.readLines(latin1, StandardCharsets.ISO_8859_1)).containsExactly("id,name", "1,José");
    }

    @Test
    @DisplayName("M06 §7 · a file in the wrong charset is rejected, not silently repaired")
    void wrongCharset_isRejectedWithCause(@TempDir Path dir) throws Exception {
        Path latin1 = Files.writeString(dir.resolve("latin1.csv"), "1,José\n", StandardCharsets.ISO_8859_1);

        assertThatThrownBy(() -> PartnerFeed.readLines(latin1, StandardCharsets.UTF_8))
                .isInstanceOf(FeedEncodingException.class)
                .hasMessage("latin1.csv is not valid UTF-8")
                .hasCauseInstanceOf(MalformedInputException.class);
    }

    @Test
    @DisplayName("M06 §7 · a leading UTF-8 BOM is dropped from the first line only")
    void leadingBom_isDropped(@TempDir Path dir) throws Exception {
        Path file = Files.writeString(dir.resolve("bom.csv"), "﻿id,name\n1,Ana\n", StandardCharsets.UTF_8);

        assertThat(Files.readAllLines(file).getFirst()).startsWith("﻿");
        assertThat(PartnerFeed.readLines(file, StandardCharsets.UTF_8)).containsExactly("id,name", "1,Ana");
    }

    @Test
    @DisplayName("M06 §7 · decomposed accents are normalized to NFC")
    void decomposedText_isNormalized(@TempDir Path dir) throws Exception {
        Path file = Files.writeString(dir.resolve("nfd.csv"), "1,José\n", StandardCharsets.UTF_8);

        assertThat(PartnerFeed.readLines(file, StandardCharsets.UTF_8)).containsExactly("1,José");
    }
}
