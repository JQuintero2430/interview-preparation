package dev.interview.javalanguage.m06.outputs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.interview.javalanguage.m06.outputs.Q06_24.CleanupReport;
import dev.interview.javalanguage.m06.outputs.Q06_25.CartSession;
import dev.interview.javalanguage.m06.s07.CharsetReport;
import dev.interview.javalanguage.m06.support.ChildJvm;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.InvalidObjectException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.ObjectStreamClass;
import java.io.ObjectStreamField;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.RandomAccessFile;
import java.io.Reader;
import java.io.StringReader;
import java.io.Writer;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.NotDirectoryException;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.ResourceBundle;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

// Claims made by the answers of Q06.22 to Q06.26; the expected values are the ones the answers state.
class Q06IoQuestionsTest {

    private static final Charset WINDOWS_1252 = Charset.forName("windows-1252");
    private static final Map<String, String> C_LOCALE = Map.of("LC_ALL", "C", "LANG", "C");
    private static final String BUNDLE = "m06.Messages";

    @TempDir
    Path dir;

    @Test
    @DisplayName("Q06.22 · UTF-8 written by the upgraded side and read as windows-1252 gives JosÃ©")
    void q06_22_mixedDefaults_giveMojibake() throws IOException {
        ByteArrayOutputStream staging = new ByteArrayOutputStream();
        try (Writer writer = new OutputStreamWriter(staging, StandardCharsets.UTF_8)) {
            writer.write("José");
        }
        String read;
        try (Reader reader = new InputStreamReader(new ByteArrayInputStream(staging.toByteArray()), WINDOWS_1252)) {
            read = new String(readAll(reader));
        }

        assertThat(Q06_22.hex("José", StandardCharsets.UTF_8)).isEqualTo("4a 6f 73 c3 a9");
        assertThat(Q06_22.hex("José", StandardCharsets.ISO_8859_1)).isEqualTo("4a 6f 73 e9");
        assertThat(read).isEqualTo("JosÃ©");
        assertThat(Q06_22.hex("JosÃ©", StandardCharsets.UTF_8)).isEqualTo("4a 6f 73 c3 83 c2 a9");
    }

    @Test
    @DisplayName("Q06.22 · -Dfile.encoding=ISO-8859-1 in JAVA_TOOL_OPTIONS is picked up and still sets the default")
    void q06_22_toolOptions_changeTheDefault() throws Exception {
        Map<String, String> environment = new java.util.HashMap<>(C_LOCALE);
        environment.put("JAVA_TOOL_OPTIONS", "-Dfile.encoding=ISO-8859-1");

        ChildJvm.Result result = ChildJvm.run(CharsetReport.class, environment, List.of());

        assertThat(result.exitCode()).isZero();
        assertThat(result.lines())
                .contains("Picked up JAVA_TOOL_OPTIONS: -Dfile.encoding=ISO-8859-1")
                .contains("default=ISO-8859-1");
    }

    @Test
    @DisplayName("Q06.22 · -XshowSettings:properties prints the JVM's file.encoding")
    void q06_22_showSettings_printsFileEncoding() throws Exception {
        ChildJvm.Result result =
                ChildJvm.run(CharsetReport.class, C_LOCALE, List.of("-XshowSettings:properties", "-version"));

        assertThat(result.exitCode()).isZero();
        assertThat(result.lines()).anyMatch(line -> line.strip().equals("file.encoding = UTF-8"));
        assertThat(result.lines()).noneMatch(line -> line.startsWith("default="));
    }

