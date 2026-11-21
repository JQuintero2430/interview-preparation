package dev.interview.javalanguage.m04.outputs;

import java.util.ArrayList;
import java.util.List;
import java.util.PriorityQueue;

// Module 04 Q04.21: a PriorityQueue prints its heap array, and only poll follows priority order.
public final class Q04_21 {

    private Q04_21() {}

    public static void main(String[] args) {
        PriorityQueue<Integer> queue = new PriorityQueue<>();
        for (int n : new int[] {5, 1, 4, 2, 3}) {
            queue.offer(n);
        }
        System.out.println(queue);
        List<String> polled = new ArrayList<>();
        while (!queue.isEmpty()) {
            polled.add(String.valueOf(queue.poll()));
        }
        System.out.println(String.join(" ", polled));
        System.out.println(queue);
    }
}
