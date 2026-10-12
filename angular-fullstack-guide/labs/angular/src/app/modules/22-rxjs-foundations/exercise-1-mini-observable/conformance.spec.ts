import { Observable, filter, map, take } from 'rxjs';
import { MiniObservable, miniFilter, miniMap, miniTake } from './mini-observable';

// --- The structural types both classes satisfy, so one table can drive either of them ---

interface Sink<T> {
  next(value: T): void;
  error(err: unknown): void;
  complete(): void;
  readonly closed: boolean;
}
interface Handle {
  unsubscribe(): void;
  readonly closed: boolean;
}
interface Source<T> {
  subscribe(observer: Partial<Omit<Sink<T>, 'closed'>>): Handle;
}
type Producer<T> = (sink: Sink<T>) => (() => void) | void;
type Op<T, R> = (source: Source<T>) => Source<R>;

interface Kit {
  name: string;
  create<T>(producer: Producer<T>): Source<T>;
  map<T, R>(project: (value: T) => R): Op<T, R>;
  filter<T>(predicate: (value: T) => boolean): Op<T, T>;
  take<T>(count: number): Op<T, T>;
}

const mini = <T>(source: Source<T>) => source as MiniObservable<T>; // every source of miniKit comes from its create
const rx = <T>(source: Source<T>) => source as Observable<T>; // every source of rxjsKit comes from its create

const miniKit: Kit = {
  name: 'MiniObservable',
  create: (producer) => new MiniObservable(producer),
  map: (project) => (source) => mini(source).pipe(miniMap(project)),
  filter: (predicate) => (source) => mini(source).pipe(miniFilter(predicate)),
  take: (count) => (source) => mini(source).pipe(miniTake(count)),
};

const rxjsKit: Kit = {
  name: 'RxJS Observable',
  create: (producer) => new Observable(producer),
  map: (project) => (source) => rx(source).pipe(map(project)),
  filter: (predicate) => (source) => rx(source).pipe(filter(predicate)),
  take: (count) => (source) => rx(source).pipe(take(count)),
};

// --- The contract table: each row is one acceptance criterion, its run and the log it must produce ---

interface Row {
  criterion: string;
  run(kit: Kit): string[];
  expected: string[];
}

const TABLE: Row[] = [
  {
    criterion: 'nothing runs until subscribe, and each subscribe runs the producer again',
    run: (kit) => {
      const log: string[] = [];
      const source = kit.create<number>((sink) => {
        log.push('producer');
        sink.next(1);
        return () => log.push('teardown');
      });
      log.push('created');
      source.subscribe({ next: (v) => log.push(`a${v}`) }).unsubscribe();
      source.subscribe({ next: (v) => log.push(`b${v}`) }).unsubscribe();
      return log;
    },
    expected: ['created', 'producer', 'a1', 'teardown', 'producer', 'b1', 'teardown'],
  },
  {
    criterion: 'values arrive in order and synchronously for a synchronous producer',
    run: (kit) => {
      const log: string[] = [];
      const source = kit.create<number>((sink) => {
        [1, 2, 3].forEach((v) => sink.next(v));
        sink.complete();
      });
      source.subscribe({ next: (v) => log.push(`${v}`), complete: () => log.push('complete') });
      log.push('subscribe returned');
      return log;
    },
    expected: ['1', '2', '3', 'complete', 'subscribe returned'],
  },
  {
    criterion: 'after complete or error no further notification reaches the observer',
    run: (kit) => {
      const log: string[] = [];
      const observer = (tag: string) => ({
        next: (v: number) => log.push(`${tag} next ${v}`),
        error: (e: unknown) => log.push(`${tag} error ${e}`),
        complete: () => log.push(`${tag} complete`),
      });
      kit
        .create<number>((sink) => {
          sink.next(1);
          sink.complete();
          sink.next(2);
          sink.error('late');
          sink.complete();
        })
        .subscribe(observer('c'));
      kit
        .create<number>((sink) => {
          sink.error('boom');
          sink.next(3);
          sink.complete();
        })
        .subscribe(observer('e'));
      return log;
    },
    expected: ['c next 1', 'c complete', 'e error boom'],
  },
  {
    criterion: 'the teardown the producer returns runs once on unsubscribe, on complete and on error',
    run: (kit) => {
      const log: string[] = [];
      const sinks: Array<Sink<number>> = [];
      const held = (tag: string) =>
        kit.create<number>((sink) => {
          sinks.push(sink);
          return () => log.push(`teardown ${tag}`);
        });
      const left = held('unsubscribe').subscribe({});
      held('complete').subscribe({ complete: () => log.push('complete') });
      held('error').subscribe({ error: () => log.push('error') });
      for (let round = 0; round < 2; round++) {
        left.unsubscribe();
        sinks[1].complete();
        sinks[2].error('x');
      }
      return log;
    },
    expected: ['teardown unsubscribe', 'complete', 'teardown complete', 'error', 'teardown error'],
  },
  {
    criterion: 'unsubscribe is idempotent and closed is true afterwards',
    run: (kit) => {
      const log: string[] = [];
      const subscription = kit.create<number>(() => () => log.push('teardown')).subscribe({});
      log.push(`closed ${subscription.closed}`);
      subscription.unsubscribe();
      subscription.unsubscribe();
      log.push(`closed ${subscription.closed}`);
      return log;
    },
    expected: ['closed false', 'teardown', 'closed true'],
  },
  {
    criterion:
      'miniMap, miniFilter and miniTake(n) forward error and complete and unsubscribe the upstream source (the source teardown ran once after miniTake completes)',
    run: (kit) => {
      const log: string[] = [];
      const observer = { next: (v: number) => log.push(`${v}`), error: (e: unknown) => log.push(`error ${e}`), complete: () => log.push('complete') };
      const chain = (source: Source<number>) =>
        kit.take<number>(3)(kit.filter((v: number) => v !== 10)(kit.map((v: number) => v * 10)(source)));

      const counter = kit.create<number>((sink) => {
        let i = 0;
        while (!sink.closed) sink.next(i++);
        return () => log.push('teardown counter');
      });
      chain(counter).subscribe(observer);

      chain(kit.create<number>((sink) => {
        sink.next(1);
        sink.error('boom');
        return () => log.push('teardown failing');
      })).subscribe(observer);

      chain(kit.create<number>((sink) => sink.complete())).subscribe(observer);

      const idle = chain(kit.create<number>(() => () => log.push('teardown idle'))).subscribe(observer);
      idle.unsubscribe();
      return log;
    },
    expected: ['0', '20', '30', 'complete', 'teardown counter', 'error boom', 'teardown failing', 'complete', 'teardown idle'],
  },
];

describe('E22.1 Build an Observable and check it against RxJS', () => {
  describe.each([miniKit, rxjsKit])('$name', (kit) => {
    it.each(TABLE)('$criterion', ({ run, expected }) => {
      expect(run(kit)).toEqual(expected);
    });
  });

  it("the same table passes against RxJS's Observable (the cases run for both classes)", () => {
    expect(TABLE.map((row) => row.run(miniKit))).toEqual(TABLE.map((row) => row.run(rxjsKit)));
    expect(rxjsKit.create(() => undefined)).toBeInstanceOf(Observable);
    expect(miniKit.create(() => undefined)).toBeInstanceOf(MiniObservable);
  });
});
