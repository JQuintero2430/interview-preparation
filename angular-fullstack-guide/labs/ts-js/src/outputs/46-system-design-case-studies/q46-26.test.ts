// Output question Q46.26: our transfer client and our server (concepts/transfer.ts, our model, not a payment API's code;
// the statuses mirror draft-ietf-httpapi-idempotency-key-header-08 section 2.7, and replaying the first response is our
// choice). The first request is held in progress until the test releases it; the retry meets 409, and the next retry
// gets the stored result. Times are numbers the test passes and keys come from a counter: no clock, randomness, socket
// or network.
import {
  createIdempotentServer,
  createIntent,
  LOST,
  settle,
  type Transfer,
  type TransferPayload,
} from '../../modules/46-system-design-case-studies/concepts/transfer';
import { captureLogs } from '../capture';

const payload: TransferPayload = { from: 'acc-1', to: 'acc-2', amountMinor: 25000, currency: 'EUR' };

describe('46 · Q46.26', () => {
  it('Q46.26 our transfer client and our server', async () => {
    const entries: Transfer[] = [];
    let made = 0;
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = () => resolve();
    });
    const apply = async (moved: TransferPayload, now: number): Promise<Transfer> => {
      await gate;
      const transfer: Transfer = { id: `t${entries.length + 1}`, payload: moved, at: now };
      entries.push(transfer);
      return transfer;
    };
    const server = createIdempotentServer(apply);
    const newKey = (): string => `k${++made}`;

    let replayed = false;
    const lines = await captureLogs(async (log) => {
      let intent = createIntent(payload, newKey);
      log(`confirm: ${intent.state}`);

      const first = server.post(intent.key, intent.payload, 0);
      intent = settle(intent, LOST);
      log(`POST 1 ${intent.key}: response lost, ${intent.state}`);

      const second = await server.post(intent.key, intent.payload, 10_000);
      intent = settle(intent, second);
      log(`POST 2 ${intent.key}: ${second.status}, ${intent.state}`);

      release();
      const original = await first;
      const third = await server.post(intent.key, intent.payload, 20_000);
      intent = settle(intent, third);
      log(`POST 3 ${intent.key}: ${third.status}, ${intent.state}`);
      log(`keys made ${made}, ledger entries ${entries.length}`);
      replayed = JSON.stringify(third) === JSON.stringify(original);
    });

    expect(lines).toEqual([
      'confirm: submitting',
      'POST 1 k1: response lost, unknown',
      'POST 2 k1: 409, submitting',
      'POST 3 k1: 201, succeeded',
      'keys made 1, ledger entries 1',
    ]);
    expect(replayed).toBe(true);
  });
});
