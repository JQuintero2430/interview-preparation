package dev.interview.javalanguage.m06.s09;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.NotSerializableException;
import java.io.Serial;
import java.io.Serializable;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SerializationBasicsTest {

    static final class Node implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        final String name;
        Node next;

        Node(String name) {
            this.name = name;
        }
    }

    record Pair(Node left, Node right) implements Serializable {}

    @Test
    @DisplayName("M06 §9 · a round trip keeps shared references and cycles")
    void sharedReferencesAndCycles() throws Exception {
        Node a = new Node("a");
        Node b = new Node("b");
        a.next = b;
        b.next = a;

        Pair copy = (Pair) SerialBytes.read(SerialBytes.write(new Pair(a, a)));

        assertThat(copy.left()).isNotSameAs(a);
        assertThat(copy.left()).isSameAs(copy.right());
        assertThat(copy.left().next.name).isEqualTo("b");
        assertThat(copy.left().next.next).isSameAs(copy.left());
    }

    static final class Session implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        static int activeSessions;
        final String user;
        transient String accessToken;

        Session(String user, String accessToken) {
            this.user = user;
            this.accessToken = accessToken;
        }
    }

    @Test
    @DisplayName("M06 §9 · transient and static fields are not restored")
    void transientAndStaticNotWritten() throws Exception {
        Session.activeSessions = 5;
        byte[] bytes = SerialBytes.write(new Session("ana", "secret-token"));
        Session.activeSessions = 9;

        Session copy = (Session) SerialBytes.read(bytes);

        assertThat(copy.user).isEqualTo("ana");
        assertThat(copy.accessToken).isNull();
        assertThat(Session.activeSessions).isEqualTo(9);
    }

    static class Base {
        static final AtomicInteger CONSTRUCTED = new AtomicInteger();
        String origin;

        Base() {
            CONSTRUCTED.incrementAndGet();
            origin = "set by Base()";
        }
    }

    static final class Account extends Base implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        static final AtomicInteger CONSTRUCTED = new AtomicInteger();
        final String id;

        Account(String id) {
            CONSTRUCTED.incrementAndGet();
            this.id = id;
            origin = "set by Account(id)";
        }
    }

    @Test
    @DisplayName("M06 §9 · a non-serializable superclass's no-arg constructor runs on read")
    void nonSerializableSuperclassConstructorRuns() throws Exception {
        byte[] bytes = SerialBytes.write(new Account("acc-1"));
        int baseBefore = Base.CONSTRUCTED.get();
        int accountBefore = Account.CONSTRUCTED.get();

        Account copy = (Account) SerialBytes.read(bytes);

        assertThat(Base.CONSTRUCTED.get()).isEqualTo(baseBefore + 1);
        assertThat(Account.CONSTRUCTED.get()).isEqualTo(accountBefore);
        assertThat(copy.id).isEqualTo("acc-1");
        assertThat(copy.origin).isEqualTo("set by Base()");
    }

    static final class Clock {}

    static final class Order implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        final String id = "o-1";
        final Clock clock = new Clock();
    }

    @Test
    @DisplayName("M06 §9 · a field of a non-serializable type fails with NotSerializableException naming the class")
    void nonSerializableField() {
        assertThatThrownBy(() -> SerialBytes.write(new Order()))
                .isInstanceOf(NotSerializableException.class)
                .hasMessageContaining(Clock.class.getName());
    }

    static final class Probe implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        static final AtomicInteger HOOK_RUNS = new AtomicInteger();

        @Serial
        private void readObject(java.io.ObjectInputStream in) throws java.io.IOException, ClassNotFoundException {
            in.defaultReadObject();
            HOOK_RUNS.incrementAndGet();
        }
    }

    @Test
    @DisplayName("M06 §9 · a class's readObject hook runs inside readObject, before the caller's cast can fail")
    void hookRunsBeforeTheCallerSeesTheObject() throws Exception {
        byte[] bytes = SerialBytes.write(new Probe());
        int before = Probe.HOOK_RUNS.get();

        assertThatThrownBy(() -> {
                    String expected = (String) SerialBytes.read(bytes);
                    assertThat(expected).isNotNull();
                })
                .isInstanceOf(ClassCastException.class);
        assertThat(Probe.HOOK_RUNS.get()).isEqualTo(before + 1);
    }

    static final class Registry implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        static final Registry INSTANCE = new Registry();

        private Registry() {}

        @Serial
        private Object readResolve() {
            return INSTANCE;
        }
    }

    static final class NaiveRegistry implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        static final NaiveRegistry INSTANCE = new NaiveRegistry();

        private NaiveRegistry() {}
    }

    enum Mode {
        LIVE
    }

    @Test
    @DisplayName("M06 §9 · readResolve keeps a singleton unique")
    void readResolveKeepsSingleton() throws Exception {
        assertThat(SerialBytes.read(SerialBytes.write(Registry.INSTANCE))).isSameAs(Registry.INSTANCE);
        assertThat(SerialBytes.read(SerialBytes.write(NaiveRegistry.INSTANCE))).isNotSameAs(NaiveRegistry.INSTANCE);
        assertThat(SerialBytes.read(SerialBytes.write(Mode.LIVE))).isSameAs(Mode.LIVE);
    }

    record Money(String currency, long cents) implements Serializable {
        static final AtomicInteger CANONICAL_CALLS = new AtomicInteger();

        Money {
            CANONICAL_CALLS.incrementAndGet();
            if (cents < 0) {
                throw new IllegalArgumentException("negative amount");
            }
        }
    }

    @Test
    @DisplayName("M06 §9 · a record is rebuilt through its canonical constructor")
    void recordUsesCanonicalConstructor() throws Exception {
        byte[] bytes = SerialBytes.write(new Money("EUR", 1250));
        int before = Money.CANONICAL_CALLS.get();

        Money copy = (Money) SerialBytes.read(bytes);

        assertThat(Money.CANONICAL_CALLS.get()).isEqualTo(before + 1);
        assertThat(copy.currency()).isEqualTo("EUR");
        assertThat(copy.cents()).isEqualTo(1250);
    }
}
