// Section 3 model: the lines Spring MVC's `SseEmitter` writes for one event, mirrored from `SseEmitter.java` (the
// private `SseEventBuilderImpl`, an internal class) and `SseUtils.java` (`@since 7.0.9`) at `v7.0.9`, read 2026-10-21.
// Our model, not Spring's code. Fields are written in the order id, event, retry, comment, data (the order of a usual
// builder chain; the real builder keeps the order of its calls). Spring turns a non-String `data` object into text with
// an `HttpMessageConverter`; here `data` is already text.

export interface EmitterEvent {
  readonly id?: string;
  /** The `event:` field (`SseEventBuilder.name`). */
  readonly name?: string;
  /** The `retry:` field in milliseconds (`SseEventBuilder.reconnectTime`). */
  readonly reconnectTimeMs?: number;
  readonly comment?: string;
  readonly data?: string;
}

const LINE_BREAK = /\r\n|\r|\n/;

// `SseUtils.assertNoLineSeparator`: an `id` or `event` value is one line, so a line break is an error.
function singleLine(value: string): string {
  if (LINE_BREAK.test(value)) throw new Error("illegal character '\\n' or '\\r' in event content");
  return value;
}

// `SseUtils.appendFieldValue`: every line break in a value starts a new line of the same field, so a value cannot
// break out of its field. An empty field name makes a comment.
function fieldLines(field: string, value: string): string {
  return `${field}:${value.split(LINE_BREAK).join(`\n${field}:`)}`;
}

/** One event as text, with the blank line that ends it; an event with no fields is the empty string (nothing is sent). */
export function formatEvent(event: EmitterEvent): string {
  const { id, name, reconnectTimeMs, comment, data } = event;
  const lines: string[] = [];
  if (id !== undefined) lines.push(`id:${singleLine(id)}`);
  if (name !== undefined) lines.push(`event:${singleLine(name)}`);
  if (reconnectTimeMs !== undefined) lines.push(`retry:${reconnectTimeMs}`);
  if (comment !== undefined) lines.push(fieldLines('', comment));
  if (data !== undefined) lines.push(fieldLines('data', data));
  return lines.length === 0 ? '' : `${lines.join('\n')}\n\n`;
}
