package dev.interview.springtransactions.m17.ex4;

/** A client request: the idempotency key is scoped to the client that sent it. */
public record PlaceOrder(String clientId, String idempotencyKey, String customer, String sku, int quantity) {}
