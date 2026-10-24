// Section 6 model: how an SSR container stops, and which process the stop signal reaches. Our model, not Node's,
// Docker's or Spring's code. It mirrors, all read 2026-10-22: the Dockerfile reference (the shell form runs under
// `/bin/sh -c`, "which does not pass signals"; `HEALTHCHECK` options and the healthy/unhealthy rule), the `docker run`
// reference ("A process running as PID 1 inside a container ... ignores any signal with the default action"; `--init`
// runs docker-init, backed by tini, that "forwards signals and reaps processes"), the `docker stop` reference (SIGTERM,
// then SIGKILL after a grace period), Node v24.22.1's `http.Server.close()` (stops accepting new connections, keeps the
// ones in flight) and Spring Boot v4.1.1's graceful-shutdown docs and probe lifecycle table (readiness refuses traffic
// before the server stops accepting). The node image's `docker-entrypoint.sh` ends with `exec "$@"`, so it is not in
// the process tree. Not modeled: signals other than the stop signal, zombie reaping, keep-alive connections, Docker's
// start period. Time is the number an injected clock returns; nothing here reads a clock, opens a socket, spawns a
// process or sends a signal.

/** The clock our model reads; a test passes one that returns a number it moves by hand. */
export interface Clock {
  now(): number;
}

/** A fake HTTP server: it accepts requests while listening and counts the ones in flight. */
export interface FakeServer {
  readonly listening: () => boolean;
  readonly inFlight: () => number;
  /** Starts a request; refused once the listener is closed, as a closed port refuses a connection. */
  readonly accept: (id: string) => boolean;
  readonly finish: (id: string) => void;
  /** Like Node's `server.close()`: no new connections, the requests in flight go on. */
  readonly close: () => void;
}

/** A listening fake server with nothing in flight. */
export function createFakeServer(): FakeServer {
  let listening = true;
  const running = new Set<string>();
  return {
    listening: () => listening,
    inFlight: () => running.size,
    accept: (id) => {
      if (listening) {
        running.add(id);
      }
      return listening;
    },
    finish: (id) => {
      running.delete(id);
    },
    close: () => {
      listening = false;
    },
  };
}

/** The readiness flag a load balancer polls: 200 while ready, 503 once shutdown begins. */
export interface Readiness {
  readonly status: () => 200 | 503;
  readonly markNotReady: () => void;
}

/** A readiness flag that starts ready. */
export function createReadiness(): Readiness {
  let ready = true;
  return {
    status: () => (ready ? 200 : 503),
    markNotReady: () => {
      ready = false;
    },
  };
}

export interface ShutdownOptions {
  readonly server: FakeServer;
  readonly readiness: Readiness;
  readonly clock: Clock;
  /** How long the server keeps accepting after readiness fails, so the load balancer sees 503 and stops routing. */
  readonly drainDelayMs: number;
  /** When the process must have exited, counted from the signal; keep it below the orchestrator's grace period. */
  readonly deadlineMs: number;
}

export type ShutdownStep = 'not ready' | 'stopped accepting' | 'drained' | 'exit 0' | 'exit 1';

export interface Shutdown {
  /** What the SIGTERM handler calls. */
  readonly begin: () => void;
  /** Moves the shutdown on to the clock's time; returns the exit code once there is one. */
  readonly poll: () => 0 | 1 | undefined;
  readonly steps: () => readonly ShutdownStep[];
}

/**
 * The shutdown order: mark not ready, keep accepting for `drainDelayMs` so the load balancer stops routing, stop
 * accepting, let the requests in flight finish, exit 0; at the deadline, exit 1 and abandon what still runs.
 */
export function createShutdown(options: ShutdownOptions): Shutdown {
  const { server, readiness, clock, drainDelayMs, deadlineMs } = options;
  const steps: ShutdownStep[] = [];
  let startedAt: number | undefined;
  let exitCode: 0 | 1 | undefined;

  const begin = (): void => {
    if (startedAt !== undefined) {
      return;
    }
    startedAt = clock.now();
    readiness.markNotReady();
    steps.push('not ready');
  };

  const decide = (elapsed: number): 0 | 1 | undefined => {
    if (server.listening() && elapsed >= drainDelayMs) {
      server.close();
      steps.push('stopped accepting');
    }
    if (!server.listening() && server.inFlight() === 0) {
      steps.push('drained', 'exit 0');
      return 0;
    }
    if (elapsed >= deadlineMs) {
      steps.push('exit 1');
      return 1;
    }
    return undefined;
  };

  const poll = (): 0 | 1 | undefined => {
    if (startedAt !== undefined && exitCode === undefined) {
      exitCode = decide(clock.now() - startedAt);
    }
    return exitCode;
  };

  return { begin, poll, steps: () => steps };
}

/** A Dockerfile `CMD`: the exec form is a JSON array, anything else is the shell form. */
export type Command = { readonly form: 'exec'; readonly argv: readonly string[] } | { readonly form: 'shell'; readonly line: string };

