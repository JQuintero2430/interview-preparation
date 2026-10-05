import { chatReducer, createChatState, type ChatAction, type ChatState, type ServerMessage } from './chatReducer';

const run = (actions: ChatAction[], from: ChatState = createChatState()) => actions.reduce(chatReducer, from);
const srv = (seq: number, extra: Partial<ServerMessage> = {}): ChatAction => ({
  type: 'server',
  message: { id: `m${seq}`, seq, author: 'bob', text: `msg ${seq}`, ...extra },
});
const texts = (s: ChatState) => s.messages.map((m) => `${m.text}:${m.status}`);

test('sending shows the message immediately as pending', () => {
  const s = run([{ type: 'send', clientId: 'c1', author: 'me', text: 'hi' }]);
  expect(texts(s)).toEqual(['hi:pending']);
});

test('the ack replaces the pending message in place; the later echo is a no-op (no duplicate)', () => {
  const send: ChatAction = { type: 'send', clientId: 'c1', author: 'me', text: 'hi' };
  const confirmed = srv(1, { clientId: 'c1', author: 'me', text: 'hi' });
  const afterAck = run([send, confirmed]);
  expect(afterAck.messages).toHaveLength(1);
  expect(afterAck.messages[0]).toMatchObject({ id: 'm1', seq: 1, status: 'sent' });

  const afterEcho = chatReducer(afterAck, confirmed);
  expect(afterEcho).toBe(afterAck);
});

test('echo before ack gives the same result as ack before echo', () => {
  const send: ChatAction = { type: 'send', clientId: 'c1', author: 'me', text: 'hi' };
  const a = srv(1, { clientId: 'c1', author: 'me', text: 'hi' });
  expect(run([send, a, a])).toEqual(run([send, a]));
});

test('out-of-order arrival is sorted by seq and the gap is reported, then closed by catch-up', () => {
  const s1 = run([srv(1), srv(3)]);
  expect(s1.messages.map((m) => m.seq)).toEqual([1, 3]);
  expect(s1.contiguousSeq).toBe(1);
  expect(s1.gapAfter).toBe(1);

  const s2 = chatReducer(s1, srv(2));
  expect(s2.messages.map((m) => m.seq)).toEqual([1, 2, 3]);
  expect(s2.contiguousSeq).toBe(3);
  expect(s2.gapAfter).toBeNull();
});

test('unconfirmed messages stay after confirmed ones, in send order', () => {
  const s = run([
    { type: 'send', clientId: 'c1', author: 'me', text: 'first' },
    srv(1),
    { type: 'send', clientId: 'c2', author: 'me', text: 'second' },
    srv(2),
  ]);
  expect(texts(s)).toEqual(['msg 1:sent', 'msg 2:sent', 'first:pending', 'second:pending']);
});

test('a history page below the loaded range closes with baseSeq', () => {
  const s = run([srv(11), srv(12)], createChatState(10));
  expect(s.gapAfter).toBeNull();
  expect(s.contiguousSeq).toBe(12);
});

test('fail and retry only apply in the right state; a failure after the ack is ignored', () => {
  const send: ChatAction = { type: 'send', clientId: 'c1', author: 'me', text: 'hi' };
  const failed = run([send, { type: 'failed', clientId: 'c1' }]);
  expect(texts(failed)).toEqual(['hi:failed']);
  expect(texts(chatReducer(failed, { type: 'retry', clientId: 'c1' }))).toEqual(['hi:pending']);

  const acked = run([send, srv(1, { clientId: 'c1', author: 'me', text: 'hi' })]);
  expect(chatReducer(acked, { type: 'failed', clientId: 'c1' })).toBe(acked);
});
