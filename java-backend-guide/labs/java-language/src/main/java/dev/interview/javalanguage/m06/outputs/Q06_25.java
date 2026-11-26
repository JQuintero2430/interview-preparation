package dev.interview.javalanguage.m06.outputs;

import java.io.IOException;
import java.io.InvalidObjectException;
import java.io.ObjectInputStream;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;

// Q06.25: what a serializable class controls: its version stamp, what is left out, and checks on the way in.
public final class Q06_25 {

    private Q06_25() {}

    public static final class CartSession implements Serializable {
        // The version stamp is written into every stream's class descriptor; a distinctive value makes it easy to find.
        @Serial
        private static final long serialVersionUID = 0x0CA7_5E55_1000_0001L;

        // Class state: not part of any object's serialized form.
        static int created;

        private final String userId;
        private final List<String> items;
        // Derived or secret state: not written, so it reads back as its type's default value.
        private transient int cachedTotal;
        private transient boolean dirty;
        private transient String accessToken;

        public CartSession(String userId, List<String> items, String accessToken) {
            if (userId == null || userId.isBlank()) {
                throw new IllegalArgumentException("userId is required");
            }
            this.userId = userId;
            this.items = List.copyOf(items);
            this.accessToken = accessToken;
            this.cachedTotal = this.items.size();
            this.dirty = true;
            created++;
        }

        // No constructor of this class runs on read, so the constructor's check is repeated here.
        @Serial
        private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
            in.defaultReadObject();
            if (userId == null || userId.isBlank()) {
                throw new InvalidObjectException("userId is required");
            }
        }

        public String userId() {
            return userId;
        }

        public List<String> items() {
            return items;
        }

        public int cachedTotal() {
            return cachedTotal;
        }

        public boolean dirty() {
            return dirty;
        }

        public String accessToken() {
            return accessToken;
        }
    }
}
