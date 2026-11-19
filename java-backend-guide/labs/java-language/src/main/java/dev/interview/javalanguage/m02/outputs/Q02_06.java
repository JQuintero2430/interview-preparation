package dev.interview.javalanguage.m02.outputs;

import dev.interview.javalanguage.m02.s02.Sku;
import java.util.HashMap;
import java.util.Map;

// Module 02 Q02.06: a key mutated after put is unreachable by every lookup, yet its entry and value stay in the map.
public final class Q02_06 {

    private Q02_06() {}

    public static void main(String[] args) {
        Sku key = new Sku("A");
        Map<Sku, Integer> stock = new HashMap<>();
        stock.put(key, 10);

        key.setCode("B");

        System.out.println(stock.get(key));
        System.out.println(stock.get(new Sku("A")));
        System.out.println(stock.size());
        System.out.println(stock.containsValue(10));
    }
}
