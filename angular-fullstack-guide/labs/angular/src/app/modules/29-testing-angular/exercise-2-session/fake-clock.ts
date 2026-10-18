import { Clock } from './clock';

/** A fake clock: it only moves when the test calls `advance`. */
export class FakeClock implements Clock {
  private current = 1_000_000;

  now(): number {
    return this.current;
  }

  advance(ms: number): void {
    this.current += ms;
  }
}
