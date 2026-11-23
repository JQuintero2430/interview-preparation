package dev.interview.javalanguage.m05.s09;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class ResultPipelineTest {

    @TempDir
    Path dir;

    @Test
    @DisplayName("M05 §9 · a Result-per-element pipeline keeps every failure")
    void lineCounts_keepsEverySuccessAndFailure() throws IOException {
        Path twoLines = Files.writeString(dir.resolve("a.log"), "x\ny\n");
        Path missingOne = dir.resolve("gone-1.log");
        Path oneLine = Files.writeString(dir.resolve("b.log"), "z\n");
        Path missingTwo = dir.resolve("gone-2.log");

        List<Result<Long>> results = LineScanner.lineCounts(List.of(twoLines, missingOne, oneLine, missingTwo));

        assertThat(results).hasSize(4);
        assertThat(results.get(0)).isEqualTo(new Result.Success<>(2L));
        assertThat(results.get(2)).isEqualTo(new Result.Success<>(1L));
        assertThat(List.of(results.get(1), results.get(3)))
                .allSatisfy(r -> assertThat(r).isInstanceOf(Result.Failure.class))
                .extracting(r -> ((Result.Failure<Long>) r).error())
                .allSatisfy(e -> assertThat(e).isInstanceOf(NoSuchFileException.class))
                .extracting(Throwable::getMessage)
                .containsExactly(missingOne.toString(), missingTwo.toString());
    }
}
