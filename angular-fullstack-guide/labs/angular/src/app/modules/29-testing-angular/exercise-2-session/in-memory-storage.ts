import { SessionStoragePort } from './session-storage';

/** A fake storage: a working in-memory map that counts the writes it receives. */
export class InMemoryStorage implements SessionStoragePort {
  private readonly data = new Map<string, string>();
  private writeCount = 0;

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.writeCount += 1;
    this.data.set(key, value);
  }

  /** Puts a value in place without counting a write. */
  seed(key: string, value: string): void {
    this.data.set(key, value);
  }

  writes(): number {
    return this.writeCount;
  }
}
