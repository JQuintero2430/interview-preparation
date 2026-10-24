// Exercise 43.1, variant b (the alternative): `TextDecoderStream` for the bytes and a `TransformStream` for the lines.
import { createSseClient, type LineReader, type SseClient, type SseClientOptions } from '../sse-client';

const LINE_END = /\r\n|\r|\n/;

function lineSplitter(): TransformStream<string, string> {
  let pending = '';
  let skipLf = false;
  return new TransformStream<string, string>({
    transform(chunk, controller) {
      const text = skipLf && chunk.startsWith('\n') ? chunk.slice(1) : chunk;
      if (chunk === '') return;
      skipLf = text.endsWith('\r');
      const lines = (pending + text).split(LINE_END);
      pending = lines.pop() ?? '';
      for (const line of lines) controller.enqueue(line);
    },
    // No `flush`: a partial last line is discarded, as §9.2.6 says.
  });
}

const readLines: LineReader = (body) => body.pipeThrough(new TextDecoderStream()).pipeThrough(lineSplitter());

export function createClientB(options: SseClientOptions): SseClient {
  return createSseClient(options, readLines);
}
