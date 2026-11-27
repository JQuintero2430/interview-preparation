package dev.interview.javalanguage.m06.ex3;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayInputStream;
import java.io.EOFException;
import java.io.InvalidClassException;
import java.io.InvalidObjectException;
import java.io.ObjectInputFilter;
import java.io.ObjectInputStream;
import java.io.ObjectStreamClass;
import java.io.ObjectStreamField;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.IntStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SessionCodecTest {

    private static final Instant EXPIRES = Instant.parse("2026-11-27T12:00:00Z");
    private static final String SESSION = "dev.interview.javalanguage.m06.ex3.Session";
    private static final String BADGE = "dev.interview.javalanguage.m06.ex3.LoyaltyBadge";

    private final SessionCodec codec = new SessionCodec();

    private static Session session(String... roles) {
        return new Session("user-42", List.of(roles), EXPIRES);
    }

    private static List<String> roles(int count) {
        return IntStream.range(0, count).mapToObj(i -> "role-" + i).toList();
    }

    private static Object nestedLists(int levels) {
        List<Object> list = new ArrayList<>();
        for (int i = 1; i < levels; i++) {
            List<Object> outer = new ArrayList<>();
            outer.add(list);
            list = outer;
        }
        return list;
    }

    private static ObjectInputFilter.Status readWith(String pattern, byte[] bytes) throws Exception {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
            in.setObjectInputFilter(ObjectInputFilter.Config.createFilter(pattern));
            in.readObject();
            return ObjectInputFilter.Status.ALLOWED;
        } catch (InvalidClassException e) {
            return ObjectInputFilter.Status.REJECTED;
        }
    }

    // ---- (1) round trip, transient field, serialVersionUID, readObject validation

    @Test
    @DisplayName("Ex06.3 · (1) a session round-trips and readObject rebuilds the transient admin flag")
    void roundTrip() throws Exception {
        Session admin = session("admin", "support");

        Session copy = codec.decode(codec.encode(admin));

        assertThat(copy).isEqualTo(admin).isNotSameAs(admin);
        assertThat(copy.isAdmin()).isTrue();
        assertThat(codec.decode(codec.encode(session("support"))).isAdmin()).isFalse();
    }

    @Test
    @DisplayName("Ex06.3 · (1) the serialized form declares serialVersionUID 1 and has no admin field")
    void serializedForm() {
        ObjectStreamClass form = ObjectStreamClass.lookup(Session.class);

        assertThat(form.getSerialVersionUID()).isEqualTo(1L);
        assertThat(Arrays.stream(form.getFields()).map(ObjectStreamField::getName))
                .containsExactly("expiresAt", "roles", "userId");
    }

    @Test
    @DisplayName("Ex06.3 · (1) readObject rejects a forged role that is not a String, which the filter allowed")
    void readObjectChecksErasedTypes() throws Exception {
        byte[] forged = Payloads.forge(session("<role>"), Map.of("<role>", new ArrayList<>()));

        assertThatThrownBy(() -> codec.decode(forged))
                .isInstanceOf(CorruptSessionException.class)
                .hasMessageContaining("role is not a String: java.util.ArrayList")
                .cause()
                .isInstanceOf(InvalidObjectException.class);
    }

    @Test
    @DisplayName("Ex06.3 · (1) readObject rejects a forged blank userId, which no constructor checks on read")
    void readObjectChecksTheUser() throws Exception {
        byte[] forged = Payloads.forge(session("support"), Map.of("user-42", " "));

        assertThatThrownBy(() -> codec.decode(forged))
                .isInstanceOf(CorruptSessionException.class)
                .hasMessageContaining("blank userId");
    }

    // ---- (2) per-stream allow-list

    @Test
    @DisplayName("Ex06.3 · (2) a class outside the allow-list is rejected before its readObject runs")
    void unlistedClassRejectedBeforeItsHook() throws Exception {
        byte[] forged = Payloads.forge(session("<role>"), Map.of("<role>", new Probe()));
        int before = Probe.READS.get();

        assertThatThrownBy(() -> codec.decode(forged))
                .isInstanceOf(RejectedSessionException.class)
                .hasMessageContaining("class=" + Probe.class.getName())
                .cause()
                .isInstanceOf(InvalidClassException.class)
                .hasMessage("filter status: REJECTED");
        assertThat(Probe.READS.get()).isEqualTo(before);
    }

    @Test
    @DisplayName(
            "Ex06.3 · (2) the allow-list names runtime classes: a LinkedList in place of the ArrayList is rejected")
    void otherListClassRejected() throws Exception {
        byte[] forged =
                Payloads.replaceFirst(session("support"), ArrayList.class, new LinkedList<>(List.of("support")));

        assertThatThrownBy(() -> codec.decode(forged))
                .isInstanceOf(RejectedSessionException.class)
                .hasMessageContaining("class=java.util.LinkedList");
    }

    @Test
    @DisplayName("Ex06.3 · (2) a stream of allowed classes that is not a Session is rejected, not cast")
    void allowedButNotASession() throws Exception {
        byte[] bytes = Payloads.write(new ArrayList<>(List.of("admin")));

        assertThatThrownBy(() -> codec.decode(bytes))
                .isInstanceOf(RejectedSessionException.class)
                .hasMessageEndingWith("not a Session: java.util.ArrayList");
    }

    @Test
    @DisplayName("Ex06.3 · (2) an honest session stream asks the filter about exactly the five allowed classes")
    void honestStreamClasses() throws Exception {
        List<String> seen = new ArrayList<>();
        try (ObjectInputStream in =
                new ObjectInputStream(new ByteArrayInputStream(codec.encode(session("admin", "support"))))) {
            in.setObjectInputFilter(info -> {
                if (info.serialClass() != null) {
                    seen.add(info.serialClass().getName());
                }
                return ObjectInputFilter.Status.UNDECIDED;
            });
            in.readObject();
        }

        assertThat(seen)
                .containsExactly(
                        SESSION, "java.time.Ser", "java.time.Instant", "java.util.ArrayList", "[Ljava.lang.Object;");
    }

    @Test
    @DisplayName("Ex06.3 · (2) without java.lang.Object in the list, a session with no roles passes and one role fails")
    void objectArrayTrap() throws Exception {
        String withoutObject = SessionCodec.PATTERN.replace(";java.lang.Object", "");

        assertThat(readWith(withoutObject, codec.encode(session()))).isEqualTo(ObjectInputFilter.Status.ALLOWED);
        assertThat(readWith(withoutObject, codec.encode(session("support"))))
                .isEqualTo(ObjectInputFilter.Status.REJECTED);
        assertThat(readWith(SessionCodec.PATTERN, codec.encode(session("support"))))
                .isEqualTo(ObjectInputFilter.Status.ALLOWED);
    }

    // ---- (3) limits: depth, array length, references, bytes

    @Test
    @DisplayName("Ex06.3 · (3) lists nested past maxdepth are rejected even though every class is allowed")
    void depthLimit() throws Exception {
        byte[] forged = Payloads.forge(session("<role>"), Map.of("<role>", nestedLists(5)));

        assertThatThrownBy(() -> codec.decode(forged))
                .isInstanceOf(RejectedSessionException.class)
                .hasMessageContaining("depth=" + (SessionCodec.MAX_DEPTH + 1));
    }

    @Test
    @DisplayName("Ex06.3 · (3) a repeated role is a back-reference checked at depth 3, so maxdepth 2 would reject it")
    void honestDepthIsThree() throws Exception {
        String role = "support";
        byte[] bytes = codec.encode(new Session("user-42", List.of(role, role), EXPIRES));

        assertThat(codec.decode(bytes).roles()).containsExactly("support", "support");
        assertThat(readWith(SessionCodec.PATTERN.replace("maxdepth=3", "maxdepth=2"), bytes))
                .isEqualTo(ObjectInputFilter.Status.REJECTED);
    }

    @Test
    @DisplayName("Ex06.3 · (3) maxarray allows 64 roles and rejects a forged list of 65")
    void arrayLimit() throws Exception {
        assertThat(codec.decode(codec.encode(new Session("user-42", roles(64), EXPIRES)))
                        .roles())
                .hasSize(64);

        byte[] forged = Payloads.replaceFirst(session("support"), ArrayList.class, new ArrayList<>(roles(65)));
        assertThatThrownBy(() -> codec.decode(forged))
                .isInstanceOf(RejectedSessionException.class)
                .hasMessageContaining("arrayLength=65");
        assertThatThrownBy(() -> new Session("user-42", roles(65), EXPIRES))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Ex06.3 · (3) a wide graph inside the depth and array limits is rejected by maxrefs")
    void referenceLimit() throws Exception {
        List<Object> wide = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            wide.add(new ArrayList<>(roles(60)));
        }
        byte[] forged = Payloads.replaceFirst(session("support"), ArrayList.class, wide);

        assertThatThrownBy(() -> codec.decode(forged))
                .isInstanceOf(RejectedSessionException.class)
                .satisfies(e -> {
                    Matcher info = Pattern.compile("depth=(\\d+) refs=(\\d+)").matcher(e.getMessage());
                    assertThat(info.find()).isTrue();
                    assertThat(Integer.parseInt(info.group(1))).isLessThanOrEqualTo(SessionCodec.MAX_DEPTH);
                    assertThat(Integer.parseInt(info.group(2))).isGreaterThan(SessionCodec.MAX_REFS);
                });
    }

    @Test
    @DisplayName(
            "Ex06.3 · (3) input over the byte limit is rejected before reading; maxbytes alone misses a long String")
    void byteLimit() throws Exception {
        String huge = "x".repeat(SessionCodec.MAX_BYTES);
        byte[] forged = Payloads.forge(session("<role>"), Map.of("<role>", huge));

        assertThat(forged.length).isGreaterThan(SessionCodec.MAX_BYTES);
        assertThatThrownBy(() -> codec.decode(forged))
                .isInstanceOf(RejectedSessionException.class)
                .hasMessageContaining("over the 16384-byte limit");
        // Strings never call the filter, and nothing is checked after the last role: the stream filter accepts it.
        assertThat(readWith(SessionCodec.PATTERN, forged)).isEqualTo(ObjectInputFilter.Status.ALLOWED);
        assertThatThrownBy(() -> codec.encode(new Session("user-42", List.of(huge), EXPIRES)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("over the 16384-byte limit");
    }

    // ---- (4) translation into domain exceptions

    private static final String OLD_SESSION_UID_2 = """
            package dev.interview.javalanguage.m06.ex3;
            public final class Session implements java.io.Serializable {
                private static final long serialVersionUID = 2L;
                private final String userId = "user-42";
                private final java.util.List<String> roles = new java.util.ArrayList<>();
                private final java.time.Instant expiresAt = java.time.Instant.EPOCH;
            }
            """;

    private static final String OLD_SESSION_WITH_BADGE = """
            package dev.interview.javalanguage.m06.ex3;
            public final class Session implements java.io.Serializable {
                private static final long serialVersionUID = 1L;
                private final String userId = "user-42";
                private final java.util.List<String> roles = new java.util.ArrayList<>();
                private final java.time.Instant expiresAt = java.time.Instant.EPOCH;
                private final LoyaltyBadge badge = new LoyaltyBadge();
            }
            """;

    private static final String LOYALTY_BADGE = """
            package dev.interview.javalanguage.m06.ex3;
            public final class LoyaltyBadge implements java.io.Serializable {
                private static final long serialVersionUID = 1L;
            }
            """;

    private static byte[] writtenBy(ClassLoader oldRelease) throws Exception {
        Class<?> oldSession = oldRelease.loadClass(SESSION);
        assertThat(oldSession).isNotSameAs(Session.class);
        var constructor = oldSession.getDeclaredConstructor();
        constructor.setAccessible(true);
        return Payloads.write(constructor.newInstance());
    }

    @Test
    @DisplayName("Ex06.3 · (4) bytes from a release with another serialVersionUID become IncompatibleSessionException")
    void otherSerialVersionUid() throws Exception {
        byte[] old =
                writtenBy(OldRelease.compile(Map.of("dev/interview/javalanguage/m06/ex3/Session", OLD_SESSION_UID_2)));

        assertThatThrownBy(() -> codec.decode(old))
                .isInstanceOf(IncompatibleSessionException.class)
                .cause()
                .isInstanceOf(InvalidClassException.class)
                .hasMessageContaining("local class incompatible")
                .hasMessageContaining("stream classdesc serialVersionUID = 2")
                .hasMessageContaining("local class serialVersionUID = 1");
    }

    @Test
    @DisplayName(
            "Ex06.3 · (4) an entry whose class this release deleted fails with ClassNotFoundException as the cause")
    void deletedClass() throws Exception {
        ClassLoader oldRelease =
                OldRelease.compile(Map.of("dev/interview/javalanguage/m06/ex3/LoyaltyBadge", LOYALTY_BADGE));
        byte[] old = Payloads.write(oldRelease.loadClass(BADGE).getConstructor().newInstance());

        assertThatThrownBy(() -> codec.decode(old))
                .isInstanceOf(IncompatibleSessionException.class)
                .cause()
                .isInstanceOf(ClassNotFoundException.class)
                .hasMessageContaining("LoyaltyBadge");
    }

    @Test
    @DisplayName("Ex06.3 · (4) a field whose class this release deleted is skipped, so the session still decodes")
    void deletedFieldClassIsSkipped() throws Exception {
        byte[] old = writtenBy(OldRelease.compile(Map.of(
                "dev/interview/javalanguage/m06/ex3/Session", OLD_SESSION_WITH_BADGE,
                "dev/interview/javalanguage/m06/ex3/LoyaltyBadge", LOYALTY_BADGE)));

        Session decoded = codec.decode(old);

        assertThat(decoded.userId()).isEqualTo("user-42");
        assertThat(decoded.expiresAt()).isEqualTo(Instant.EPOCH);
    }

    @Test
    @DisplayName("Ex06.3 · (4) truncated bytes become CorruptSessionException, with the EOFException as the cause")
    void truncated() {
        byte[] bytes = codec.encode(session("support"));
        byte[] truncated = Arrays.copyOf(bytes, bytes.length - 4);

        assertThatThrownBy(() -> codec.decode(truncated))
                .isInstanceOf(CorruptSessionException.class)
                .cause()
                .isInstanceOf(EOFException.class);
    }

    @Test
    @DisplayName("Ex06.3 · (4) every decoding failure is a checked SessionDecodingException with three sealed subtypes")
    void exceptionHierarchy() {
        assertThat(Exception.class).isAssignableFrom(SessionDecodingException.class);
        assertThat(RuntimeException.class.isAssignableFrom(SessionDecodingException.class))
                .isFalse();
        assertThat(SessionDecodingException.class.getPermittedSubclasses())
                .containsExactlyInAnyOrder(
                        RejectedSessionException.class,
                        IncompatibleSessionException.class,
                        CorruptSessionException.class);
    }
}
