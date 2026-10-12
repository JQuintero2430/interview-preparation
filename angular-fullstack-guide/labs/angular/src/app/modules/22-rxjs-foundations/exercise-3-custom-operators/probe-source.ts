// Exercise 22.3: a hand-driven source that counts how often it was subscribed and torn down.
import { Observable, Subscriber } from 'rxjs';

export class ProbeSource<T> {
  subscriptions = 0;
  teardowns = 0;
  private readonly subscribers = new Set<Subscriber<T>>();

  readonly source = new Observable<T>((subscriber) => {
    this.subscriptions++;
    this.subscribers.add(subscriber);
    return () => {
      this.teardowns++;
      this.subscribers.delete(subscriber);
    };
  });

  next(value: T): void {
    [...this.subscribers].forEach((subscriber) => subscriber.next(value));
  }

  error(err: unknown): void {
    [...this.subscribers].forEach((subscriber) => subscriber.error(err));
  }

  complete(): void {
    [...this.subscribers].forEach((subscriber) => subscriber.complete());
  }
}