/** Reads the last top-level `CMD` of a Dockerfile (a `HEALTHCHECK ... CMD` continuation line is indented, so skipped). */
export function readCmd(dockerfile: string): Command {
  const lines = [...dockerfile.matchAll(/^CMD (.+)$/gm)].map((match) => match[1] ?? '');
  const last = (lines.at(-1) ?? '').trim();
  if (last.startsWith('[')) {
    const parsed: unknown = JSON.parse(last);
    const argv = Array.isArray(parsed) ? parsed.filter((part): part is string => typeof part === 'string') : [];
    if (argv.length > 0 && Array.isArray(parsed) && argv.length === parsed.length) {
      return { form: 'exec', argv };
    }
  }
  return { form: 'shell', line: last };
}

/** One process in the container, PID 1 first; `child` is the process it started. */
export interface ProcessNode {
  readonly pid: number;
  readonly command: string;
  readonly child?: ProcessNode;
}

export interface StartOptions {
  /** `docker run --init`: docker-init (tini) becomes PID 1 and starts the command. */
  readonly init: boolean;
  /** Some shells exec a lone last command instead of forking it; the Dockerfile reference assumes they fork. */
  readonly shellExecsLastCommand: boolean;
}

function chain(commands: readonly string[], pid = 1): ProcessNode | undefined {
  const [command, ...rest] = commands;
  if (command === undefined) {
    return undefined;
  }
  const child = chain(rest, pid + 1);
  return child === undefined ? { pid, command } : { pid, command, child };
}

/** The process tree a command starts: exec form runs it directly, shell form under `/bin/sh -c`. */
export function processTree(command: Command, options: StartOptions): ProcessNode {
  const program = command.form === 'exec' ? command.argv.join(' ') : command.line;
  const shell = command.form === 'shell' && !options.shellExecsLastCommand ? [`/bin/sh -c ${program}`] : [];
  const commands = [...(options.init ? ['docker-init'] : []), ...shell, program];
  return chain(commands) ?? { pid: 1, command: program };
}

export type StopOutcome = 'graceful shutdown' | 'ignored, then SIGKILL after the grace period' | 'terminated without draining';

export interface StopResult {
  readonly receiver: string;
  readonly outcome: StopOutcome;
}

/**
 * `docker stop` sends the stop signal to PID 1. docker-init forwards it to its child; a shell does not pass it on.
 * The receiver acts on it only with a handler; as PID 1 the default action is ignored, elsewhere it terminates.
 */
export function deliverStopSignal(tree: ProcessNode, nodeHandlesSigterm: boolean): StopResult {
  const receiver = tree.command === 'docker-init' && tree.child !== undefined ? tree.child : tree;
  const isNode = receiver.command.startsWith('node ');
  if (isNode && nodeHandlesSigterm) {
    return { receiver: receiver.command, outcome: 'graceful shutdown' };
  }
  const outcome: StopOutcome = receiver.pid === 1 ? 'ignored, then SIGKILL after the grace period' : 'terminated without draining';
  return { receiver: receiver.command, outcome };
}

/** A health check: Docker's `HEALTHCHECK` or a probe. One that renders takes as long as a render. */
export interface HealthCheck {
  readonly path: string;
  readonly renders: boolean;
}

/** One run passes when it answers within the timeout; a check that does not render answers at once. */
export function checkPasses(check: HealthCheck, renderMs: number, timeoutMs: number): boolean {
  return (check.renders ? renderMs : 0) <= timeoutMs;
}

export type HealthStatus = 'starting' | 'healthy' | 'unhealthy';

/** Docker's rule: a pass makes the container healthy; `retries` consecutive failures make it unhealthy. */
export function healthStatus(results: readonly boolean[], retries: number): HealthStatus {
  let status: HealthStatus = 'starting';
  let failures = 0;
  for (const passed of results) {
    failures = passed ? 0 : failures + 1;
    if (passed) {
      status = 'healthy';
    } else if (failures >= retries) {
      status = 'unhealthy';
    }
  }
  return status;
}

export interface HealthcheckOptions {
  readonly timeoutMs: number;
  readonly retries: number;
  readonly command: string;
}

const UNIT_MS: Readonly<Record<string, number>> = { ms: 1, s: 1_000, m: 60_000 };

/** A Docker duration such as `2s`, `500ms` or `5m`, in milliseconds. */
export function parseDuration(text: string): number {
  const match = /^(\d+)(ms|s|m)$/.exec(text);
  return match === null ? Number.NaN : Number(match[1]) * (UNIT_MS[match[2] ?? ''] ?? Number.NaN);
}

/** Reads a Dockerfile's `HEALTHCHECK` (continuation lines joined); Docker's defaults fill missing options. */
export function readHealthcheck(dockerfile: string): HealthcheckOptions {
  const joined = dockerfile.replace(/\\\n\s*/g, ' ');
  const line = /^HEALTHCHECK (.+)$/m.exec(joined)?.[1] ?? '';
  const option = (name: string): string | undefined => new RegExp(`--${name}=(\\S+)`).exec(line)?.[1];
  return {
    timeoutMs: parseDuration(option('timeout') ?? '30s'),
    retries: Number(option('retries') ?? '3'),
    command: line.slice(line.indexOf('CMD ') + 'CMD '.length),
  };
}