    @Test
    @DisplayName("Q06.22 · undoing the wrong decode repairs mojibake and leaves text that is not mojibake alone")
    void q06_22_undoWrongDecode() {
        String brokenO = new String("Ó".getBytes(StandardCharsets.UTF_8), WINDOWS_1252);

        assertThat(Q06_22.undoWrongDecode("JosÃ©", WINDOWS_1252)).contains("José");
        assertThat(Q06_22.undoWrongDecode("JosÃ©", StandardCharsets.ISO_8859_1)).contains("José");
        assertThat(brokenO).isEqualTo("Ã\u201C");
        assertThat(Q06_22.undoWrongDecode(brokenO, WINDOWS_1252)).contains("Ó");
        assertThat(Q06_22.undoWrongDecode(brokenO, StandardCharsets.ISO_8859_1)).isEmpty();
        assertThat(Q06_22.undoWrongDecode("José", WINDOWS_1252)).isEmpty();
        assertThat(Q06_22.undoWrongDecode("JOÃO", WINDOWS_1252)).isEmpty();
        assertThat(Q06_22.undoWrongDecode("Jose", WINDOWS_1252)).contains("Jose");
    }

    @Test
    @DisplayName("Q06.22 · converting every row with new String(getBytes(ISO_8859_1), UTF_8) breaks the correct ones")
    void q06_22_blanketConversion_breaksCorrectRows() {
        String converted = new String("José".getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);

        assertThat(converted).isEqualTo("Jos\uFFFD");
    }

    @Test
    @DisplayName("Q06.22 · windows-1252 leaves five byte values undefined, so some mojibake cannot be undone")
    void q06_22_windows1252_isNotReversible() {
        String decoded = new String("Á".getBytes(StandardCharsets.UTF_8), WINDOWS_1252);
        byte[] undefined = {(byte) 0x81, (byte) 0x8D, (byte) 0x8F, (byte) 0x90, (byte) 0x9D};

        assertThat(decoded).isEqualTo("Ã\uFFFD");
        assertThat(Q06_22.undoWrongDecode(decoded, WINDOWS_1252)).isEmpty();
        assertThat(new String(undefined, WINDOWS_1252)).isEqualTo("\uFFFD".repeat(5));
    }

    @Test
    @DisplayName("Q06.23 · the byte loop copies everything although each read returns at most 3 bytes")
    void q06_23_copy_handlesShortReads() throws IOException {
        byte[] data = new byte[20_000];
        Arrays.fill(data, (byte) 0xFF);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        long copied = Q06_23.copy(new TrickleInputStream(new ByteArrayInputStream(data)), out);

        assertThat(copied).isEqualTo(20_000);
        assertThat(out.toByteArray()).isEqualTo(data);
    }

    @Test
    @DisplayName("Q06.23 · readLine returns an empty line as \"\" and the end as null")
    void q06_23_readLines() throws IOException {
        byte[] bytes = "a\r\nb\n\ncafé".getBytes(StandardCharsets.UTF_8);

        assertThat(Q06_23.readLines(new ByteArrayInputStream(bytes), StandardCharsets.UTF_8))
                .containsExactly("a", "b", "", "café");
    }

    @Test
    @DisplayName("Q06.23 · Reader.read returns UTF-16 code units: an emoji is two reads, then -1")
    void q06_23_readerRead_returnsCodeUnits() throws IOException {
        Reader reader = new StringReader("é😀");

        assertThat(List.of(reader.read(), reader.read(), reader.read(), reader.read()))
                .containsExactly(0xE9, 0xD83D, 0xDE00, -1);
    }

    @Test
    @DisplayName("Q06.23 · PrintWriter swallows the IOException and reports it only through checkError")
    void q06_23_printWriter_swallowsErrors() {
        PrintWriter writer = new PrintWriter(new FailingWriter());

        writer.println("lost");
        writer.flush();

        assertThat(writer.checkError()).isTrue();
    }

    @Test
    @DisplayName("Q06.24 · the Files cleanup deletes what exists, ignores what is absent, and says why the rest failed")
    void q06_24_cleanupReport() throws IOException {
        Path processed = Files.writeString(dir.resolve("done.csv"), "x");
        Path missing = dir.resolve("missing.csv");
        Path nonEmpty = Files.createDirectory(dir.resolve("archive"));
        Files.writeString(nonEmpty.resolve("keep.csv"), "y");

        CleanupReport report = Q06_24.deleteAll(List.of(processed, missing, nonEmpty));

        assertThat(report.deleted()).containsExactly(processed);
        assertThat(report.failures()).containsOnlyKeys(nonEmpty);
        assertThat(report.failures().get(nonEmpty)).isEqualTo("DirectoryNotEmptyException: " + nonEmpty);
    }

