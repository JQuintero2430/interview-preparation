// Section 5 model: a STOMP 1.2 frame codec and the heart-beat negotiation, mirrored from the STOMP 1.2 specification
// (https://stomp.github.io/stomp-specification-1.2.html, "STOMP Frames", "Value Encoding" and "Heart-beating", read
// 2026-10-21) and from @stomp/stompjs 7.5.0 `src/stomp-handler.ts` `_setupHeartbeat` for the client's tolerance
// (read 2026-10-21). Our model, not stompjs's or Spring's code. It works on decoded text, not bytes, and reads a body
// up to the first NULL: a body that contains NULL (which STOMP 1.2 sends with a `content-length` header) is out of its
// scope. Read-only for later sections, questions and exercises once written.

/** One STOMP frame: a command line, `name:value` header lines, a blank line, the body and a NULL octet. */
export interface StompFrame {
  readonly command: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: string;
}

export interface DecodeResult {
  readonly frames: readonly StompFrame[];
  /** EOLs received between frames: a heart-beat, or padding after a NULL; either one tells the receiver "alive". */
  readonly heartBeats: number;
  /** An incomplete frame (no NULL yet), to be prefixed to the next chunk. */
  readonly rest: string;
}

const NULL = '\0';
const LEADING_EOL = /^\r?\n/;
const HEADER_END = /\r?\n\r?\n/;
const LINE_END = /\r?\n/;

// "Value Encoding": every frame except CONNECT and CONNECTED escapes CR, LF, colon and backslash in its headers.
const ESCAPES: Readonly<Record<string, string>> = { '\\': '\\\\', '\r': '\\r', '\n': '\\n', ':': '\\c' };
const UNESCAPES: Readonly<Record<string, string>> = { '\\\\': '\\', '\\r': '\r', '\\n': '\n', '\\c': ':' };

function escapes(command: string): boolean {
  return command !== 'CONNECT' && command !== 'CONNECTED';
}

function escapeHeader(text: string): string {
  return text.replace(/[\\\r\n:]/g, (char) => ESCAPES[char] ?? char);
}

function unescapeHeader(text: string): string {
  return text.replace(/\\./g, (pair) => {
    const char = UNESCAPES[pair];
    if (char === undefined) throw new Error(`undefined escape sequence ${pair}`);
    return char;
  });
}

/** Encodes a frame with LF line ends. Headers are written in the order given; `content-length` is the caller's. */
export function encodeFrame(frame: StompFrame): string {
  const code = escapes(frame.command) ? escapeHeader : (text: string) => text;
  const headerLines = Object.entries(frame.headers).map(([name, value]) => `${code(name)}:${code(value)}\n`);
  return `${frame.command}\n${headerLines.join('')}\n${frame.body}${NULL}`;
}

function decodeOne(raw: string): StompFrame {
  const split = HEADER_END.exec(raw);
  const head = split === null ? raw : raw.slice(0, split.index);
  const body = split === null ? '' : raw.slice(split.index + split[0].length);
  const [command = '', ...lines] = head.split(LINE_END);
  const code = escapes(command) ? unescapeHeader : (text: string) => text;
  const headers: Record<string, string> = {};
  for (const line of lines) {
    const colon = line.indexOf(':');
    const name = code(line.slice(0, colon));
    // STOMP 1.2: when a header is repeated, "only the first header entry SHOULD be used".
    if (!(name in headers)) headers[name] = code(line.slice(colon + 1));
  }
  return { command, headers, body };
}

/** Decodes every complete frame in `buffer`, counting the EOLs between frames as heart-beats. */
export function decodeFrames(buffer: string): DecodeResult {
  const frames: StompFrame[] = [];
  let heartBeats = 0;
  let rest = buffer;
  for (;;) {
    const eol = LEADING_EOL.exec(rest);
    if (eol !== null) {
      heartBeats += 1;
      rest = rest.slice(eol[0].length);
      continue;
    }
    const end = rest.indexOf(NULL);
    if (end === -1) return { frames, heartBeats, rest };
    frames.push(decodeOne(rest.slice(0, end)));
    rest = rest.slice(end + 1);
  }
}

/** `heart-beat:<can send>,<wants to receive>` in milliseconds; 0 means "cannot send" or "does not want". */
export type HeartBeat = readonly [outgoing: number, incoming: number];

/** A missing header "MUST be treated the same way as a heart-beat:0,0 header" (STOMP 1.2, Heart-beating). */
export function parseHeartBeat(header: string | undefined): HeartBeat {
  if (header === undefined) return [0, 0];
  const [outgoing = 0, incoming = 0] = header.split(',').map((part) => Number.parseInt(part, 10));
  return [outgoing, incoming];
}

export interface HeartBeatAgreement {
  /** How often the client must send something (a frame or an EOL); 0 means never. */
  readonly clientSendsEvery: number;
  /** How often the server must send something; 0 means never. */
  readonly serverSendsEvery: number;
  /** How much server silence the client tolerates before it closes: `serverSendsEvery × tolerance`; 0 means no check. */
  readonly clientGivesUpAfter: number;
}

// One direction: none when the sender cannot send or the receiver does not want any, otherwise "MAX(<cx>,<sy>)".
function interval(senderCanSend: number, receiverWants: number): number {
  return senderCanSend === 0 || receiverWants === 0 ? 0 : Math.max(senderCanSend, receiverWants);
}

/** The STOMP 1.2 rule per direction; `tolerance` is stompjs's `heartbeatToleranceMultiplier` (default 2). */
export function negotiateHeartBeat(client: HeartBeat, server: HeartBeat, tolerance = 2): HeartBeatAgreement {
  const clientSendsEvery = interval(client[0], server[1]);
  const serverSendsEvery = interval(server[0], client[1]);
  return { clientSendsEvery, serverSendsEvery, clientGivesUpAfter: serverSendsEvery * tolerance };
}

/** One delivery of a user-destination message: the session it goes to and the destination without `/user/<name>`. */
export interface UserTarget {
  readonly sessionId: string;
  readonly destination: string;
}

const USER_DESTINATION = /^\/user\/([^/]+)(\/.+)$/;

/**
 * Our model of Spring's user destinations (`user-destination.adoc`, v7.0.9): a message sent to
 * `/user/<name>/queue/x` goes to each session of that user, and to no other session. Spring's own unique destination
 * per session (its format is internal to `DefaultUserDestinationResolver`) is not modeled. `null`: not a user
 * destination, so the broker handles it as is.
 */
export function resolveUserDestination(
  destination: string,
  sessionsByUser: ReadonlyMap<string, readonly string[]>,
): readonly UserTarget[] | null {
  const match = USER_DESTINATION.exec(destination);
  if (match === null) return null;
  const [, user = '', rest = ''] = match;
  return (sessionsByUser.get(user) ?? []).map((sessionId) => ({ sessionId, destination: rest }));
}
