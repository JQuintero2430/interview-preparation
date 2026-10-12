import { TestScheduler } from 'rxjs/testing';
import { allFormFlows, saveFlow, searchFlow, submitFlow, thumbnailFlow, type Flow } from './flows';

type FlowSet = Record<'search' | 'save' | 'submit' | 'thumbnail', Flow>;

// The text solution and its `map` + `All` alternative must pass every test below.
const FLOW_SETS: Record<string, FlowSet> = {
  'switchMap, concatMap, exhaustMap and mergeMap': {
    search: searchFlow,
    save: saveFlow,
    submit: submitFlow,
    thumbnail: thumbnailFlow,
  },
  'map followed by the All forms': allFormFlows,
};

const scheduler = () => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('E23.1 choosing a flattening operator', () => {
  it('the search emits only the response for the latest term and unsubscribes the previous request', () => {
    for (const flows of Object.values(FLOW_SETS)) {
      scheduler().run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const slowA = cold('-----A|');
        const fastB = cold('-B|');
        const result = flows.search(hot('a-b|'), (term) => (term === 'a' ? slowA : fastB));
        expectObservable(result).toBe('---B|');
        expectSubscriptions(slowA.subscriptions).toBe('^-!');
        expectSubscriptions(fastB.subscriptions).toBe('--^-!');
      });
    }
  });

  it('every save runs, one at a time, in the order the edits arrived', () => {
    for (const flows of Object.values(FLOW_SETS)) {
      scheduler().run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const saveA = cold('---a|');
        const saveB = cold('---b|');
        const result = flows.save(hot('a-b|'), (edit) => (edit === 'a' ? saveA : saveB));
        expectObservable(result).toBe('---a---b|');
        expectSubscriptions(saveA.subscriptions).toBe('^---!');
        expectSubscriptions(saveB.subscriptions).toBe('----^---!');
      });
    }
  });

  it('a submit while one is running is ignored and the next one after it completes runs', () => {
    for (const flows of Object.values(FLOW_SETS)) {
      scheduler().run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const first = cold('---a|');
        const ignored = cold('---b|');
        const next = cold('---c|');
        const jobs = { a: first, b: ignored, c: next };
        const result = flows.submit(hot<keyof typeof jobs>('a-b---c|'), (click) => jobs[click]);
        expectObservable(result).toBe('---a-----c|');
        expectSubscriptions(first.subscriptions).toBe('^---!');
        expectSubscriptions(ignored.subscriptions).toBe([]);
        expectSubscriptions(next.subscriptions).toBe('------^---!');
      });
    }
  });

  it('thumbnails run at most two at a time and all of them complete', () => {
    for (const flows of Object.values(FLOW_SETS)) {
      scheduler().run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const jobs = { a: cold('---a|'), b: cold('---b|'), c: cold('---c|'), d: cold('---d|') };
        const result = flows.thumbnail(hot<keyof typeof jobs>('abcd|'), (image) => jobs[image]);
        expectObservable(result).toBe('---ab--cd|');
        expectSubscriptions(jobs.a.subscriptions).toBe('^---!');
        expectSubscriptions(jobs.b.subscriptions).toBe('-^---!');
        expectSubscriptions(jobs.c.subscriptions).toBe('----^---!');
        expectSubscriptions(jobs.d.subscriptions).toBe('-----^---!');
      });
    }
  });

  it('each flow completes only after its last inner request completes', () => {
    for (const flows of Object.values(FLOW_SETS)) {
      for (const flow of Object.values(flows)) {
        scheduler().run(({ hot, cold, expectObservable }) => {
          const outer = hot('a|');
          expectObservable(flow(outer, () => cold('----x|'))).toBe('----x|');
        });
      }
    }
  });
});
