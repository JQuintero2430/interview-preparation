// Section 6 claims, about our model (graceful-shutdown.ts) and the committed deploy/Dockerfile.ssr read as text: on
// SIGTERM the server reports not ready before it stops accepting connections; requests in flight finish and the process
// exits 0, or the deadline abandons them with exit code 1; a shell-form command puts a shell, not Node, in front of the
// stop signal; and a liveness check that does not render survives slow rendering. No clock, socket, process or signal:
// time is a number the test moves.
import {
  checkPasses,
  createFakeServer,
  createReadiness,
  createShutdown,
  deliverStopSignal,
  healthStatus,
  processTree,
  readCmd,
  readHealthcheck,
  type Clock,
} from './graceful-shutdown';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const fs: { readFileSync(path: URL, encoding: 'utf8'): string } = await import(fsSpecifier);
const readDeployFile = (name: string): string =>
  fs.readFileSync(new URL(`../../../../../angular/deploy/${name}`, import.meta.url), 'utf8');

const dockerfile = readDeployFile('Dockerfile.ssr');

/** A clock the test moves by hand. */
function manualClock(): Clock & { set(ms: number): void } {
  let now = 0;
  return {
    now: () => now,
    set: (ms) => {
      now = ms;
    },
  };
}

function setUp() {
  const clock = manualClock();
  const server = createFakeServer();
  const readiness = createReadiness();
  const shutdown = createShutdown({ server, readiness, clock, drainDelayMs: 3_000, deadlineMs: 9_000 });
  return { clock, server, readiness, shutdown };
}

describe('Module 44 · section 6', () => {
  it('Section 6: SIGTERM marks the server not ready before it stops accepting connections', () => {
    const { clock, server, readiness, shutdown } = setUp();
    clock.set(1_000);
    shutdown.begin();
    expect(readiness.status()).toBe(503);
    // Inside the drain delay the load balancer may still route a request: the server still takes it.
    clock.set(3_999);
    expect(shutdown.poll()).toBeUndefined();
    expect(server.accept('late-routed')).toBe(true);
    server.finish('late-routed');
    clock.set(4_000);
    shutdown.poll();
    expect(server.accept('after-close')).toBe(false);
    expect(shutdown.steps().slice(0, 2)).toEqual(['not ready', 'stopped accepting']);
  });

  it('Section 6: in-flight requests finish and the process exits 0 before the deadline', () => {
    const { clock, server, shutdown } = setUp();
    server.accept('render-1');
    server.accept('render-2');
    shutdown.begin();
    clock.set(3_000);
    expect(shutdown.poll()).toBeUndefined();
    expect(server.inFlight()).toBe(2);
    server.finish('render-1');
    clock.set(5_000);
    expect(shutdown.poll()).toBeUndefined();
    server.finish('render-2');
    clock.set(6_000);
    expect(shutdown.poll()).toBe(0);
    expect(shutdown.steps()).toEqual(['not ready', 'stopped accepting', 'drained', 'exit 0']);
  });

  it('Section 6: a request still running at the deadline is abandoned and the exit code is 1', () => {
    const { clock, server, shutdown } = setUp();
    server.accept('slow-render');
    shutdown.begin();
    clock.set(8_999);
    expect(shutdown.poll()).toBeUndefined();
    clock.set(9_000);
    expect(shutdown.poll()).toBe(1);
    expect(server.inFlight()).toBe(1);
    expect(shutdown.steps()).toEqual(['not ready', 'stopped accepting', 'exit 1']);
    // The code is decided once: finishing the request afterwards changes nothing.
    server.finish('slow-render');
    clock.set(9_500);
    expect(shutdown.poll()).toBe(1);
  });

  it('Section 6: under a shell-form command the signal reaches the shell and not Node', () => {
    const forking = { init: false, shellExecsLastCommand: false };
    const shellForm = readCmd('FROM node:24-alpine\nCMD node dist/ssr-lab/server/server.mjs\n');
    expect(shellForm.form).toBe('shell');
    const shellTree = processTree(shellForm, forking);
    expect(shellTree.command).toBe('/bin/sh -c node dist/ssr-lab/server/server.mjs');
    expect(shellTree.child?.command).toBe('node dist/ssr-lab/server/server.mjs');
    // Even with a handler in Node, PID 1 is the shell: it ignores the signal and Docker kills the container later.
    expect(deliverStopSignal(shellTree, true)).toEqual({
      receiver: '/bin/sh -c node dist/ssr-lab/server/server.mjs',
      outcome: 'ignored, then SIGKILL after the grace period',
    });

    // The committed Dockerfile.ssr uses the exec form: Node is PID 1 and, with its handler, shuts down gracefully.
    const committed = readCmd(dockerfile);
    expect(committed).toEqual({ form: 'exec', argv: ['node', 'dist/ssr-lab/server/server.mjs'] });
    expect(processTree(committed, forking).pid).toBe(1);
    expect(deliverStopSignal(processTree(committed, forking), true).outcome).toBe('graceful shutdown');
    // Without a handler, Node as PID 1 ignores SIGTERM like any other PID 1, as the generated server.ts would.
    expect(deliverStopSignal(processTree(committed, forking), false).outcome).toBe(
      'ignored, then SIGKILL after the grace period',
    );
    // With --init, docker-init is PID 1 and forwards the signal; Node, now PID 2, would end at once without a handler.
    const withInit = processTree(committed, { init: true, shellExecsLastCommand: false });
    expect(withInit.command).toBe('docker-init');
    expect(deliverStopSignal(withInit, false)).toEqual({
      receiver: 'node dist/ssr-lab/server/server.mjs',
      outcome: 'terminated without draining',
    });
    // A shell that execs its lone command (busybox ash does) leaves Node as PID 1: the outcome depends on the shell.
    expect(processTree(shellForm, { init: false, shellExecsLastCommand: true }).command).toBe(
      'node dist/ssr-lab/server/server.mjs',
    );
  });

  it('Section 6: a liveness check that does not render stays healthy while rendering is slow', () => {
    const { timeoutMs, retries, command } = readHealthcheck(dockerfile);
    expect({ timeoutMs, retries }).toEqual({ timeoutMs: 2_000, retries: 3 });
    expect(command).toContain('/livez');
    const liveness = { path: '/livez', renders: false };
    const homePage = { path: '/', renders: true };
    // Under load every render takes 2.5 s, longer than the check's timeout.
    const renderTimes = [2_500, 2_500, 2_500];
    const livenessRuns = renderTimes.map((renderMs) => checkPasses(liveness, renderMs, timeoutMs));
    const homePageRuns = renderTimes.map((renderMs) => checkPasses(homePage, renderMs, timeoutMs));
    expect(healthStatus(livenessRuns, retries)).toBe('healthy');
    // The same container, checked by rendering the home page, is marked unhealthy and would be restarted.
    expect(healthStatus(homePageRuns, retries)).toBe('unhealthy');
    expect(healthStatus([true, false, false], retries)).toBe('healthy');
  });
});
