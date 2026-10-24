// Section 2 model: the event-stream parser of WHATWG HTML §9.2.5-§9.2.6 ("Parsing an event stream", "Interpreting an
// event stream"; the page read 2026-10-21, "Last Updated 20 October 2026"). Our model, not the browser's code. It
// parses one stream (one connection): text in, dispatched events out. Decoding bytes is the caller's job (a
// `TextDecoder` with `{ stream: true }` or a `TextDecoderStream`); a leading U+FEFF in the first text is skipped, as
// the UTF-8 decode strips one leading BOM. Read-only for later sections, questions and exercises once written.

/** One dispatched event, as a browser's `MessageEvent` would carry it. */
export interface SseEvent {
  /** `message` unless an `event` field named another type. */
  readonly type: string;
  readonly data: string;
  /** The source's last event ID string at dispatch: it persists across events until an `id` field changes it. */
  readonly lastEventId: string;
}

export interface SseParser {
  /** Feeds the next decoded chunk. A chunk may end anywhere: mid-line, mid-field, or between a CR and its LF. */
  push(chunk: string): void;
  /** The end of the stream: a partial line and an event without its blank line are discarded, never dispatched. */
  end(): void;
  /** The last event ID string, set at each dispatch from the `id` field (the value a reconnect sends). */
  readonly lastEventId: string;
  /** The reconnection time in milliseconds set by the last valid `retry` field, or `undefined` if none came. */
  readonly reconnectionTime: number | undefined;
}

/** Everything a whole stream produced: the parser's result after `push` of every chunk and `end`. */
export interface ParsedStream {
  readonly events: readonly SseEvent[];
  readonly lastEventId: string;
  readonly reconnectionTime: number | undefined;
}

const LF = '\n';
const CR = '\r';
const BOM = '﻿';
const DIGITS_ONLY = /^[0-9]+$/;

/** Creates a parser for one stream; `onEvent` runs once per dispatched event, in stream order. */
export function createSseParser(onEvent: (event: SseEvent) => void): SseParser {
  let partialLine = '';
  let afterCr = false;
  let started = false;
  let data = '';
  let eventType = '';
  let idBuffer = '';
  let lastEventId = '';
  let reconnectionTime: number | undefined;

  function dispatch(): void {
    lastEventId = idBuffer;
    if (data === '') {
      eventType = '';
      return;
    }
    const event: SseEvent = { type: eventType || 'message', data: data.slice(0, -1), lastEventId };
    data = '';
    eventType = '';
    onEvent(event);
  }

  function processField(field: string, value: string): void {
    if (field === 'event') eventType = value;
    else if (field === 'data') data += value + LF;
    else if (field === 'id' && !value.includes('\0')) idBuffer = value;
    else if (field === 'retry' && DIGITS_ONLY.test(value)) reconnectionTime = Number.parseInt(value, 10);
  }

  function processLine(line: string): void {
    if (line === '') return dispatch();
    if (line.startsWith(':')) return;
    const colon = line.indexOf(':');
    if (colon === -1) return processField(line, '');
    const value = line.slice(colon + 1);
    processField(line.slice(0, colon), value.startsWith(' ') ? value.slice(1) : value);
  }

  function push(chunk: string): void {
    if (chunk === '') return;
    let text = started || !chunk.startsWith(BOM) ? chunk : chunk.slice(1);
    started = true;
    // A CR that ended the previous chunk already ended its line, so an LF here is the rest of that CRLF, not a
    // blank line (which would dispatch).
    if (afterCr && text.startsWith(LF)) text = text.slice(1);
    afterCr = false;
    let lineStart = 0;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (char !== CR && char !== LF) continue;
      processLine(partialLine + text.slice(lineStart, i));
      partialLine = '';
      if (char === CR && text[i + 1] === LF) i += 1;
      else afterCr = char === CR && i === text.length - 1;
      lineStart = i + 1;
    }
    partialLine += text.slice(lineStart);
  }

  function end(): void {
    partialLine = '';
    data = '';
    eventType = '';
  }

  return {
    push,
    end,
    get lastEventId() {
      return lastEventId;
    },
    get reconnectionTime() {
      return reconnectionTime;
    },
  };
}

/** Parses a whole stream given as its chunks (a single string is one chunk), then ends it. */
export function parseEventStream(chunks: string | readonly string[]): ParsedStream {
  const events: SseEvent[] = [];
  const parser = createSseParser((event) => events.push(event));
  for (const chunk of typeof chunks === 'string' ? [chunks] : chunks) parser.push(chunk);
  parser.end();
  return { events, lastEventId: parser.lastEventId, reconnectionTime: parser.reconnectionTime };
}