    @Test
    @DisplayName("Q06.24 · File answers with null, false or 0; Files throws an exception that names the problem")
    void q06_24_fileVsFiles_errorReporting() throws IOException {
        Path regular = Files.writeString(dir.resolve("a.txt"), "x");
        Path noParent = dir.resolve("no/such/child");
        Path missing = dir.resolve("missing.txt");

        assertThat(regular.toFile().listFiles()).isNull();
        assertThatThrownBy(() -> Files.list(regular)).isInstanceOf(NotDirectoryException.class);
        assertThat(noParent.toFile().mkdir()).isFalse();
        assertThatThrownBy(() -> Files.createDirectory(noParent)).isInstanceOf(NoSuchFileException.class);
        assertThat(Files.isDirectory(Files.createDirectories(noParent))).isTrue();
        assertThat(missing.toFile().lastModified()).isZero();
        assertThatThrownBy(() -> Files.getLastModifiedTime(missing)).isInstanceOf(NoSuchFileException.class);
    }

    @Test
    @DisplayName("Q06.24 · Files.move refuses an existing target unless REPLACE_EXISTING is given")
    void q06_24_move_refusesExistingTarget() throws IOException {
        Path source = Files.writeString(dir.resolve("new.csv"), "new");
        Path target = Files.writeString(dir.resolve("old.csv"), "old");

        assertThatThrownBy(() -> Files.move(source, target)).isInstanceOf(FileAlreadyExistsException.class);
        assertThat(Files.readString(target)).isEqualTo("old");
    }

    @Test
    @DisplayName("Q06.24 · a RandomAccessFile and its channel share one position")
    void q06_24_randomAccessFile_sharesPositionWithChannel() throws IOException {
        File file = Files.writeString(dir.resolve("r.bin"), "0123456789").toFile();
        try (RandomAccessFile raf = new RandomAccessFile(file, "rw")) {
            FileChannel channel = raf.getChannel();

            raf.seek(4);
            long afterSeek = channel.position();
            channel.position(8);
            int read = raf.read();

            assertThat(afterSeek).isEqualTo(4);
            assertThat((char) read).isEqualTo('8');
            assertThat(channel.read(ByteBuffer.allocate(1), 0)).isEqualTo(1);
            assertThat(raf.getFilePointer()).isEqualTo(9);
        }
    }

    @Test
    @DisplayName("Q06.25 · transient fields read back as their type's default: 0, false and null")
    void q06_25_transientDefaults() throws Exception {
        CartSession read = roundTrip(new CartSession("u-1", List.of("book", "pen"), "secret-token"));

        assertThat(read.userId()).isEqualTo("u-1");
        assertThat(read.items()).containsExactly("book", "pen");
        assertThat(read.cachedTotal()).isZero();
        assertThat(read.dirty()).isFalse();
        assertThat(read.accessToken()).isNull();
    }

    @Test
    @DisplayName(
            "Q06.25 · the serial form has neither static nor transient fields; the stream carries the class name and serialVersionUID")
    void q06_25_serialForm() throws Exception {
        ObjectStreamClass descriptor = ObjectStreamClass.lookup(CartSession.class);
        byte[] bytes = serialize(new CartSession("u-1", List.of("book"), "secret-token"));
        byte[] uid =
                ByteBuffer.allocate(Long.BYTES).putLong(0x0CA7_5E55_1000_0001L).array();

        assertThat(Arrays.stream(descriptor.getFields()).map(ObjectStreamField::getName))
                .containsExactlyInAnyOrder("userId", "items");
        assertThat(descriptor.getSerialVersionUID()).isEqualTo(0x0CA7_5E55_1000_0001L);
        assertThat(indexOf(bytes, uid)).isPositive();
        assertThat(indexOf(bytes, CartSession.class.getName().getBytes(StandardCharsets.UTF_8)))
                .isPositive();
        assertThat(indexOf(bytes, "secret-token".getBytes(StandardCharsets.UTF_8)))
                .isEqualTo(-1);
    }

