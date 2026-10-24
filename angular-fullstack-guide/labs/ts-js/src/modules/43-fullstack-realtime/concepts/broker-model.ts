// Section 9 model: a simple broker per instance versus one external broker behind a relay, across instances, mirrored
// from spring-framework v7.0.9 `configuration-performance.adoc` ("Currently, you cannot do that with the simple broker"),
// `message-flow.adoc` (the three channels), `StompBrokerRelayMessageHandler.handleMessageInternal` (a message with a
// session id goes on that client's TCP connection, one without it on the "system" connection),
// `UserDestinationMessageHandler` and `MultiServerUserRegistry` (the two user broadcasts, F23, C9) and
// `ConcurrentWebSocketSessionDecorator.sendMessage` and `checkSessionLimits` (TERMINATE and DROP, F22); all read
// 2026-10-21. Our model, not Spring's code. Our simplifications: sizes are encoded-frame string lengths, not bytes; the
// send-time limit, thread pools, heart-beats and the registry's 10 s refresh are not modeled; `@MessageMapping` echoes
// the body to `/topic/…`, as `@SendTo`'s default destination does; a user's session-unique destination uses our own key
// (Spring's format is internal). Nothing here reads a clock or opens a connection.
import { decodeFrames, encodeFrame, resolveUserDestination, type StompFrame } from './stomp-frame';

export type OverflowStrategy = 'terminate' | 'drop';

export interface SessionLimits {
  /** Spring's `sendBufferSizeLimit` (512 KiB by default); here, in characters of encoded frames. */
  readonly bufferSizeLimit: number;
  /** Spring's default is TERMINATE; DROP needs a decorator of your own. */
  readonly overflow: OverflowStrategy;
}

export const SPRING_DEFAULT_LIMITS: SessionLimits = { bufferSizeLimit: 512 * 1024, overflow: 'terminate' };

/** `CloseStatus.SESSION_NOT_RELIABLE`: "Failed to send message within the configured send limit". */
export const SESSION_NOT_RELIABLE = 4500;

/** The MESSAGE frame a broker sends a subscriber (header order as our codec writes it). */
export function messageFrame(destination: string, messageId: string, subscription: string, body: string): StompFrame {
  return { command: 'MESSAGE', headers: { destination, 'message-id': messageId, subscription }, body };
}

/** One client's WebSocket session on one instance, with our mirror of Spring's send buffer. */
export class ClientSession {
  /** True while a send to this client is still in progress (a slow network), so later frames wait in the buffer. */
  slow = false;
  dropped = 0;
  closeCode: number | undefined;
  private readonly delivered: string[] = [];
  private buffer: string[] = [];
  private bufferSize = 0;

  constructor(
    readonly id: string,
    readonly user: string,
    readonly instance: string,
    private readonly limits: SessionLimits,
  ) {}

  get open(): boolean {
    return this.closeCode === undefined;
  }

  /** Buffers the frame, then flushes it, or, while a send is in progress, checks the limit (as Spring does). */
  send(frame: StompFrame): void {
    if (!this.open) return;
    const text = encodeFrame(frame);
    this.buffer.push(text);
    this.bufferSize += text.length;
    if (this.slow) this.checkLimit();
    else this.flush();
  }

  /** The client caught up: what is still buffered reaches it. */
  drain(): void {
    this.slow = false;
    this.flush();
  }

  /** The frames that reached the client, decoded as a STOMP client would. */
  received(): readonly StompFrame[] {
    return decodeFrames(this.delivered.join('')).frames;
  }

  private flush(): void {
    if (!this.open) return;
    this.delivered.push(...this.buffer);
    this.buffer = [];
    this.bufferSize = 0;
  }

  private checkLimit(): void {
    if (this.bufferSize <= this.limits.bufferSizeLimit) return;
    if (this.limits.overflow === 'terminate') {
      this.closeCode = SESSION_NOT_RELIABLE; // nothing buffered reaches the client
      return;
    }
    while (this.bufferSize > this.limits.bufferSizeLimit) {
      const oldest = this.buffer.shift() ?? ''; // DROP: "Drop the oldest messages from the buffer"
      this.bufferSize -= oldest.length;
      this.dropped += 1;
    }
  }
}

interface Subscription {
  readonly session: ClientSession;
  readonly id: string;
  readonly clientDestination: string;
}

/** One STOMP broker: subscriptions by destination, and fan-out to every subscriber. */
class Broker {
  private readonly subscriptions = new Map<string, Subscription[]>();
  private messageCount = 0;

  constructor(
    private readonly label: string,
    private readonly relayed: boolean,
    private readonly hops: string[],
  ) {}

  subscribe(key: string, subscription: Subscription): void {
    this.subscriptions.set(key, [...(this.subscriptions.get(key) ?? []), subscription]);
  }

  publish(key: string, body: string): void {
    this.hops.push(this.label);
    this.messageCount += 1;
    for (const { session, id, clientDestination } of this.subscriptions.get(key) ?? []) {
      if (this.relayed) this.hops.push(`${session.instance} relay`);
      this.hops.push(`${session.instance} clientOutboundChannel`);
      session.send(messageFrame(clientDestination, `m-${this.messageCount}`, id, body));
    }
  }
}

