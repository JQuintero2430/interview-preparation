import { createFrameBatcher, domOps, halveWidthsBatched, halveWidthsThrashing, type WidthOps } from './batchLayout';

/**
 * jsdom has NO layout engine: offsetWidth is 0 and nothing is ever "forced". So these tests cannot
 * measure reflow time. They assert the one thing that is observable and that CAUSES thrashing: the
 * ORDER of reads and writes.
 */
function makeRow(count: number) {
  const parent = document.createElement('div');
  const items = Array.from({ length: count }, (_, i) => {
    const el = document.createElement('div');
    el.id = `i${i}`;
    parent.append(el);
    return el;
  });
  document.body.append(parent);
  return { parent, items };
}

function recordingOps(log: string[]): WidthOps {
  return {
    readWidth: (el) => {
      log.push('read');
      return domOps.readWidth(el);
    },
    writeWidth: (el, px) => {
      log.push('write');
      domOps.writeWidth(el, px);
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

test('thrashing version interleaves read/write; batched version does all reads then all writes', () => {
  const thrash: string[] = [];
  halveWidthsThrashing(makeRow(3).items, recordingOps(thrash));
  expect(thrash).toEqual(['read', 'write', 'read', 'write', 'read', 'write']);

  const batched: string[] = [];
  halveWidthsBatched(makeRow(3).items, recordingOps(batched));
  expect(batched).toEqual(['read', 'read', 'read', 'write', 'write', 'write']);
});

test('both versions produce the same widths (against a stubbed offsetWidth)', () => {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200);
  const a = makeRow(2);
  const b = makeRow(2);

  halveWidthsThrashing(a.items);
  halveWidthsBatched(b.items);

  expect(a.items.map((el) => el.style.width)).toEqual(['100px', '100px']);
  expect(b.items.map((el) => el.style.width)).toEqual(['100px', '100px']);
});

test('elements without a parent are skipped by both versions', () => {
  const orphan = document.createElement('div');
  const log: string[] = [];
  halveWidthsThrashing([orphan], recordingOps(log));
  halveWidthsBatched([orphan], recordingOps(log));
  expect(log).toEqual([]);
});

test('frame batcher runs all measures before all mutations, in one scheduled flush', () => {
  const scheduled: Array<() => void> = [];
  const batcher = createFrameBatcher((flush) => scheduled.push(flush));
  const log: string[] = [];

  batcher.measure(() => log.push('m1'));
  batcher.mutate(() => log.push('w1'));
  batcher.measure(() => log.push('m2'));
  batcher.mutate(() => log.push('w2'));

  expect(scheduled).toHaveLength(1); // one frame callback for four calls
  expect(log).toEqual([]); // nothing runs until the frame
  scheduled[0]?.();
  expect(log).toEqual(['m1', 'm2', 'w1', 'w2']);

  batcher.measure(() => log.push('m3')); // a new batch schedules a new flush
  expect(scheduled).toHaveLength(2);
});
