package dev.interview.javalanguage.m04.s03;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import java.util.function.IntFunction;

/**
 * Reads the private bucket array of a {@code HashMap}. Works only in a JVM started with
 * {@code --add-opens java.base/java.util=ALL-UNNAMED}; without it, {@link #capacity} throws
 * {@code InaccessibleObjectException}.
 */
public final class TableProbe {

    private static final String TREE_NODE = "java.util.HashMap$TreeNode";
    private static final int PRESIZED_MAPPINGS = 100;

    private TableProbe() {}

    public static void main(String[] args) {
        report().forEach(System.out::println);
    }

    /** The number of buckets, or 0 while the table has not been allocated. */
    public static int capacity(HashMap<?, ?> map) {
        Object[] table = table(map);
        return table == null ? 0 : table.length;
    }

    /** How many bins currently hold a red-black tree instead of a linked list. */
    public static long treeBins(HashMap<?, ?> map) {
        Object[] table = table(map);
        if (table == null) {
            return 0;
        }
        return Arrays.stream(table)
                .filter(Objects::nonNull)
                .filter(head -> head.getClass().getName().equals(TREE_NODE))
                .count();
    }

    static List<String> report() {
        return List.of(
                "default: " + growth(new HashMap<>(), 1, 12, 13),
                "new HashMap<>(100): " + growth(new HashMap<>(PRESIZED_MAPPINGS), 1, 96, 97),
                "HashMap.newHashMap(100): " + growth(HashMap.newHashMap(PRESIZED_MAPPINGS), 1, 100),
                "colliding keys: " + collisions(8, 9, 10, 11));
    }

    // Integer keys 1, 2, 3, ...: the capacity before the first put, then after each checkpoint put.
    private static String growth(HashMap<Integer, Integer> map, int... checkpoints) {
        int before = capacity(map);
        List<String> marks = fill(map, Integer::valueOf, m -> String.valueOf(capacity(m)), checkpoints);
        return "new=" + before + " " + String.join(" ", marks);
    }

    // Keys that share one hash code pile up in a single bin: capacity and bin shape after each checkpoint put.
    private static String collisions(int... checkpoints) {
        HashMap<CollidingKey, Integer> map = new HashMap<>();
        List<String> marks = fill(map, i -> new CollidingKey("k" + i), TableProbe::describeBin, checkpoints);
        return String.join(", ", marks);
    }

    private static String describeBin(HashMap<?, ?> map) {
        return capacity(map) + (treeBins(map) > 0 ? " tree" : " list");
    }

    // Puts keys 1..last checkpoint and describes the map after each checkpoint (checkpoints ascending).
    private static <K> List<String> fill(
            HashMap<K, Integer> map,
            IntFunction<K> keyFor,
            Function<HashMap<K, Integer>, String> describe,
            int... checkpoints) {
        List<String> marks = new ArrayList<>();
        int next = 0;
        for (int i = 1; next < checkpoints.length; i++) {
            map.put(keyFor.apply(i), i);
            if (i == checkpoints[next]) {
                marks.add("put" + i + "=" + describe.apply(map));
                next++;
            }
        }
        return marks;
    }

    private static Object[] table(HashMap<?, ?> map) {
        try {
            Field field = HashMap.class.getDeclaredField("table");
            field.setAccessible(true);
            return (Object[]) field.get(map);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new IllegalStateException("HashMap.table is not readable", e);
        }
    }
}
