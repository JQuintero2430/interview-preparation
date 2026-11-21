package dev.interview.javalanguage.m04.outputs;

import dev.interview.javalanguage.m04.s03.TableProbe;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;

// Module 04 Q04.09: which bin a key lands in. Reads HashMap's private table, so it runs only in a JVM
// started with --add-opens java.base/java.util=ALL-UNNAMED (Q04TableProbeTest launches one).
public final class Q04_09 {

    private static final String NODE_CLASS = "java.util.HashMap$Node";

    private Q04_09() {}

    // A key whose hash code is chosen by the caller, so the bin arithmetic can be checked.
    record FixedHash(int hash) {
        @Override
        public int hashCode() {
            return hash;
        }
    }

    public static void main(String[] args) {
        HashMap<Object, String> map = new HashMap<>();
        List<Object> keys = Arrays.asList(
                null, new FixedHash(0x11), new FixedHash(0x10000), new FixedHash(0x20000), new FixedHash(0x30000));
        keys.forEach(key -> map.put(key, "v"));
        System.out.println("table: " + TableProbe.capacity(map) + " buckets");
        for (Object key : keys) {
            System.out.println(label(key) + " -> bin " + binOf(map, key));
        }
    }

    private static String label(Object key) {
        return key == null ? "null" : "0x" + Integer.toHexString(key.hashCode());
    }

    /** The index of the bin that holds {@code key}, or -1 if no bin does. */
    static int binOf(HashMap<?, ?> map, Object key) {
        Object[] table = (Object[]) read(HashMap.class, "table", map);
        for (int i = 0; i < table.length; i++) {
            if (chainHolds(table[i], key)) {
                return i;
            }
        }
        return -1;
    }

    private static boolean chainHolds(Object first, Object key) {
        Class<?> node = nodeClass();
        for (Object n = first; n != null; n = read(node, "next", n)) {
            if (Objects.equals(read(node, "key", n), key)) {
                return true;
            }
        }
        return false;
    }

    private static Class<?> nodeClass() {
        try {
            return Class.forName(NODE_CLASS);
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException(NODE_CLASS + " is not loadable", e);
        }
    }

    private static Object read(Class<?> owner, String fieldName, Object target) {
        try {
            Field field = owner.getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(target);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new IllegalStateException(owner.getName() + "." + fieldName + " is not readable", e);
        }
    }
}