export type ClusterConfig =
  | { readonly mode: 'simple' }
  | { readonly mode: 'relay'; readonly userRegistryBroadcast?: boolean; readonly userDestinationBroadcast?: boolean };

const USER_PREFIX = '/user';
const APP_PREFIX = '/app/';

// Our key for a session-unique destination; Spring's own format is internal to `DefaultUserDestinationResolver`.
function sessionKey(destination: string, sessionId: string): string {
  return `${destination}#${sessionId}`;
}

/** One application instance: its local sessions (its user registry), its channels and its broker or relay. */
export class Instance {
  private readonly sessions: ClientSession[] = [];

  constructor(
    readonly name: string,
    private readonly cluster: Cluster,
    private readonly broker: Broker,
  ) {}

  connect(id: string, user: string, limits: SessionLimits = SPRING_DEFAULT_LIMITS): ClientSession {
    const session = new ClientSession(id, user, this.name, limits);
    this.sessions.push(session);
    return session;
  }

  /** `SUBSCRIBE`: a `/user/…` destination becomes one destination for this session only. */
  subscribe(session: ClientSession, destination: string, id = 'sub-0'): void {
    const key = destination.startsWith(`${USER_PREFIX}/`)
      ? sessionKey(destination.slice(USER_PREFIX.length), session.id)
      : destination;
    this.broker.subscribe(key, { session, id, clientDestination: destination });
  }

  /** A client's `SEND`: `/app/x` runs our `@MessageMapping`, which returns the body to `/topic/x`. */
  send(session: ClientSession, destination: string, body: string): void {
    this.hops.push(`${this.name} clientInboundChannel`);
    if (!destination.startsWith(APP_PREFIX)) {
      this.toBroker(destination, body, `session ${session.id}`);
      return;
    }
    this.hops.push(`${this.name} @MessageMapping`);
    this.toBroker(`/topic/${destination.slice(APP_PREFIX.length)}`, body, `session ${session.id}`);
  }

  /** Application code (a service, an HTTP handler): no session id, so the relay uses the system connection. */
  publish(destination: string, body: string): void {
    this.toBroker(destination, body, 'system connection');
  }

  /** `convertAndSendToUser`: every session of the user this instance knows about, or the unresolved broadcast. */
  sendToUser(user: string, destination: string, body: string): void {
    const targets = resolveUserDestination(`${USER_PREFIX}/${user}${destination}`, this.cluster.sessionsSeenBy(this));
    if (targets === null || targets.length === 0) {
      this.cluster.broadcastUnresolved(this, user, destination, body);
      return;
    }
    for (const target of targets) this.publish(sessionKey(target.destination, target.sessionId), body);
  }

  /** A broadcast unresolved message arriving here: try local sessions only, and never broadcast again. */
  receiveUnresolved(user: string, destination: string, body: string): void {
    const targets = resolveUserDestination(`${USER_PREFIX}/${user}${destination}`, this.localSessionsByUser()) ?? [];
    for (const target of targets) this.publish(sessionKey(target.destination, target.sessionId), body);
  }

  /** This instance's own user registry: open sessions by user name. */
  localSessionsByUser(): Map<string, string[]> {
    const byUser = new Map<string, string[]>();
    for (const session of this.sessions.filter((each) => each.open)) {
      byUser.set(session.user, [...(byUser.get(session.user) ?? []), session.id]);
    }
    return byUser;
  }

  private get hops(): string[] {
    return this.cluster.hops;
  }

  private toBroker(destination: string, body: string, connection: string): void {
    this.hops.push(`${this.name} brokerChannel`);
    if (this.cluster.config.mode === 'relay') this.hops.push(`${this.name} relay, ${connection}`);
    this.broker.publish(destination, body);
  }
}

/** Instances behind one load balancer: each with its own simple broker, or all relaying to one external broker. */
export class Cluster {
  /** Every hop a message took, in order, for the trace. */
  readonly hops: string[] = [];
  private readonly instances = new Map<string, Instance>();

  constructor(
    readonly config: ClusterConfig,
    names: readonly string[],
  ) {
    const external = new Broker('external broker', true, this.hops);
    for (const name of names) {
      const broker = config.mode === 'relay' ? external : new Broker(`${name} simple broker`, false, this.hops);
      this.instances.set(name, new Instance(name, this, broker));
    }
  }

  instance(name: string): Instance {
    const found = this.instances.get(name);
    if (found === undefined) throw new Error(`no instance ${name}`);
    return found;
  }

  /** What one instance's user registry holds: its own sessions, plus every other's with the registry broadcast. */
  sessionsSeenBy(from: Instance): Map<string, string[]> {
    if (this.config.mode !== 'relay' || this.config.userRegistryBroadcast !== true) return from.localSessionsByUser();
    const merged = new Map<string, string[]>();
    for (const instance of this.instances.values()) {
      for (const [user, ids] of instance.localSessionsByUser()) merged.set(user, [...(merged.get(user) ?? []), ...ids]);
    }
    return merged;
  }

  /** With the unresolved-message broadcast, every other instance gets a chance; without it, the message is lost. */
  broadcastUnresolved(from: Instance, user: string, destination: string, body: string): void {
    if (this.config.mode !== 'relay' || this.config.userDestinationBroadcast !== true) return;
    for (const instance of this.instances.values()) {
      if (instance !== from) instance.receiveUnresolved(user, destination, body);
    }
  }
}
