package dev.interview.springtransactions.m17.ex4;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Component;

/** Stands in for the real channel in the lab: it only records what was sent. */
@Component
public class RecordingConfirmationChannel implements ConfirmationChannel {

    private final List<Long> sent = new CopyOnWriteArrayList<>();

    @Override
    public void send(long orderId) {
        sent.add(orderId);
    }

    public List<Long> sent() {
        return List.copyOf(sent);
    }

    public void clear() {
        sent.clear();
    }
}
