// Section 8 claims, about our model (transfer.ts), not a server's or Stripe's code: one intent keeps one key across
// every retry, our server answers a repeated key with the first response and moves money once, a repeated key with a
// different payload gets 422, a retry while the first request is still processing gets 409, a request without a key
// gets 400, and a lost response leaves the intent unknown, never failed, until a retry or our status read settles it.
// The status codes mirror draft-ietf-httpapi-idempotency-key-header-08 §2.6-§2.7; the replay is our choice. Times are
// numbers the test passes, keys come from a counter, and the ledger is an in-memory array; no clock, randomness or
// network.
import { describe, expect, it } from 'vitest';
import { createIdempotentServer, createIntent, LOST, settle, type Transfer, type TransferPayload } from './transfer';

const payload: TransferPayload = { from: 'acc-1', to: 'acc-2', amountMinor: 25000, currency: 'EUR' };

/** Keys `k1`, `k2`, … and how many were made. */
function keyCounter() {
  let made = 0;
  return {
    newKey: () => `k${++made}`,
    made: () => made,
  };
}

/** Our ledger: `apply` moves money by appending a transfer; while held, it waits until the test calls `release`. */
function ledger(held = false) {
  const entries: Transfer[] = [];
  let release: () => void = () => undefined;
  const gate = held
    ? new Promise<void>((resolve) => {
        release = () => resolve();
      })
    : Promise.resolve();
  const apply = async (moved: TransferPayload, now: number): Promise<Transfer> => {
    await gate;
    const transfer: Transfer = { id: `t${entries.length + 1}`, payload: moved, at: now };
    entries.push(transfer);
    return transfer;
  };
  return { entries, apply, release: () => release() };
}

describe('Section 8: transfer', () => {
  it('Section 8: one intent keeps one key across every retry', async () => {
    const keys = keyCounter();
    const money = ledger(true);
    const server = createIdempotentServer(money.apply);
    let intent = createIntent(payload, keys.newKey);
    const sent: string[] = [intent.key];

    const first = server.post(intent.key, intent.payload, 0);
    intent = settle(intent, LOST);
    sent.push(intent.key);
    intent = settle(intent, await server.post(intent.key, intent.payload, 10_000));
    expect(intent.state).toBe('submitting');
    money.release();
    await first;
    sent.push(intent.key);
    intent = settle(intent, await server.post(intent.key, intent.payload, 20_000));

    expect(intent.state).toBe('succeeded');
    expect(sent).toEqual(['k1', 'k1', 'k1']);
    expect(keys.made()).toBe(1);
    expect(money.entries).toHaveLength(1);
  });

  it('Section 8: our server answers a repeated key with the first response and moves money once', async () => {
    const money = ledger();
    const server = createIdempotentServer(money.apply);
    const first = await server.post('k1', payload, 0);
    const again = await server.post('k1', payload, 30_000);

    expect(first).toEqual({ status: 201, body: { id: 't1', payload, at: 0 } });
    expect(again).toEqual(first);
    expect(money.entries).toHaveLength(1);
  });

  it('Section 8: a repeated key with a different payload is refused with 422 and nothing moves', async () => {
    const money = ledger();
    const server = createIdempotentServer(money.apply);
    await server.post('k1', payload, 0);
    const edited = await server.post('k1', { ...payload, amountMinor: 30000 }, 5_000);

    expect(edited.status).toBe(422);
    expect(money.entries).toHaveLength(1);
    expect(money.entries[0]?.payload.amountMinor).toBe(25000);
  });

  it('Section 8: a retry while the first request is still processing gets 409', async () => {
    const money = ledger(true);
    const server = createIdempotentServer(money.apply);
    const first = server.post('k1', payload, 0);
    const retry = await server.post('k1', payload, 10_000);

    expect(retry.status).toBe(409);
    expect(money.entries).toHaveLength(0);
    money.release();
    expect((await first).status).toBe(201);
    expect(money.entries).toHaveLength(1);
  });

  it('Section 8: a request without a key is refused with 400', async () => {
    const money = ledger();
    const server = createIdempotentServer(money.apply);

    expect((await server.post(undefined, payload, 0)).status).toBe(400);
    expect((await server.post('', payload, 0)).status).toBe(400);
    expect(money.entries).toHaveLength(0);
  });

  it('Section 8: a lost response leaves the transfer unknown, never failed, until a retry or a status read settles it', async () => {
    const keys = keyCounter();
    const money = ledger();
    const server = createIdempotentServer(money.apply);

    // The money moved, but the answer was lost; a status read by the same key finds it.
    const moved = createIntent(payload, keys.newKey);
    await server.post(moved.key, moved.payload, 0);
    const unknown = settle(moved, LOST);
    expect(unknown.state).toBe('unknown');
    expect(settle(unknown, server.find(unknown.key)).state).toBe('succeeded');

    // The request never arrived: the status read finds nothing, so the same key is sent again.
    const neverArrived = settle(createIntent(payload, keys.newKey), LOST);
    expect(neverArrived.state).toBe('unknown');
    const resend = settle(neverArrived, server.find(neverArrived.key));
    expect(resend.state).toBe('submitting');
    expect(settle(resend, await server.post(resend.key, resend.payload, 10_000)).state).toBe('succeeded');

    expect(money.entries).toHaveLength(2);
  });
});
