// Section 8 claims, about our model (consistency.ts), not a server's or browser's code: three write policies over
// the same interleaving, an outbox replay with operation ids, and a fake channel that skips the sender (F3).
import { describe, expect, it } from 'vitest';
import { FakeChannel, InMemoryServer, applyWrites, initial, replay, type Card, type Write } from './consistency';

const start = initial({ title: 'Plan', column: 'To do' });
const bothEditTitle: Write[] = [
  { tab: 'A', baseVersion: 1, changes: { title: 'Plan Q3' } },
  { tab: 'B', baseVersion: 1, changes: { title: 'Plan Q4' } },
];

describe('Section 8: consistency', () => {
  it('Section 8: last-write-wins loses the first of two concurrent edits', () => {
    const run = applyWrites('last-write-wins', start, bothEditTitle);
    expect(run.results.map((result) => result.outcome)).toEqual(['applied', 'applied']);
    expect(run.final.card.title).toBe('Plan Q4');
    expect(run.final.version).toBe(3);
  });

  it('Section 8: a conditional write with a stale version is refused and changes nothing', () => {
    const run = applyWrites('conditional', start, bothEditTitle);
    expect(run.results).toEqual([
      { tab: 'A', outcome: 'applied' },
      { tab: 'B', outcome: 'refused 412' },
    ]);
    expect(run.final.card).toEqual({ title: 'Plan Q3', column: 'To do' });
    expect(run.final.version).toBe(2);
    // The RFC's other branch: a stale write that asks for the value already stored is not performed either.
    const resent = applyWrites('conditional', run.final, [{ tab: 'A', baseVersion: 1, changes: { title: 'Plan Q3' } }]);
    expect(resent.results).toEqual([{ tab: 'A', outcome: 'already applied 2xx' }]);
    expect(resent.final).toBe(run.final);
  });

  it('Section 8: a field merge keeps both edits on different fields and refuses edits to the same field', () => {
    const run = applyWrites('field-merge', start, [
      { tab: 'A', baseVersion: 1, changes: { title: 'Plan Q3' } },
      { tab: 'B', baseVersion: 1, changes: { column: 'Done' } },
      { tab: 'C', baseVersion: 1, changes: { title: 'Plan Q5' } },
    ]);
    expect(run.results.map((result) => result.outcome)).toEqual(['applied', 'applied', 'refused 412']);
    expect(run.final.card).toEqual({ title: 'Plan Q3', column: 'Done' });
  });

  it('Section 8: queued writes replay in order after reconnect and a repeated operation id is applied once', () => {
    const server = new InMemoryServer(new Map<string, Card>([['7', { title: 'Plan', column: 'To do' }]]));
    const deliveries = replay(
      [
        { id: 'op-1', cardId: '7', changes: { column: 'Doing' } },
        { id: 'op-2', cardId: '7', changes: { column: 'Done' } },
        { id: 'op-1', cardId: '7', changes: { column: 'Doing' } },
      ],
      server,
    );
    expect(deliveries).toEqual(['applied', 'applied', 'duplicate']);
    expect(server.cards.get('7')).toEqual({ title: 'Plan', column: 'Done' });
  });

  it('Section 8: our channel delivers a message to the other tabs and not to the sender', () => {
    const channel = new FakeChannel();
    const heardByA: string[] = [];
    const heardByB: string[] = [];
    const heardByC: string[] = [];
    const tabA = channel.join('A', (message) => heardByA.push(message));
    channel.join('B', (message) => heardByB.push(message));
    channel.join('C', (message) => heardByC.push(message));
    tabA.post('card 7 is v2');
    expect(heardByA).toEqual([]);
    expect(heardByB).toEqual(['card 7 is v2']);
    expect(heardByC).toEqual(['card 7 is v2']);
  });
});