    @Test
    @DisplayName("Q06.25 · reading does not run the constructor; readObject rejects edited bytes with a blank userId")
    void q06_25_readObject_validates() throws Exception {
        byte[] bytes = serialize(new CartSession("u-1", List.of("book"), null));
        int createdBefore = CartSession.created;
        CartSession copy = deserialize(bytes);
        int at = indexOf(bytes, "u-1".getBytes(StandardCharsets.UTF_8));
        bytes[at] = ' ';
        bytes[at + 1] = ' ';
        bytes[at + 2] = ' ';

        assertThat(CartSession.created).isEqualTo(createdBefore);
        assertThat(copy.userId()).isEqualTo("u-1");
        assertThatThrownBy(() -> deserialize(bytes))
                .isInstanceOf(InvalidObjectException.class)
                .hasMessage("userId is required");
    }

    @Test
    @DisplayName("Q06.26 · the candidate locales for fr_CA are fr_CA, fr and the root")
    void q06_26_candidateLocales() {
        ResourceBundle.Control control = ResourceBundle.Control.getControl(ResourceBundle.Control.FORMAT_DEFAULT);

        assertThat(control.getCandidateLocales(BUNDLE, Locale.CANADA_FRENCH))
                .containsExactly(Locale.CANADA_FRENCH, Locale.FRENCH, Locale.ROOT);
    }

    @Test
    @DisplayName("Q06.26 · the release check lists the base keys a locale's own chain does not translate")
    void q06_26_untranslatedKeys() {
        assertThat(Q06_26.untranslatedKeys(BUNDLE, Locale.CANADA_FRENCH)).containsExactly("appName");
        assertThat(Q06_26.untranslatedKeys(BUNDLE, Locale.GERMANY)).containsExactly("appName", "orderLine");
        assertThat(Q06_26.untranslatedKeys(BUNDLE, Locale.ITALY))
                .containsExactly("appName", "farewell", "greeting", "orderLine");
    }

    @Test
    @DisplayName("Q06.26 · getBundle caches: a second call returns the same bundle instance")
    void q06_26_bundlesAreCached() {
        ResourceBundle first = ResourceBundle.getBundle(BUNDLE, Locale.FRENCH);

        assertThat(ResourceBundle.getBundle(BUNDLE, Locale.FRENCH)).isSameAs(first);
    }

    private static char[] readAll(Reader reader) throws IOException {
        StringBuilder text = new StringBuilder();
        int c;
        while ((c = reader.read()) != -1) {
            text.append((char) c);
        }
        return text.toString().toCharArray();
    }

    private static byte[] serialize(Object value) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(value);
        }
        return bytes.toByteArray();
    }

    private static CartSession deserialize(byte[] bytes) throws IOException, ClassNotFoundException {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
            return (CartSession) in.readObject();
        }
    }

    private static CartSession roundTrip(CartSession session) throws IOException, ClassNotFoundException {
        return deserialize(serialize(session));
    }

    private static int indexOf(byte[] haystack, byte[] needle) {
        for (int i = 0; i + needle.length <= haystack.length; i++) {
            if (Arrays.equals(haystack, i, i + needle.length, needle, 0, needle.length)) {
                return i;
            }
        }
        return -1;
    }

    // Returns at most three bytes per read, as a slow socket may.
    private static final class TrickleInputStream extends FilterInputStream {
        TrickleInputStream(InputStream in) {
            super(in);
        }

        @Override
        public int read(byte[] b, int off, int len) throws IOException {
            return super.read(b, off, Math.min(len, 3));
        }
    }

    private static final class FailingWriter extends Writer {
        @Override
        public void write(char[] cbuf, int off, int len) throws IOException {
            throw new IOException("disk full");
        }

        @Override
        public void flush() throws IOException {
            throw new IOException("disk full");
        }

        @Override
        public void close() {}
    }
}
