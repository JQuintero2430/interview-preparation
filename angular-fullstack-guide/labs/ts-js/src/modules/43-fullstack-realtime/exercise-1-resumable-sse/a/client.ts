// Exercise 43.1, variant a (the solution): a hand-written line splitter over `TextDecoder` with `{ stream: true }`.
import { createSseClient, type LineReader, type SseClient, type SseClientOptions } from '../sse-client';

const LINE_END = /\r\n|\r|\n/;

const readLines: LineReader = async function* (body) {
  const reader = body.getReader();
  // `stream: true` keeps a multi-byte character cut by a chunk boundary until its other bytes arrive.
  const decoder = new TextDecoder();
  let pending = '';
  let skipLf = false;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return; // a partial last line is discarded, as §9.2.6 says
      let text = decoder.decode(value, { stream: true });
      if (text === '') continue;
      // A chunk that ended in CR already ended its line, so an LF opening this one is the rest of that CRLF.
      if (skipLf && text.startsWith('\n')) text = text.slice(1);
      skipLf = text.endsWith('\r');
      const lines = (pending + text).split(LINE_END);
      pending = lines.pop() ?? '';
      yield* lines;
    }
  } finally {
    void reader.cancel().catch(() => undefined);
  }
};

export function createClientA(options: SseClientOptions): SseClient {
  return createSseClient(options, readLines);
}
