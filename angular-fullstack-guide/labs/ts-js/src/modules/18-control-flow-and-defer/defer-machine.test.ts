// Exercise 18.4 tests: a model of the @defer state rules of module 18, not Angular's runtime.
import { describe, expect, it } from "vitest";
import {
  type Clock,
  createDeferMachine,
  type DeferConfig,
  type DeferMachine,
  type DeferState,
} from "./defer-machine";

/** A clock that only moves when the test says so: no real timer is ever started. */
class FakeClock implements Clock {
  private time = 0;
  private nextId = 0;
  private readonly timers = new Map<number, { at: number; run: () => void }>();

  now(): number {
    return this.time;
  }

  setTimeout(callback: () => void, ms: number): () => void {
    const id = this.nextId++;
    this.timers.set(id, { at: this.time + ms, run: callback });
    return () => {
      this.timers.delete(id);
    };
  }

  /** Moves time forward one millisecond at a time, running each due timer at its own instant. */
  advance(ms: number, afterEachMs?: () => void): void {
    for (let step = 0; step < ms; step++) {
      this.time += 1;
      for (const [id, timer] of [...this.timers]) {
        if (timer.at <= this.time) {
          this.timers.delete(id);
          timer.run();
        }
      }
      afterEachMs?.();
    }
  }
}

const config = (overrides: Partial<DeferConfig> = {}): DeferConfig => ({
  afterMs: 0,
  loadingMinimumMs: 0,
  placeholderMinimumMs: 0,
  ...overrides,
});

const rank: Record<DeferState, number> = { placeholder: 0, loading: 1, complete: 2, error: 3 };

/** Records every state the machine shows after each millisecond of a run. */
function sampler(machine: DeferMachine): { seen: DeferState[]; sample: () => void } {
  const seen: DeferState[] = [machine.state()];
  return { seen, sample: () => seen.push(machine.state()) };
}

describe("E18.4 A model of the defer state machine", () => {
  it("states only move forward (Placeholder, Loading, Complete, Error)", () => {
    const scripts: ReadonlyArray<ReadonlyArray<readonly [number, "trigger" | "loaded" | "failed"]>> = [
      [[5, "trigger"], [60, "loaded"], [90, "failed"], [120, "trigger"]],
      [[5, "trigger"], [20, "failed"], [30, "loaded"], [40, "trigger"]],
      [[5, "loaded"], [10, "trigger"], [15, "trigger"], [160, "loaded"]],
      [[1, "trigger"], [2, "loaded"], [3, "failed"], [4, "loaded"]],
    ];
    for (const script of scripts) {
      const clock = new FakeClock();
      const machine = createDeferMachine(
        config({ afterMs: 30, loadingMinimumMs: 50, placeholderMinimumMs: 8 }),
        clock,
      );
      const { seen, sample } = sampler(machine);
      for (const [at, action] of script) {
        clock.advance(at - clock.now(), sample);
        machine[action]();
        sample();
      }
      clock.advance(200, sample);
      const ranks = seen.map((state) => rank[state]);
      expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
      expect(machine.state()).not.toBe("placeholder");
    }
  });

  it("after delays Loading and a load that completes first never enters Loading", () => {
    const clock = new FakeClock();
    const slow = createDeferMachine(config({ afterMs: 50 }), clock);
    slow.trigger();
    clock.advance(49);
    expect(slow.state()).toBe("placeholder");
    clock.advance(1);
    expect(slow.state()).toBe("loading");

    const quickClock = new FakeClock();
    const quick = createDeferMachine(config({ afterMs: 50 }), quickClock);
    const { seen, sample } = sampler(quick);
    quick.trigger();
    quickClock.advance(20, sample);
    quick.loaded();
    sample();
    quickClock.advance(200, sample);
    expect(quick.state()).toBe("complete");
    expect(seen).not.toContain("loading");
  });

  it("loadingMinimumMs holds Loading and the completion is applied at its end", () => {
    const clock = new FakeClock();
    const machine = createDeferMachine(config({ loadingMinimumMs: 100 }), clock);
    machine.trigger();
    expect(machine.state()).toBe("loading");
    clock.advance(30);
    machine.loaded();
    clock.advance(69);
    expect(machine.state()).toBe("loading");
    clock.advance(1);
    expect(machine.state()).toBe("complete");
  });

  it("the highest-ranked request waiting during a freeze applies", () => {
    const heldPlaceholderClock = new FakeClock();
    const held = createDeferMachine(config({ placeholderMinimumMs: 100 }), heldPlaceholderClock);
    const heldRun = sampler(held);
    held.trigger();
    held.loaded();
    held.trigger();
    heldPlaceholderClock.advance(99, heldRun.sample);
    expect(held.state()).toBe("placeholder");
    heldPlaceholderClock.advance(1, heldRun.sample);
    expect(held.state()).toBe("complete");
    expect(heldRun.seen).not.toContain("loading");

    const clock = new FakeClock();
    const machine = createDeferMachine(config({ loadingMinimumMs: 100 }), clock);
    machine.trigger();
    machine.loaded();
    machine.failed();
    clock.advance(100);
    expect(machine.state()).toBe("error");
  });

  it("a failure goes to Error", () => {
    const clock = new FakeClock();
    const machine = createDeferMachine(config({ afterMs: 50 }), clock);
    const { seen, sample } = sampler(machine);
    machine.trigger();
    clock.advance(10, sample);
    machine.failed();
    sample();
    clock.advance(200, sample);
    expect(machine.state()).toBe("error");
    expect(seen).not.toContain("loading");
  });

  it("placeholderMinimumMs holds the placeholder before Loading", () => {
    const clock = new FakeClock();
    const machine = createDeferMachine(config({ placeholderMinimumMs: 80 }), clock);
    clock.advance(10);
    machine.trigger();
    clock.advance(69);
    expect(machine.state()).toBe("placeholder");
    clock.advance(1);
    expect(machine.state()).toBe("loading");

    const lateClock = new FakeClock();
    const late = createDeferMachine(config({ placeholderMinimumMs: 80 }), lateClock);
    lateClock.advance(100);
    late.trigger();
    expect(late.state()).toBe("loading");
  });
});
